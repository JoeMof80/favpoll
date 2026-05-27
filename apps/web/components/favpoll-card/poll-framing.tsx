type PollFramingProps = {
  framing: string
}

export function PollFraming({ framing }: PollFramingProps) {
  return <p className="text-[15px] leading-relaxed text-[#5F5E5A]">{framing}</p>
}
