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
      <path d="M16.54 9.75568C18.7712 9.75568 20.5799 7.94694 20.5799 5.71573C20.5799 3.48453 18.7712 1.67578 16.54 1.67578C14.3087 1.67578 12.5 3.48453 12.5 5.71573C12.5 7.94694 14.3087 9.75568 16.54 9.75568Z" />
      <path d="M22.9982 16.2178C22.9982 14.5035 22.3171 12.8594 21.1049 11.6471C19.8927 10.4349 18.2486 9.75391 16.5342 9.75391C14.8199 9.75391 13.1758 10.4349 11.9636 11.6471C10.7513 12.8594 10.0703 14.5035 10.0703 16.2178" />
      <path d="M10.3239 2.85816C8.74624 1.28047 6.18828 1.28047 4.61058 2.85817C3.03288 4.43587 3.03288 6.99382 4.61058 8.57152C6.18828 10.1492 8.74624 10.1492 10.3239 8.57152" />
      <path d="M1 16.2178C1 14.5035 1.68102 12.8594 2.89324 11.6471C4.10546 10.4349 5.74958 9.75391 7.46392 9.75391" />
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
