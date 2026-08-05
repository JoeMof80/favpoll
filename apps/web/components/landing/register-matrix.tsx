import Link from "next/link"
import {
  HeartHandshake,
  ListChecks,
  QrCode,
  Quote,
  Target,
  Tv,
  Users,
} from "lucide-react"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// Feature × register matrix (founder, 2026-08-05): PHRASES, not ticks —
// every cell says how the feature lives in that register, nothing is
// crossed out anywhere, and "shine" cells simply carry more weight (a
// register-accent dot + foreground ink) than "works" cells (muted).
// The no-rules line beneath is the section's actual message. Column
// heads deep-link to the register pages in their accents.

type Shine = 0 | 1

const FEATURES: { key: string; icon: typeof Tv; fit: [Shine, Shine, Shine] }[] =
  [
    { key: "display", icon: Tv, fit: [1, 0, 1] },
    { key: "reveal", icon: Quote, fit: [1, 1, 0] },
    { key: "goal", icon: Target, fit: [0, 0, 1] },
    { key: "cards", icon: QrCode, fit: [1, 1, 0] },
    { key: "topics", icon: ListChecks, fit: [1, 1, 1] },
    { key: "wall", icon: Users, fit: [1, 1, 1] },
    { key: "fund", icon: HeartHandshake, fit: [1, 0, 1] },
  ]

const REGISTERS = [
  {
    key: "memorial",
    href: "/memorials",
    label: "Memorials",
    accent: "text-memorial",
    dot: "bg-memorial",
    col: "bg-memorial-muted/50",
  },
  {
    key: "celebration",
    href: "/celebrations",
    label: "Celebrations",
    accent: "text-warning",
    dot: "bg-warning",
    col: "bg-warning-muted/60",
  },
  {
    key: "fundraiser",
    href: "/fundraisers",
    label: "Fundraisers",
    accent: "text-success",
    dot: "bg-success",
    col: "bg-success/8",
  },
] as const

export function RegisterMatrix() {
  return (
    <section className="w-full bg-primary/5">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <SectionEyebrow className="mb-8">
          {t("home.matrix.title" as never)}
        </SectionEyebrow>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left">
            <thead>
              <tr>
                <th className="w-1/4 pb-4 align-bottom">
                  <span className="text-xs font-medium tracking-widest text-primary uppercase">
                    {t("home.matrix.feature")}
                  </span>
                </th>
                {REGISTERS.map((reg) => (
                  <th
                    key={reg.key}
                    className={cn("w-1/4 px-4 pt-4 pb-4 align-bottom", reg.col)}
                  >
                    <Link
                      href={reg.href}
                      className={cn(
                        "text-xs font-medium tracking-widest uppercase",
                        reg.accent
                      )}
                    >
                      {reg.label} →
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr
                  key={feature.key}
                  className="border-t border-border transition-colors hover:bg-background/70"
                >
                  <th className="py-3.5 pr-4 text-sm font-medium text-foreground">
                    <span className="flex items-center gap-2.5">
                      <feature.icon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-primary-muted"
                      />
                      {t(`home.matrix.${feature.key}.label` as never)}
                    </span>
                  </th>
                  {REGISTERS.map((reg, i) => {
                    const shine = feature.fit[i] === 1
                    return (
                      <td
                        key={reg.key}
                        className={cn("px-4 py-3.5 text-sm", reg.col)}
                      >
                        <span
                          className={cn(
                            "inline-flex items-baseline gap-1.5",
                            shine
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {shine && (
                            <span
                              aria-hidden="true"
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 self-center rounded-full",
                                reg.dot
                              )}
                            />
                          )}
                          {t(`home.matrix.${feature.key}.${reg.key}` as never)}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-muted-foreground italic">
          {t("home.matrix.norules" as never)}
        </p>
      </div>
    </section>
  )
}
