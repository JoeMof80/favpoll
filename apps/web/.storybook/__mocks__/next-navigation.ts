export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {},
  }
}

export function usePathname() {
  return "/"
}

export function useSearchParams() {
  return new URLSearchParams()
}

export function useParams() {
  return {}
}
