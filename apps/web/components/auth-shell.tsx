// Shared shell for /sign-in and /sign-up (founder, 2026-09-09: "they
// should look more-or-less the same") — the two pages had drifted: one
// centred on a wash, the other two-column on white. One shell now: the
// same pitch panel (hidden below lg, so both pages are an identical
// centred card on mobile), the same wash, the card slotting in beside.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid flex-1 bg-muted lg:grid-cols-2">
      <div className="hidden flex-1 items-center justify-end p-10 lg:flex">
        <div className="max-w-sm space-y-8">
          <div>
            <span className="text-base font-medium text-primary">favpoll</span>
          </div>
          <ul className="space-y-7">
            {[
              {
                heading: "Honour the people you love",
                body: "Create a poll for a memorial, birthday, or retirement \u2014 and turn your guests\u2019 favourites into a lasting tribute.",
              },
              {
                heading: "Every pledge goes to charity",
                body: "You pick the charity. Guests make pledges split across their answers. Nothing is kept.",
              },
              {
                heading: "A permanent record of favourites",
                body: "Each favpoll feeds the record of human favourites \u2014 a gentle, growing picture of what people love.",
              },
            ].map((item) => (
              <li key={item.heading}>
                <p className="text-sm font-medium text-foreground">
                  {item.heading}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 md:p-10 lg:justify-start">
        {children}
      </div>
    </div>
  )
}
