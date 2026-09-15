import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy — favpoll",
  description: "How favpoll handles your data.",
}

// INTERIM, FOUNDER-REVIEWED (2026-09-15). Shipped ahead of counsel
// because Google's Auth Platform requires a privacy policy URL to
// publish the OAuth app to production — and without that, strangers
// cannot sign in with Google at all. Counsel (Bates Wells or Stone
// King — engagement undecided) polishes this inside the engagement;
// interim positions taken: six-year accounting retention, generic UK
// transfer-safeguards wording, essential-cookies-only (verified: no
// analytics run in production). The entity disclosure here is the
// deliberate, forced bend of the founder's no-disclosure rule — a
// privacy notice must name its controller.
// Source draft: references/draft-privacy-policy-2026-09-15.md.

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-[22px] font-medium tracking-tight text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-[1.7] text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-[32px] font-medium tracking-tight text-foreground">
        Privacy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: 15th September 2026
      </p>

      <div className="mt-8 space-y-3 text-[15px] leading-[1.7] text-muted-foreground">
        <p>
          favpoll is operated by Josmo Services Limited, a company registered in
          England and Wales (company no. 11511585), trading as favpoll.
        </p>
        <p>
          If you have any question about your data, contact{" "}
          <a
            href="mailto:hello@favpoll.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@favpoll.com
          </a>
          .
        </p>
      </div>

      <Section title="What favpoll collects">
        <p className="font-medium text-foreground">
          If you create a favpoll (an organiser):
        </p>
        <p>
          Your account — name and email address, held by our sign-in provider
          (Clerk). If you sign in with Google, Google shares your name, email
          and profile photo with us.
        </p>
        <p>
          What you write and upload — the favpoll&rsquo;s about text, the
          reveal, and any photo. If your favpoll is about another living person,
          you are responsible for having their agreement to share their photo
          and details.
        </p>
        <p className="font-medium text-foreground">If you pledge (a guest):</p>
        <p>
          Your email address, the name you choose to display, the favourite you
          pick and the amount you pledge. You can appear in the guest book as
          &ldquo;Someone&rdquo; instead of your name. The guest book shows names
          and favourites — never what any one person gave.
        </p>
        <p className="font-medium text-foreground">Payments:</p>
        <p>
          Payments are processed by Stripe. favpoll never sees or stores your
          card number. favpoll keeps a record of each payment (amount,
          reference) so every pledge can be accounted for and passed to the
          charity.
        </p>
        <p className="font-medium text-foreground">Technical:</p>
        <p>
          Like every website, our hosting providers record standard technical
          logs (IP address, browser type) to run and secure the service. favpoll
          uses essential cookies only — the ones that keep you signed in. There
          is no advertising or analytics tracking.
        </p>
      </Section>

      <Section title="What favpoll does with it">
        <p>
          Runs your favpoll: showing the poll, the standings and the guest book,
          and delivering the reveal after a pledge. Passes what is raised to the
          chosen registered charity, in full. Sends service emails, such as
          confirming a pledge — favpoll does not send marketing email. Adds your
          favourite — anonymised, with no name attached — to favpoll&rsquo;s
          all-time record of favourites.
        </p>
        <p>
          The lawful bases for this are performing our contract with you
          (running the favpoll and processing your pledge) and our legitimate
          interests (keeping the service secure, and reconciling payments so
          every pledge reaches its charity).
        </p>
      </Section>

      <Section title="Who favpoll shares it with">
        <p>
          Stripe (payment processing), Clerk (sign-in), Vercel (hosting) and
          Supabase (database) process data on favpoll&rsquo;s behalf. Where a
          provider is based outside the UK, transfers are protected by the
          UK&rsquo;s international data transfer safeguards.
        </p>
        <p>
          Charities receive what their favpoll raised. They do not receive guest
          email addresses. Nobody else — favpoll does not sell or rent data.
        </p>
      </Section>

      <Section title="How long favpoll keeps it">
        <p>
          Your account: until you delete it. Pledge and payment records: six
          years, as required for accounting. A closed favpoll stays visible as a
          keepsake unless the organiser deletes it.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Pledging requires a payment, which requires an adult. A shared pot
          lets someone take part without paying — if a child does so, the name
          shown is chosen by the adult supervising them.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask for a copy of your data, ask for it to be corrected or
          deleted, and object to how it&rsquo;s used — email{" "}
          <a
            href="mailto:hello@favpoll.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@favpoll.com
          </a>{" "}
          and favpoll will respond within a month. You can also complain to the
          Information Commissioner&rsquo;s Office at{" "}
          <a
            href="https://ico.org.uk"
            className="text-primary underline-offset-4 hover:underline"
          >
            ico.org.uk
          </a>
          .
        </p>
      </Section>
    </main>
  )
}
