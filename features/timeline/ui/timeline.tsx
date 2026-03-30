"use client"

import { ActINurse, ActIIEngineer, ActIIILeader, ActIVBuilder } from "./acts"
import { TradingArsenal } from "./trading-system"
import { SECTION_ID } from "@utilities"

const { ACT_BUILDER, ACT_ENGINEER } = SECTION_ID

export function Timeline() {
  return (
    <section id="journey" className="relative">
      <ActINurse />
      <section id={ACT_ENGINEER}>
        <ActIIEngineer />
      </section>
      <ActIIILeader />
      <section id={ACT_BUILDER}>
        <ActIVBuilder />
        <TradingArsenal />
      </section>
    </section>
  )
}
