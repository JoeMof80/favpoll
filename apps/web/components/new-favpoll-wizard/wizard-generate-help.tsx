"use client"

import { InfoIcon, Mars, NonBinary, User, Venus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { GroupIcon, PairIcon } from "@/components/icons/people"

// WHY GENERATE ASKS (founder, 2026-10-02: "we need an instruction icon
// popup … graphics to describe why we need pronouns here and why we
// need to know the shape of the favpoll"). One info icon at the group's
// end; two panels.
//
// COPY PASS 2026-10-07. Two things were wrong rather than merely rough.
// "The honoured one's own favourite" quantified HONOUR over every
// favpoll, which the brand rules forbid (a cause favpoll honours nobody),
// and the panel mixed the two vocabularies: the ACT is a reveal, which is
// what the Generate button beside it already says, and the ARTEFACT is
// the personal note, which is what every public surface calls it.
//
// THE GRAPHICS ARE DELIBERATELY NOT DRAWINGS. The founder asked for
// graphics; what each panel needs is an EXAMPLE, and an example reads
// faster than an illustration at this size. The voice strip shows the six
// menu icons with the line each one produces; the card pair shows one
// favpoll written both ways. Both are the real vocabulary, not a picture
// of it, and they stay correct when the copy changes. If a drawn strip or
// a drawn card pair is wanted later it can replace either block without
// touching a word.

const VOICES: {
  Icon: React.ElementType
  who: string
  line: string
}[] = [
  { Icon: User, who: "I", line: "my favourite will be revealed" },
  { Icon: Mars, who: "He", line: "his favourite will be revealed" },
  { Icon: Venus, who: "She", line: "her favourite will be revealed" },
  { Icon: NonBinary, who: "They", line: "their favourite will be revealed" },
  { Icon: PairIcon, who: "Pair", line: "the first dance will be revealed" },
  { Icon: GroupIcon, who: "Group", line: "the team's will be revealed" },
]

export function WizardGenerateHelp() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Why Generate asks who, and what the picks decide"
          className="px-2 text-muted-foreground hover:text-foreground"
        >
          <InfoIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-5 text-sm">
        <section className="space-y-2">
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Who
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            The Story needs a voice. Pick who this favpoll is for and Generate
            writes it their way. Pick I and it writes as you.
          </p>
          {/* THE GRAPHIC: the six menu icons with the line each produces,
              so the choice and its consequence sit on one row. */}
          <ul className="space-y-1.5">
            {VOICES.map(({ Icon, who, line }) => (
              <li key={who} className="flex items-center gap-2.5">
                <Icon
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="w-10 shrink-0 font-medium">{who}</span>
                <span className="truncate text-muted-foreground">{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            What the picks decide
          </h3>
          <p className="leading-relaxed text-muted-foreground">
            Most favpolls end in a reveal. Guests pick, and once they have
            pledged they see the favourite the favpoll was holding. On some
            nights the picks decide something instead, and the night follows the
            result. The switch tells Generate which one to write.
          </p>
          {/* THE GRAPHIC: one favpoll written both ways, so the switch is
              shown rather than described. */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border p-2.5">
              <p className="mb-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Reveal
              </p>
              <p className="leading-snug">
                Pick your favourite cheese; Gran&rsquo;s will be revealed.
              </p>
            </div>
            <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5">
              <p className="mb-1 text-[10px] font-medium tracking-widest text-primary uppercase">
                Outcome
              </p>
              <p className="leading-snug">
                Pick your favourite cheese; the top five are the board on the
                night.
              </p>
            </div>
          </div>
        </section>
      </PopoverContent>
    </Popover>
  )
}
