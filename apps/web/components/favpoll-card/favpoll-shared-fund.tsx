type FavpollSharedFundProps = {
  show: boolean
}

export function FavpollSharedFund({ show }: FavpollSharedFundProps) {
  if (!show) return null

  return (
    <div className="rounded-lg border border-[#1D9E75] bg-[#E1F5EE] px-4 py-2.5">
      <p className="mb-0.5 text-[13px] font-medium text-[#1D9E75]">
        Shared fund available
      </p>
      <p className="text-[12px] text-[#1D9E75]">
        Someone has added to the fund so everyone can take part.
      </p>
    </div>
  )
}
