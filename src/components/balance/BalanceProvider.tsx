import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { TBalanceProviderOptions } from '../../hooks/balance/types'
import { BALANCE_PROVIDER_BY_NAME } from './config'
import type { TBalanceCallback } from './types'
import { UPDATE_DELAY_KEY } from '@/hooks/balance/config'

function BalanceProvider({
  options,
  setBalance
}: PropsWithChildren<{
  options: TBalanceProviderOptions
  setBalance: TBalanceCallback
}>) {
  const { data: balanceUpdateDelay } = useQuery([UPDATE_DELAY_KEY]) ?? false
  const { name, address, isConnected } = options

  const balanceParams = useMemo(() => {
    return {
      ...options,
      updateDelay: balanceUpdateDelay as number
    }
  }, [options, balanceUpdateDelay])

  const BalanceComponent = useMemo(() => {
    if (!name) {
      return null
    }

    const balanceProviderMetadata = BALANCE_PROVIDER_BY_NAME[name]

    if (!balanceProviderMetadata) {
      return null
    }

    const { component, validatePropsFunc } = balanceProviderMetadata

    if (!validatePropsFunc(options)) {
      return null
    }

    return component
  }, [name])

  if (!BalanceComponent || !address || !isConnected) {
    return null
  }

  return <BalanceComponent options={balanceParams} setBalance={setBalance} />
}

export { BalanceProvider }
