// THE RADIAL GOAL (mock, founder 2026-10-17: "make the radial refer to
// the total rather than the countdown"). An 80px dial where the photo
// hangs on the hero, at the right over the goal figure: a ring in the
// register's ink that FILLS as the total climbs towards the goal — the
// telethon's dial — turning success once the goal is reached, with the
// percentage in the middle. The countdown is the card's context line.

type Props = {
  totalRaised: number
  goalAmount: number
  size?: number
}

export function RadialGoal({ totalRaised, goalAmount, size = 72 }: Props) {
  const fraction = Math.min(1, Math.max(0, totalRaised / goalAmount))
  const percent = Math.round(fraction * 100)
  const reached = totalRaised >= goalAmount
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  return (
    <div
      role="img"
      aria-label={`${percent}% of the goal raised`}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-primary/15"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className={`transition-[stroke-dashoffset] duration-700 ease-out ${
            reached ? "stroke-success" : "stroke-primary"
          }`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - fraction)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none tabular-nums">
        <span
          className={`text-xl font-medium ${
            reached ? "text-success" : "text-foreground"
          }`}
        >
          {percent}%
        </span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">raised</span>
      </div>
    </div>
  )
}
