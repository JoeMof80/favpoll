import { NewFavpollButton } from "@/components/new-favpoll-button"
import {
  FAVPOLL_MARK_PATHS,
  FAVPOLL_MARK_VIEWBOX,
} from "@/components/favpoll-logo"

export function FavpollListCardEmpty() {
  return (
    <div className="col-span-full py-20 text-center">
      {/* The brand mark, not the candle emoji (founder, 2026-09-15:
          "the candle image doesn't belong here") — a candle is
          memorial-flavoured on a list that spans every register. The
          mark recolours with the page palette via currentColor and
          carries no occasion. */}
      <svg
        width="44"
        height="40"
        viewBox={FAVPOLL_MARK_VIEWBOX}
        fill="none"
        aria-hidden="true"
        className="mx-auto mb-4 text-primary/40"
      >
        {FAVPOLL_MARK_PATHS.map((p) => (
          <path key={p.d} d={p.d} fill="currentColor" fillOpacity={p.opacity} />
        ))}
      </svg>
      <p className="mb-2 text-[15px] font-medium text-foreground">
        No open favpolls yet
      </p>
      <p className="mx-auto mb-6 max-w-[280px] text-[13px] text-muted-foreground">
        Be the first to create a favpoll and it will appear here.
      </p>
      <NewFavpollButton size="lg">Create a favpoll</NewFavpollButton>
    </div>
  )
}
