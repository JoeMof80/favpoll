import { SignIn } from "@clerk/nextjs"
import { AuthShell } from "@/components/auth-shell"

// ?email_address= prefills the form (see sign-up/page.tsx)
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ email_address?: string }>
}) {
  const { email_address } = await searchParams
  return (
    <AuthShell>
      <SignIn
        initialValues={
          email_address ? { emailAddress: email_address } : undefined
        }
      />
    </AuthShell>
  )
}
