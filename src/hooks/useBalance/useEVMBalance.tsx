import { useCallback, useEffect, useState } from 'react'

import { EVM_WALLETS_CONFIG } from './config'
import type { TUseBalanceOptions } from './types'

function useEVMBalance(options: TUseBalanceOptions) {
  const { isConnected, provider, name, address, chainId } = options
  const isEVMWallet = !!name && EVM_WALLETS_CONFIG.includes(name)
  const isSubscriptionIsAvailable = isEVMWallet && address && isConnected && provider

  const [balance, setBalance] = useState<string | null>(null)

  const getBalanceFromProvider = useCallback(() => {
    if (!isSubscriptionIsAvailable) {
      return
    }

    provider.getBalance(address).then((res) => {
      if (res) {
        setBalance(res.toString())
      }
    })
  }, [provider, address, isSubscriptionIsAvailable])

  // Call balance function on each changing of web3 or address
  useEffect(() => {
    getBalanceFromProvider()
  }, [isSubscriptionIsAvailable, address, chainId])

  // Subscribe to block changes
  useEffect(() => {
    if (isSubscriptionIsAvailable) {
      provider.on('block', getBalanceFromProvider)
    }

    return () => {
      provider?.off('block', getBalanceFromProvider)
    }
  }, [isSubscriptionIsAvailable, address, chainId])

  return balance
}

export { useEVMBalance }
