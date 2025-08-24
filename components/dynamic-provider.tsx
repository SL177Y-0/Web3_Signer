"use client"

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import type React from 'react'
import { useState, useEffect } from 'react'

interface DynamicProviderProps {
  children: React.ReactNode
}

export function DynamicProvider({ children }: DynamicProviderProps) {
  const [mounted, setMounted] = useState(false)
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Web3 components...</p>
        </div>
      </div>
    )
  }

  if (!environmentId) {
    console.error('NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is not set')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
          <p className="text-muted-foreground">
            Please set NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID in your environment variables.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Get your environment ID from{' '}
            <a href="https://app.dynamic.xyz" className="text-primary hover:underline">
              app.dynamic.xyz
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        theme: 'dark',
        walletConnectors: [EthereumWalletConnectors],
        initialAuthenticationMode: 'connect-and-sign',
        debugError: process.env.NEXT_PUBLIC_DYNAMIC_DEBUG === 'true',
        cssOverrides: `
          .dynamic-shadow-dom {
            z-index: 9999;
          }
        `,
      }}
    >
      {children}
    </DynamicContextProvider>
  )
} 