export function FavpollLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-primary ${className ?? ""}`}>
      <svg
        width="24"
        height="21"
        viewBox="0 0 24 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_44_7)">
          <path
            d="M17.76 16.3333C18.5553 16.3333 19.2 15.811 19.2 15.1667C19.2 14.5223 18.5553 14 17.76 14H12V16.3333H17.76Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          <path
            d="M12 11.6666V9.33331L22.4021 9.3346C23.2846 9.3346 24 9.85663 24 10.5006C24 11.1446 23.2846 11.6666 22.4021 11.6666H12Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          <path
            d="M12 18.6667L13.201 18.6667C13.8632 18.6667 14.4 19.189 14.4 19.8334C14.4 20.4777 13.8632 21 13.201 21L12 21V18.6667Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          <path
            d="M21.9422 1.97078C19.197 -0.65663 14.7452 -0.65663 12 1.97078L11.7375 1.73152C8.97811 -0.654481 4.71715 -0.574448 2.05785 1.97078L1.80941 2.22143C-0.683297 4.86213 -0.600461 8.93879 2.05785 11.4841L9.60002 18.6664V15.392L3.74299 9.82298C1.95301 8.10978 1.95324 5.34753 3.74299 3.63419C5.55406 1.90083 8.50618 1.90083 10.3172 3.63419L12 5.24519L13.6829 3.63419C15.4939 1.9008 18.446 1.90085 20.2571 3.63419C21.2034 4.54013 21.6446 5.72903 21.5953 6.90405C21.594 6.93595 21.5923 6.96785 21.5902 6.99974H23.9953C24.0715 5.18873 23.3866 3.35358 21.9422 1.97078Z"
            fill="currentColor"
          />
        </g>
      </svg>

      <span className="text-2xl tracking-tight text-primary">
        fav<span className="opacity-60">poll</span>
      </span>
    </span>
  )
}
