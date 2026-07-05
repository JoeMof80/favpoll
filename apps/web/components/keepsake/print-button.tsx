"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

// The browser's print dialog offers "Save as PDF" everywhere — the
// dependency-free way to a keepsake PDF that also feeds the future
// paid print version (same layout).
export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Printer data-icon="inline-start" aria-hidden="true" />
      Save as PDF
    </Button>
  )
}
