import Link from "next/link"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// "What shines where" (founder, 2026-08-05): the matrix's shine cells
// reshaped for the homepage — three accent-headed columns, each a small
// list of that register's shine phrases. No grid, no muted works-cells,
// no cross-referencing: each column reads in its register's voice. The
// FULL comparison matrix lives on /about (reference, not romance).

const COLUMNS = [
  {
    href: "/memorials",
    label: "Memorials",
    accent: "text-memorial",
    dot: "bg-memorial",
    phrases: [
      "home.matrix.display-tribute.memorial",
      "home.matrix.reveal.memorial",
      "home.matrix.cards.memorial",
      "home.matrix.topics.memorial",
      "home.matrix.wall.memorial",
      "home.matrix.fund.memorial",
    ],
  },
  {
    href: "/celebrations",
    label: "Celebrations",
    accent: "text-warning",
    dot: "bg-warning",
    phrases: [
      "home.matrix.reveal.celebration",
      "home.matrix.cards.celebration",
      "home.matrix.topics.celebration",
      "home.matrix.wall.celebration",
    ],
  },
  {
    href: "/fundraisers",
    label: "Fundraisers",
    accent: "text-success",
    dot: "bg-success",
    phrases: [
      "home.matrix.display-fundraiser.fundraiser",
      "home.matrix.goal.fundraiser",
      "home.matrix.topics.fundraiser",
      "home.matrix.wall.fundraiser",
      "home.matrix.fund.fundraiser",
    ],
  },
] as const

export function RegisterShines() {
  return (
    <section className="w-full bg-primary/5">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <SectionEyebrow className="mb-10">
          {t("home.shines.title")}
        </SectionEyebrow>
        <div className="grid gap-10 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.href}>
              <Link
                href={col.href}
                className={cn(
                  "text-xs font-medium tracking-widest uppercase",
                  col.accent
                )}
              >
                {col.label} →
              </Link>
              <ul className="mt-4 space-y-2.5">
                {col.phrases.map((key) => (
                  <li key={key} className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        col.dot
                      )}
                    />
                    <span className="text-base text-foreground">
                      {t(key as never)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground italic">
          {t("home.matrix.norules")}
        </p>
      </div>
    </section>
  )
}
