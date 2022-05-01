import { IUseBalanceOptions } from './types'
import { useEVMBalance } from './useEVMBalance'

function useBalance(options: IUseBalanceOptions) {
  const balance = useEVMBalance(options)

  console.log('web3', options.web3)

  return [balance]
}

export { useBalance }
