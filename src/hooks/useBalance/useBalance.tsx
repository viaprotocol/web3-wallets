import { useQueryClient } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'
import type { TUseBalanceOptions } from './types'
import { UPDATE_DELAY_KEY } from './config'
import { WalletContext } from '@/context'

function useBalance(options: TUseBalanceOptions) {
  const { balance } = useContext(WalletContext)
  const queryClient = useQueryClient()
  const { updateDelay } = options

  useEffect(() => {
    queryClient.setQueryData([UPDATE_DELAY_KEY], updateDelay)
  }, [updateDelay])

  return balance
}

export { useBalance }
