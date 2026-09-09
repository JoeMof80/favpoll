import { ClerkProvider as ClerkNextJSProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"

type ClerkProviderProps = React.ComponentProps<typeof ClerkNextJSProvider>

// FAVPOLL GRAMMAR over the shadcn base (founder, 2026-09-09): the shadcn
// theme wires Clerk to our tokens (that's why its primary follows the
// register palette), and this elements layer tightens the remainder to
// house style — the dialogs' card idiom (rounded-xl, ring-border), our
// input surface, our button radii and weights. One layer here covers
// SignIn, SignUp, and every Clerk popover.
const FAVPOLL_ELEMENTS = {
  // The slot is cardBox in the @clerk/ui pipeline (measured 2026-09-09 —
  // "card" silently no-ops there).
  cardBox: "rounded-xl shadow-lg ring-1 ring-border",
  headerTitle: "font-medium",
  headerSubtitle: "text-muted-foreground",
  formButtonPrimary: "rounded-lg font-medium shadow-none",
  formFieldLabel: "font-medium",
  formFieldInput: "rounded-lg bg-background",
  socialButtonsBlockButton: "rounded-lg border-border",
  dividerText: "text-muted-foreground",
  footerActionLink: "font-medium text-primary hover:text-primary/80",
}

export function ClerkProvider({
  children,
  appearance,
  ...props
}: ClerkProviderProps) {
  return (
    <ClerkNextJSProvider
      appearance={{
        theme: shadcn,
        elements: FAVPOLL_ELEMENTS,
        ...appearance,
      }}
      {...props}
    >
      {children}
    </ClerkNextJSProvider>
  )
}
