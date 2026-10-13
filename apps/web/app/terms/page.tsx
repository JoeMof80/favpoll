import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms — favpoll",
  description: "The terms you agree to when you use favpoll.",
}

// INTERIM, FOUNDER-DRAFTED (2026-09-15), REVISED 2026-10-13. Shipped ahead
// of counsel for the same reason the privacy policy was: favpoll.com is
// live and had NO terms at all, which is worse than terms a solicitor has
// not yet reviewed. Review belongs inside the Part II engagement, not as a
// separate one.
//
// Four things moved between the draft and this page:
//   - the "100% of every pledge reaches the charity" claim was retired on
//     2026-09-06 (processing is met at settlement) and had survived in the
//     draft — see apps/web/lib/card-fee.ts;
//   - consent-first was switched on 2026-10-12, so "no pledge until the
//     charity agrees" is what the product does, not what it intends;
//   - enacted favpolls shipped, so picks can decide an outcome and
//     "nothing is won" has to be argued rather than asserted;
//   - the shared pot and Gift Aid were never covered.
//
// THE MONEY-HOLDING SECTION IS DELIBERATELY UNSPECIFIC about timing. There
// is no disbursement rail yet, and a contractual payout schedule we cannot
// meet is the one mistake these terms must not make.
//
// Source draft, with the [COUNSEL] markers kept:
// references/draft-terms-of-service-2026-09-15.md.

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

function Mail() {
  return (
    <a
      href="mailto:hello@favpoll.com"
      className="text-primary underline-offset-4 hover:underline"
    >
      hello@favpoll.com
    </a>
  )
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-[32px] font-medium tracking-tight text-foreground">
        Terms
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: 13th October 2026
      </p>

      <div className="mt-8 space-y-3 text-[15px] leading-[1.7] text-muted-foreground">
        <p>
          favpoll is operated by Josmo Services Limited, a company registered in
          England and Wales (company no. 11511585), trading as favpoll. By using
          favpoll.com you agree to these terms.
        </p>
      </div>

      <Section title="What favpoll is">
        <p>
          favpoll lets an organiser create a poll of favourites for an occasion
          or a cause. Guests pledge money to a registered charity, pick their
          own favourite, and see where it stands among the others.
        </p>
        <p>
          <strong className="font-medium text-foreground">
            Nothing is won.
          </strong>{" "}
          favpoll is not a raffle, lottery, prize competition or betting
          service. There are no prizes, no odds and no draw, and no guest
          receives anything of value for pledging. Every pledge goes to the
          charity regardless of which favourite leads.
        </p>
        <p>
          On some favpolls the organiser has said in advance that the picks
          decide something on the day — which songs get played, say. That is the
          organiser&rsquo;s own arrangement with their guests. Nothing is won
          from favpoll, and the outcome changes nothing about where the money
          goes.
        </p>
      </Section>

      <Section title="Pledges and money">
        <p>
          A pledge is a gift to the favpoll&rsquo;s chosen registered charity —
          never to the organiser, and never to favpoll.
        </p>
        <p>
          favpoll charges no platform fee and takes nothing from your pledge.
          Payments are processed by Stripe, and the cost of processing is met
          from the pledge at settlement, so a charity receives the pledge less
          its share of processing. favpoll is sustained by optional supporter
          contributions, which are always separate from your pledge.
        </p>
        <p>
          A favpoll cannot accept any pledge until every charity on it has
          agreed to receive them. Until then the pledge button is withheld.
        </p>
        <p>
          Pledges are gifts and are not refundable once made. If something has
          gone wrong with a payment, email <Mail /> and favpoll will put it
          right.
        </p>
        <p>
          Where a favpoll names more than one charity — three at most — the
          proceeds split equally.
        </p>
        <p>
          <strong className="font-medium text-foreground">
            The shared pot.
          </strong>{" "}
          Guests may add to a communal pot so that others can take part without
          paying. Money in the pot is for the favpoll&rsquo;s charities like any
          other pledge; it is never favpoll&rsquo;s, and it is never returned to
          whoever added it. Who used the pot is not shown to anyone.
        </p>
        <p>
          favpoll holds a pledge only to pass it on to the charity it was given
          to. The arrangement by which it does so is being settled, and this
          page will set it out plainly once it is. Until then favpoll does not
          promise a payment timetable it does not control — if you want to know
          where a particular pledge has got to, email <Mail />.
        </p>
      </Section>

      <Section title="Organisers">
        <p>By creating a favpoll you confirm that:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Anything you upload or write is yours to share. If your favpoll is
            about a living person, you have their agreement — including for
            their photo.
          </li>
          <li>
            Your favpoll is honest: the person, occasion and cause are real, and
            anything you write is written in good faith.
          </li>
          <li>
            You will not use favpoll for anything unlawful, hateful or
            deceptive. favpoll may unpublish or remove a favpoll that breaks
            these terms.
          </li>
        </ul>
        <p>
          A favpoll runs for at most 90 days and closes automatically. A closed
          favpoll cannot be edited.
        </p>
      </Section>

      <Section title="Guests">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            One active guest pledge per email address per poll. Signed-in guests
            may pledge more than once.
          </li>
          <li>
            The guest book shows your chosen name and favourite — never your
            amount. You may appear as &ldquo;Someone&rdquo;.
          </li>
          <li>
            The personal note, where there is one, is written by the organiser;
            favpoll is not responsible for its contents.
          </li>
        </ul>
      </Section>

      <Section title="favpoll's part">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            favpoll provides the platform as it is, and works to keep it
            available and secure, but does not guarantee uninterrupted service.
          </li>
          <li>
            favpoll owns the platform; organisers keep ownership of what they
            write and upload, and licence favpoll to display it as part of
            running the favpoll.
          </li>
          <li>
            Favourites feed favpoll&rsquo;s all-time record in anonymised,
            aggregated form.
          </li>
        </ul>
      </Section>

      <Section title="The legal bits">
        <p>
          These terms are governed by the law of England and Wales, and the
          courts of England and Wales have jurisdiction. favpoll may update
          these terms; material changes will be dated at the top of this page.
        </p>
        <p>
          Nothing here affects your rights as a consumer under the law of
          England and Wales.
        </p>
        <p>
          Questions: <Mail />.
        </p>
      </Section>
    </main>
  )
}
