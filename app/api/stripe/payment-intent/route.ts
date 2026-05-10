import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { amount } = (await req.json()) as { amount: number }

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // pence
    currency: 'gbp',
    automatic_payment_methods: { enabled: true },
    metadata: { clerk_user_id: userId },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
