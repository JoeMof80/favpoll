import Link from "next/link"
import { Button } from "@/components/ui/button"

// The gatekeeper section — for the professionals a register page is
// FORWARDED BY (celebrants, funeral directors, planners, charities).
// Extracted from /memorial 2026-09-05 when the founder normalised the
// registers: the B2B thesis spans all three, each naming its own
// professionals. The CTA goes to About's contact form rather than the
// old raw mailto — one fewer exposed inbox, and enquiries arrive
// through the form.
export function ProSection({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta: string
}) {
  return (
    <section className="w-full bg-primary/5">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mb-6 max-w-2xl leading-relaxed text-muted-foreground">
          {body}
        </p>
        <Button asChild variant="outline">
          <Link href="/about#contact">{cta}</Link>
        </Button>
      </div>
    </section>
  )
}
