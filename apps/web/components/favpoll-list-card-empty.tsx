import { NewFavpollButton } from "@/components/new-favpoll-button"

export function FavpollListCardEmpty() {
  return (
    <div className="col-span-full py-20 text-center">
      <p className="mb-4 text-[32px]">🕯</p>
      <p className="mb-2 text-[15px] font-medium text-foreground">
        No live favpolls yet
      </p>
      <p className="mx-auto mb-6 max-w-[280px] text-[13px] text-muted-foreground">
        Be the first to create a favpoll and it will appear here.
      </p>
      <NewFavpollButton size="lg">Create a favpoll</NewFavpollButton>
    </div>
  )
}
