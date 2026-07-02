"use client"

// PROTOTYPE — static reveal-phase snapshot of the hero demo card. The real
// animation loop lives in HeroDemoPanel; variants that win would re-wire it.
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { SCENES } from "@/components/hero-demo-panel/scenes"

export function StaticDemoCard({ className }: { className?: string }) {
  const scene = SCENES[0]
  return (
    <div className={className}>
      <DemoCard
        scene={scene}
        phase="reveal"
        barWidths={scene.results.map((r) => r.widthPercent)}
        prefersReducedMotion
      />
    </div>
  )
}
