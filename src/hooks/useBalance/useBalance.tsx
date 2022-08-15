import { PickBalanceProvider } from './PickBalanceProvider'
import type { TUseBalanceOptions } from './types'

function useBalance(options: TUseBalanceOptions) {
  const { name } = options
  if (!name) {
    return null
  }

  const balance = (
    <PickBalanceProvider options={options}>
      {(balance: string | null) => balance}
    </PickBalanceProvider>
  ) as unknown as string | null

  return balance
}

export { useBalance }
