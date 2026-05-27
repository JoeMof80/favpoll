"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AmountPresets } from "@/components/pledge-card/amount-presets"

export function FavpollPledgePanel() {
  const [amount, setAmount] = useState("10")

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Pledge amount">
        <AmountPresets
          amounts={[5, 10, 20, 50]}
          value={amount}
          onChange={setAmount}
        />
      </div>
      <Button className="w-full">Pledge favourites</Button>
      <p className="text-center text-[11px] text-[#888780]">
        Free to create · Guests pledge directly to charity
      </p>
    </div>
  )
}
