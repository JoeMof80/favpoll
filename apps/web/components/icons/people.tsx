import type { SVGProps } from "react"

// Custom people icons drawn by the founder (2026-07-30) in lucide's
// stroke language — the back figures' occlusion is baked into the path
// data, so no masks. Non-square viewBoxes centre naturally in the
// square icon slot.

function iconProps(
  viewBox: string,
  props: SVGProps<SVGSVGElement>
): SVGProps<SVGSVGElement> {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  }
}

/** Two figures — one behind-left, one in front. */
export function PairIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps("0 0 24 18", props)}>
      <path d="M16.4205 9.93864C18.6936 9.93864 20.5363 8.09593 20.5363 5.82284C20.5363 3.54974 18.6936 1.70703 16.4205 1.70703C14.1474 1.70703 12.3047 3.54974 12.3047 5.82284C12.3047 8.09593 14.1474 9.93864 16.4205 9.93864Z" />
      <path d="M22.9987 16.5228C22.9987 14.7763 22.3049 13.1013 21.0699 11.8663C19.8349 10.6313 18.1599 9.9375 16.4134 9.9375C14.6669 9.9375 12.9919 10.6313 11.7569 11.8663C10.5219 13.1013 9.82813 14.7763 9.82812 16.5228" />
      <path d="M10.5005 2.91C8.89315 1.30268 6.28717 1.30268 4.67984 2.91C3.07252 4.51732 3.07252 7.1233 4.67985 8.73063C6.28717 10.3379 8.89315 10.3379 10.5005 8.73063" />
      <path d="M1 16.5228C1 14.7763 1.69381 13.1013 2.92879 11.8663C4.16377 10.6313 5.83876 9.9375 7.58529 9.9375" />
    </svg>
  )
}

/** Three figures — front figure between two behind. */
export function GroupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps("0 0 24 17", props)}>
      <path d="M12.0041 10.2196C13.8703 10.2196 15.3832 8.70659 15.3832 6.84025C15.3832 4.97391 13.8703 3.46094 12.0041 3.46094C10.1379 3.46094 8.625 4.97391 8.625 6.84025C8.625 8.70659 10.1379 10.2196 12.0041 10.2196Z" />
      <path d="M17.4108 15.6217C17.4108 14.1877 16.8412 12.8125 15.8272 11.7985C14.8133 10.7845 13.4381 10.2148 12.0042 10.2148C10.5703 10.2148 9.19513 10.7845 8.1812 11.7985C7.16727 12.8125 6.59766 14.1877 6.59766 15.6217" />
      <path d="M8.79595 1.98978C7.47633 0.670075 5.3368 0.670075 4.01718 1.98978C2.69756 3.30948 2.69756 5.44914 4.01718 6.76884C4.93673 7.68844 6.40656 7.7581 6.40656 7.7581C4.97265 7.7581 3.59747 8.32776 2.58355 9.34175C1.56962 10.3557 1 11.731 1 13.165" />
      <path d="M15.2041 1.98978C16.5237 0.670075 18.6632 0.670075 19.9828 1.98978C21.3024 3.30948 21.3024 5.44914 19.9828 6.76884C19.0633 7.68844 17.5934 7.7581 17.5934 7.7581C19.0273 7.7581 20.4025 8.32776 21.4165 9.34175C22.4304 10.3557 23 11.731 23 13.165" />
    </svg>
  )
}
