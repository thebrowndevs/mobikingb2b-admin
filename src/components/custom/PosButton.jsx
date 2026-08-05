import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'

function PosButton() {
  return (
    <Link href={'/admin/pos'}>
        <Button>POS</Button>
    </Link>
  )
}

export default PosButton
