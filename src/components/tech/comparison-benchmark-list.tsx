"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ComparisonBenchmarkChart } from "./comparison-benchmark-chart"
import type { PublicBenchmarkRun, PublicProductForCompare } from "@/lib/tech/queries"

interface GroupedTest {
  testId: string
  testName: string
  unit: string
  direction: "higher_is_better" | "lower_is_better"
  runs: PublicBenchmarkRun[]
}

function groupByTest(products: PublicProductForCompare[], runs: PublicBenchmarkRun[]): GroupedTest[] {
  const byTest = new Map<string, GroupedTest>()
  for (const r of runs) {
    const existing = byTest.get(r.testId)
    if (existing) {
      existing.runs.push(r)
    } else {
      byTest.set(r.testId, {
        testId: r.testId,
        testName: r.testName,
        unit: r.unit,
        direction: r.direction,
        runs: [r],
      })
    }
  }
  const productIds = new Set(products.map((p) => p.id))
  return Array.from(byTest.values())
    .filter((g) => g.runs.filter((r) => productIds.has(r.productId)).length >= 2)
    .map((g) => ({
      ...g,
      runs: g.runs.filter((r) => productIds.has(r.productId)),
    }))
}

interface ComparisonBenchmarkListProps {
  products: PublicProductForCompare[]
  runs: PublicBenchmarkRun[]
}

export function ComparisonBenchmarkList({ products, runs }: ComparisonBenchmarkListProps) {
  const tests = groupByTest(products, runs)

  if (tests.length === 0) {
    return (
      <div className="border border-[#222] bg-[#111] p-8 text-center">
        <h3 className="font-mono text-lg font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          No shared benchmarks
        </h3>
        <p className="mt-2 font-sans text-[13px] text-[#888]">
          These products don&apos;t share any benchmark tests yet.
        </p>
      </div>
    )
  }

  const eager = tests.slice(0, 3)
  const lazy = tests.slice(3)

  return (
    <div className="flex flex-col gap-4">
      {eager.map((t) => (
        <ComparisonBenchmarkChart
          key={t.testId}
          testName={t.testName}
          unit={t.unit}
          direction={t.direction}
          products={products}
          runs={t.runs}
        />
      ))}
      {lazy.map((t) => (
        <LazyChartWrapper key={t.testId}>
          <ComparisonBenchmarkChart
            testName={t.testName}
            unit={t.unit}
            direction={t.direction}
            products={products}
            runs={t.runs}
          />
        </LazyChartWrapper>
      ))}
    </div>
  )
}

function LazyChartWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ minHeight: 240 }}>
      {visible ? children : <Skeleton className="h-[240px] w-full border border-[#222] bg-[#111]" />}
    </div>
  )
}
