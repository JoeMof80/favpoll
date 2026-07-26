import { SignIn } from "@clerk/nextjs"

// ?email_address= prefills the form (see sign-up/page.tsx)
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ email_address?: string }>
}) {
  const { email_address } = await searchParams
  return (
    <div className="flex w-full flex-1 items-center justify-center bg-muted p-6 md:p-10">
      <SignIn
        initialValues={
          email_address ? { emailAddress: email_address } : undefined
        }
      />
    </div>
  )
}
