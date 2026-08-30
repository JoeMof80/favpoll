"use client"

// PROTOTYPE (2026-08-30) — register colour system. Throwaway route.
// Every variant of a real page, side by side, plus the measured contrast
// pairs from generate.mjs. Dev-only.

import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { REGISTER_VARIANTS } from "@/components/prototype-register-switcher"
import contrast from "./contrast.json"

const PRESETS = [
  [
    "Donald — memorial favpoll",
    "/favpolls/70f84aa8-9181-4932-91cc-1f24fc4d16e6",
  ],
  [
    "Madge — favpoll, no photo",
    "/favpolls/b752302e-c31a-4331-8299-db20442c45a3",
  ],
  ["Home", "/"],
  ["/memorials", "/memorials"],
  ["/celebrations", "/celebrations"],
  ["/fundraisers", "/fundraisers"],
  ["/favpolls shelf", "/favpolls"],
  ["/my-favpolls", "/my-favpolls"],
] as const

const WIDTHS = [
  { label: "Phone 390", w: 390, h: 844, scale: 1 },
  { label: "Desktop 1280 @ ½", w: 1280, h: 1400, scale: 0.5 },
] as const

type Report = Record<
  string,
  {
    h: number
    c: number
    pL: number
    dL: number
    label: string
    contrast: Record<
      "light" | "dark",
      { name: string; ratio: number; floor: number; pass: boolean }[]
    >
  }
>

export default function RegisterColoursPrototype() {
  const [path, setPath] = useState<string>(PRESETS[0][1])
  const [size, setSize] = useState<(typeof WIDTHS)[number]>(WIDTHS[0])
  const { resolvedTheme, setTheme } = useTheme()
  const report = contrast as Report

  if (process.env.NODE_ENV === "production") return null

  return (
    <div className="min-h-screen bg-neutral-950 p-6 font-mono text-sm text-neutral-100">
      <h1 className="text-lg">
        PROTOTYPE · register colour system — the real page in every variant
      </h1>
      <p className="mt-1 text-neutral-400">
        Each frame is the live app with <code>?variant=</code> set. The theme
        toggle flips every frame (next-themes syncs through storage). The
        variants differ ONLY in hue, chroma, primary lightness and dark
        background lightness — everything else is today&apos;s recipe.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {PRESETS.map(([label, p]) => (
          <Button
            key={p}
            type="button"
            size="sm"
            variant={path === p ? "default" : "outline"}
            onClick={() => setPath(p)}
          >
            {label}
          </Button>
        ))}
        <span className="mx-2 h-5 w-px bg-neutral-700" aria-hidden="true" />
        {WIDTHS.map((s) => (
          <Button
            key={s.label}
            type="button"
            size="sm"
            variant={size.label === s.label ? "default" : "outline"}
            onClick={() => setSize(s)}
          >
            {s.label}
          </Button>
        ))}
        <span className="mx-2 h-5 w-px bg-neutral-700" aria-hidden="true" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          Theme: {resolvedTheme ?? "…"} — flip
        </Button>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {REGISTER_VARIANTS.map((v) => (
          <figure key={v.key} className="shrink-0">
            <figcaption className="mb-2 text-neutral-300">
              {v.key} — {v.label}
            </figcaption>
            <div
              className="overflow-hidden rounded-lg border border-neutral-700 bg-white"
              style={{
                width: size.w * size.scale,
                height: size.h * size.scale,
              }}
            >
              <iframe
                title={v.label}
                src={`${path}?variant=${v.key}`}
                width={size.w}
                height={size.h}
                style={{
                  width: size.w,
                  height: size.h,
                  transform: `scale(${size.scale})`,
                  transformOrigin: "top left",
                  border: 0,
                }}
              />
            </div>
          </figure>
        ))}
      </div>

      <h2 className="mt-8 text-base">
        Measured contrast (WCAG: 4.5 text · 3 non-text)
      </h2>
      <p className="mt-1 text-neutral-400">
        The memorial row IS today&apos;s brand — its two failures are the
        baseline, not the prototype&apos;s. Numbers from generate.mjs.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-neutral-800 px-2 py-1 text-left">
                pair
              </th>
              {Object.keys(report).map((k) => (
                <th
                  key={k}
                  className="border border-neutral-800 px-2 py-1 text-left"
                >
                  {k}
                  <div className="font-normal text-neutral-500">
                    h {report[k]!.h} · c {report[k]!.c} · L {report[k]!.pL} /
                    dark {report[k]!.dL}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(["light", "dark"] as const).map((theme) =>
              report.memorial!.contrast[theme].map((pair, i) => (
                <tr key={`${theme}-${i}`}>
                  <td className="border border-neutral-800 px-2 py-1 text-neutral-400">
                    {theme} · {pair.name}{" "}
                    <span className="text-neutral-600">≥ {pair.floor}</span>
                  </td>
                  {Object.keys(report).map((k) => {
                    const cell = report[k]!.contrast[theme][i]!
                    return (
                      <td
                        key={k}
                        className={`border border-neutral-800 px-2 py-1 ${cell.pass ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {cell.ratio.toFixed(2)}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
