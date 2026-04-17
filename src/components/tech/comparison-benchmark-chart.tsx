"use client"

import dynamic from "next/dynamic"
import { useReducedMotion } from "motion/react"
import type { PublicBenchmarkRun, PublicProductForCompare } from "@/lib/tech/queries"
import { computeBenchmarkWinner, type BenchmarkRow } from "@/lib/tech/winners"

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
)
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false })
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false })
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false })
const LabelList = dynamic(() => import("recharts").then((m) => m.LabelList), { ssr: false })

interface ComparisonBenchmarkChartProps {
  testName: string
  unit: string
  direction: "higher_is_better" | "lower_is_better"
  products: PublicProductForCompare[]
  runs: PublicBenchmarkRun[]
}

export function ComparisonBenchmarkChart({ testName, unit, direction, products, runs }: ComparisonBenchmarkChartProps) {
  const shouldReduceMotion = useReducedMotion()

  const row: BenchmarkRow = {
    testName,
    unit,
    direction,
    cells: runs.map((r) => ({ productId: r.productId, score: r.score })),
  }
  const winnerId = computeBenchmarkWinner(row)

  const data = products
    .map((p) => {
      const run = runs.find((r) => r.productId === p.id)
      if (!run) return null
      return {
        productId: p.id,
        productName: p.name.length > 24 ? p.name.slice(0, 21) + "…" : p.name,
        score: run.score,
        scoreLabel: `${run.score.toLocaleString()} ${unit}`,
      }
    })
    .filter(Boolean) as Array<{ productId: string; productName: string; score: number; scoreLabel: string }>

  if (data.length < 1) return null

  return (
    <div
      role="img"
      aria-label={`Bar chart showing ${testName} scores for ${data.map((d) => `${d.productName} ${d.score}`).join(", ")}`}
      className="border border-[#222] bg-[#111] p-4 md:p-6"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          {testName}
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#555]">
          {direction === "higher_is_better" ? "Higher is better" : "Lower is better"}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 64, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#222" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            stroke="#555"
            tick={{ fontFamily: "monospace", fontSize: 11, fill: "#888" }}
            axisLine={{ stroke: "#222" }}
          />
          <YAxis
            type="category"
            dataKey="productName"
            stroke="#555"
            tick={{ fontFamily: "monospace", fontSize: 11, fill: "#888" }}
            axisLine={{ stroke: "#222" }}
            width={160}
          />
          <Bar dataKey="score" isAnimationActive={!shouldReduceMotion} animationDuration={600}>
            {data.map((d) => (
              <Cell key={d.productId} fill={d.productId === winnerId ? "#f5f5f0" : "#555555"} />
            ))}
            <LabelList
              dataKey="scoreLabel"
              position="right"
              fill="#f5f5f0"
              style={{ fontFamily: "monospace", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
