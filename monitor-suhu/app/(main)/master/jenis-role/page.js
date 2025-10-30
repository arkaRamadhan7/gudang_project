'use client'

import { Suspense } from "react"
import JenisRoleContent from './JenisRoleContent'

export default function JenisRolePage () {
  return (
    <Suspense fallback= {<div> loading jenis role....</div>}>
    <JenisRoleContent/>
    </Suspense>
  );
}
