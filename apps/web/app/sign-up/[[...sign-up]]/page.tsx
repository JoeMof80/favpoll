import { SignUp } from "@clerk/nextjs"
import { AuthShell } from "@/components/auth-shell"

// ?email_address= prefills the form — the repeat-guest-pledge invitation
// hands the pledger here with the email their pledges live under, so the
// signup webhook can claim them on exact verified match.
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ email_address?: string }>
}) {
  const { email_address } = await searchParams
  return (
    <AuthShell>
      <SignUp
        initialValues={
          email_address ? { emailAddress: email_address } : undefined
        }
      />
    </AuthShell>
  )
}
