"use client"

import dynamic from "next/dynamic"

export const UserButtonClient = dynamic(
  () => import("@clerk/nextjs").then((mod) => ({ default: mod.UserButton })),
  { ssr: false }
)
