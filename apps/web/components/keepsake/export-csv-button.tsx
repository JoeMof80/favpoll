"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  buildKeepsakeCsv,
  keepsakeCsvFilename,
  type KeepsakeCsvInput,
} from "@/lib/keepsake-csv"

// Organiser/charity records: the keepsake's data as a CSV download.
// Client-side blob — the page already holds everything exportable.
export function ExportCsvButton({ data }: { data: KeepsakeCsvInput }) {
  function download() {
    const blob = new Blob([buildKeepsakeCsv(data)], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = keepsakeCsvFilename(data.name)
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="ghost" size="sm" onClick={download}>
      <Download data-icon="inline-start" aria-hidden="true" />
      Export CSV
    </Button>
  )
}
