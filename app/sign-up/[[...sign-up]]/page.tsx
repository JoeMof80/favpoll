import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="hidden flex-1 items-center justify-end p-10 lg:flex">
        <div className="max-w-sm space-y-8">
          <div>
            <span className="text-base font-medium text-primary">FavPoll</span>
          </div>
          <ul className="space-y-7">
            {[
              {
                heading: 'Honour the people you love',
                body: 'Create a poll for a memorial, birthday, or retirement — and turn your guests\u2019 favourites into a lasting tribute.',
              },
              {
                heading: 'Every pledge goes to charity',
                body: 'You choose the charity. Guests pledge donations split across their answers. Nothing is kept.',
              },
              {
                heading: 'A permanent record of favourites',
                body: 'Each event feeds an all-time ranking of human favourites — a gentle, growing picture of what people love.',
              },
            ].map((item) => (
              <li key={item.heading}>
                <p className="text-sm font-medium text-foreground">{item.heading}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 md:p-10 lg:justify-start">
        <SignUp />
      </div>
    </div>
  )
}
