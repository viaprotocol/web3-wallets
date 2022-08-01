import { useCallback, useEffect, useState } from 'react'

import type { TUseBalanceOptions } from './types'
import { isEvmWallet } from '@/utils/wallet'

function useEVMBalance(options: TUseBalanceOptions) {
  const { isConnected, provider, name, address, chainId } = options
  const isSubscriptionIsAvailable = isEvmWallet(options) && address && isConnected && provider

  const [balance, setBalance] = useState<string | null>(null)

  const getBalanceFromProvider = useCallback(() => {
    if (!isSubscriptionIsAvailable) {
      return
    }

    options.provider.getBalance(address).then((res) => {
      if (res) {
        setBalance(res.toString())
      }
    })
  }, [options.provider, address, isSubscriptionIsAvailable, name])

  // Call balance function on each changing of web3 or address
  useEffect(() => {
    getBalanceFromProvider()
  }, [isSubscriptionIsAvailable, address, chainId])

  // Subscribe to block changes
  useEffect(() => {
    if (isSubscriptionIsAvailable) {
      options.provider.on('block', getBalanceFromProvider)
    }

    return () => {
      if (options.provider && isSubscriptionIsAvailable) {
        options.provider.off('block', getBalanceFromProvider)
      }
    }
  }, [isSubscriptionIsAvailable, address, chainId, options.provider])

  return balance
}

export { useEVMBalance }
