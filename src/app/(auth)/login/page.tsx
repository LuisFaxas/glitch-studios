"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod/v4"
import { toast } from "sonner"
import { signIn } from "@/lib/auth-client"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as "email" | "password"
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    try {
      const { error, data } = await signIn.email({ email, password })
      if (error) {
        console.error("Sign-in error:", error)
        toast.error("Invalid email or password. Please try again.")
      } else {
        const role = data?.user?.role
        router.push(role === "admin" || role === "owner" ? "/admin" : "/dashboard")
        router.refresh()
      }
    } catch {
      toast.error("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <GlitchLogo size="md" />
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-white">
          Sign In
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-white underline underline-offset-4 hover:text-pure-white"
        >
          Create Account
        </Link>
      </p>
    </div>
  )
}
