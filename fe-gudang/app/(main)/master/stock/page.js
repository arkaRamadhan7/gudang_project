'use client'

import { Suspense } from "react"
import StockContent from "./stockContent"

export default function stockPage () {
  return (
    <Suspense fallback= {<div>loading ...</div>}>
      <StockContent/>
       </Suspense>
  )
}