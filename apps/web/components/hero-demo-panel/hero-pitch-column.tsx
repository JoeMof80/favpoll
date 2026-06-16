"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SCENE_EYEBROWS } from "./scenes"
import { t } from "@/lib/i18n"

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
        {t("landing.headline")}
      </h1>

      <p className="mb-7 max-w-[320px] text-xl leading-relaxed text-muted-foreground">
        {t("landing.subheader")}
      </p>

      <div className="flex items-center gap-3.5">
        <Button asChild size="lg">
          <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/favpolls">See live events →</Link>
        </Button>
      </div>
    </div>
  )
}
