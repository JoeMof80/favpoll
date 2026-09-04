// The quiet tail: "Create a favpoll — always free" with the reassurance
// at a lower weight. Extracted from the hero 2026-09-05 when the close
// bands took the same idiom (founder: "shall we add 'always free' to
// the CTA button at the bottom?"). A label with no " — " comes back
// untouched.
//
// opacity-80, NOT lower. Measured on the rendered pixels rather than
// eyeballed — the tokens are oklch, so blending them by hand gets the
// wrong answer — and the tail is 14px, which WCAG treats as normal text
// needing 4.5:1. Against the hero button: 0.65 gives 3.3, 0.75 gives
// 4.13, 0.8 gives 4.63. The first two look right and fail. The head
// sits at 7.34, so the two still read as different weights.
export function withQuietTail(label: string) {
  const [head, ...rest] = label.split(" — ")
  if (!rest.length) return label
  return (
    <>
      {head}
      <span className="text-sm font-normal opacity-80">
        {" — "}
        {rest.join(" — ")}
      </span>
    </>
  )
}
