// THE FOCUS INDICATOR FOR A FIELD WITH NO CHROME.
//
// Seven inputs across the app are styled as inline text — the pledge picker's
// search and add fields, the two pledge figures, the checkout email, the
// wizard's topic and charity searches and its add field, the seed-fund
// amount. They carry `outline-none` because a box is exactly what their
// design is avoiding, and cf836977 gave each a focus-visible RING so a
// keyboard user could still see where they were.
//
// THE RING WAS THE WRONG SHAPE (founder, 2026-10-25: it "looks terrible").
// It drew a rectangle in surfaces built on the absence of them, and because
// it sat on the INPUT it excluded whatever stood beside it — the £ on the
// amount step, the magnifier on a search row — so the box started mid-field.
//
// A RULE WAS TRIED NEXT and taken out the same day (founder: "i don't like
// this fix and i don't even see how it solves the usability problem
// really"). A 2px border under every bare field made the dialogs look like
// forms again, which is the thing the chromeless styling exists to avoid —
// and the "at rest it shows the field is typeable" argument for keeping it
// was mine, not a problem anyone had reported.
//
// SO: NOTHING AT REST. On focus the whole field lights in the register's
// pale tint. No geometry, and it is the register-ink idiom's own grammar
// (#587/#588 — white surface, register as ink, pale register tint), which is
// how every other interactive surface in the app already behaves.
//
// Put it on the WRAPPER, not the input, so the adornments are inside it:
// `has-[:focus-visible]` lights the wrapper from the input within, and the
// £ or the magnifier is inside the lit area rather than beside it.
//
// The negative margin lets the tint bleed past the text without moving it —
// the £ and the glyph stay exactly where they were.
//
// ONE CONSTANT because seven fields share it and they must not drift. It is
// also what made this swap a one-line change.
//
// THE HONEST WEAKNESS: a pale wash is a softer focus indicator than a ring
// or a rule, and the contrast between it and white is well under the 3:1
// that WCAG's focus-appearance guidance asks for. The guarantee from
// cf836977 — that focus is visible at all — holds; its strength does not.
// Worth revisiting if anyone ever uses this app by keyboard alone.
//
// `:focus-visible` matches a text field on click as well as from the
// keyboard (per spec — you are about to type), so this lights for the mouse
// too, which is wanted here.
//
// LIGHTER AGAIN (founder, same day: "can we make the tint lighter?"). The
// register's own `--accent` at half strength — the opacity modifier mixes it
// toward the surface rather than naming a new colour, so it stays the
// register's tint and `pnpm tokens` still owns the hue.
export const FIELD_RULE =
  "-mx-2 rounded-md px-2 py-1 transition-colors has-[:focus-visible]:bg-accent/50"

// THE SAME TINT, ON THE INPUT ITSELF. One field cannot take the wrapper: the
// checkout email sits inside a bordered unit whose label and footnote rows
// share its 16px gutter, and the wrapper's own padding would knock the input
// out of line with them. It also has nothing beside it, so the wrapper bought
// it nothing. It lives here rather than inline so the two cannot drift apart
// on the next change — which is the whole point of this file.
export const FIELD_TINT = "transition-colors focus-visible:bg-accent/50"
