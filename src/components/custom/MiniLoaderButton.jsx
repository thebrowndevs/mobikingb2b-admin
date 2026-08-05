import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'

export default function MiniLoaderButton({
  loading = false,
  children,
  className = '',
  variant,
  size = 'icon',
  ...props
}) {
  return (
    <Button
      className={`flex items-center justify-center ${className}`}
      variant={variant}
      size={size}
      disabled={loading}
      aria-disabled={loading}
      {...props}
    >
      {loading
        ? <Loader2 size={2} className="animate-spin" />
        : children
      }
    </Button>
  )
}
