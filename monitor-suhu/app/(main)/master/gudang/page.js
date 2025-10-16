'use client'

import { Suspense } from "react"
import GudangContent from './GudangContent'

export default function GudangPage () {
  return (
    <Suspense fallback= {<div> loading gudang...</div>}>
      <GudangContent/>
      </Suspense>
  );
}