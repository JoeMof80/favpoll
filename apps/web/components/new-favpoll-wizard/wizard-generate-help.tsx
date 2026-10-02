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
// end; two panels. The copy is organiser-facing and the founder's to
// edit before it ships. GRAPHIC SLOTS are marked below: today each panel
// shows the icons the menu already uses with a sample line under each;
// a drawn strip (the who panel) and a drawn card pair (the switch panel)
// can replace them without touching the copy.

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
            The Story is written in a voice, and the voice is the pronoun. Pick
            who this favpoll is for and Generate writes it their way.
          </p>
          {/* GRAPHIC SLOT: a drawn "voice" strip could stand here — the
              figures with their sample line beneath each. */}
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
            Most favpolls end in a reveal: guests pick, and after pledging they
            see the honoured one&rsquo;s own favourite. On some nights the picks
            decide something instead. The switch tells Generate which to write.
          </p>
          {/* GRAPHIC SLOT: a drawn card pair, reveal and outcome, the
              same favpoll both ways. */}
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
