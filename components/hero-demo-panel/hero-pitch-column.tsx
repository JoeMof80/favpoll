"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SCENE_EYEBROWS } from "./scenes"

type Props = {
  sceneIndex: number
}

export function HeroPitchColumn({ sceneIndex }: Props) {
  const eyebrow = SCENE_EYEBROWS[sceneIndex]

  return (
    <div
      className="flex flex-col justify-center px-9 py-11"
      style={{ flex: "1.05", borderRight: "0.5px solid var(--border)" }}
    >
      {/* Eyebrow — updates with scene */}
      <div className="mb-2 h-3.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`eyebrow-${sceneIndex}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
          </motion.div>
        </AnimatePresence>
      </div>

      <h1 className="mb-[1.1rem] text-5xl leading-[1.15] font-light tracking-tight text-foreground">
        Introducing a new way to
        <br />
        <span className="font-medium">honour them.</span>
      </h1>

      <p className="mb-7 max-w-[320px] text-xl leading-relaxed text-muted-foreground">
        Expressions of joy, for charitable causes, in the name of those we
        love.
      </p>

      <div className="flex items-center gap-3.5">
        <Button asChild size="lg">
          <Link href="/events/new">Create an event</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/events">See live events →</Link>
        </Button>
      </div>
    </div>
  )
}
