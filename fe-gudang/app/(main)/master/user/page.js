'use client'
import { Suspense } from "react"
import UserContent from './userContent'

export default function userPage () {
  return (
    <Suspense fallback= {<div> loading....</div>}>
      <UserContent/>
    </Suspense>
  )
}