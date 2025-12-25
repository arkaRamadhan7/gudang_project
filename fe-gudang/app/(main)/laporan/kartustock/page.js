'use client'

import { Suspense } from "react"
import KartuStockContent from './KartuStockContent'

export default function KartuStockPage () {
  return (
    <Suspense fallback= {<div>loading...</div>}>
      <KartuStockContent/>
    </Suspense>
  )
}