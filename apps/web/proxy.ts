import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// /favpolls/new IS NOT HERE ANY MORE (2026-10-27). The wizard works signed
// out and asks for an account at Publish, so that "Create a favpoll" no
// longer puts a login in front of a noun nothing has defined yet. What the
// visitor types is kept in a wizard_drafts row across the sign-in; see
// lib/actions/wizard-draft.ts. Publishing still needs an account — that is
// enforced in createFavpoll, where it belongs, not by hiding the page.
const isPrivateRoute = createRouteMatcher(["/my-favpolls(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isPrivateRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
