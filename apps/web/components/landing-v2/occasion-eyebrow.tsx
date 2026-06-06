"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { OCCASIONS } from "./example"

export function OccasionEyebrow() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % OCCASIONS.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`occasion-${index}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <SectionEyebrow>{OCCASIONS[index]}</SectionEyebrow>
      </motion.div>
    </AnimatePresence>
  )
}
