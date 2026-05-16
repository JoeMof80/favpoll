export function FavPollLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23 14H14.3284L12.3284 16H23C23.5523 16 24 15.5529 24 15.0006C24 14.4483 23.5523 14 23 14Z"
          fill="#534BB7"
        />
        <path
          d="M19 18L9.5 18.0006V20.0006L19 20C19.5523 20 20 19.5523 20 19C20 18.4477 19.5523 18 19 18Z"
          fill="#534BB7"
        />
        <path
          d="M15 22H9.5V24L15 23.9994C15.5523 23.9994 16 23.5523 16 23C16 22.4477 15.5523 22 15 22Z"
          fill="#534BB7"
        />
        <path
          d="M9.69727 2.21875C11.368 0.594286 14.088 0.594286 15.7588 2.21875C17.4136 3.82793 17.4137 6.42508 15.7588 8.03418L9 14.6045L2.24121 8.03418C0.586268 6.42508 0.58642 3.82794 2.24121 2.21875C3.91196 0.594285 6.63199 0.594287 8.30273 2.21875L9 2.89648L9.69727 2.21875Z"
          stroke="#534BB7"
          strokeWidth="2"
        />
      </svg>

      <span className="text-xl tracking-tight text-primary">FavPoll</span>
    </span>
  )
}
