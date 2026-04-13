"use client"

import { ActINurse, ActIIEngineer, ActIIILeader } from "./acts"
import { SECTION_ID } from "@utilities"

const { ACT_ENGINEER } = SECTION_ID

export function Timeline() {
  return (
    <section id="journey" className="relative">
      <ActINurse />
      <section id={ACT_ENGINEER}>
        <ActIIEngineer />
      </section>
      <ActIIILeader />
    </section>
  )
}
