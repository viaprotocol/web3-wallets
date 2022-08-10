import type { TWalletAddressesHistory } from '@/types'

type TUseWalletAddressesHistory = [TWalletAddressesHistory, (options: TUseWalletAddressesOptions) => void]

type TUseWalletAddressesOptions = {
  address: string
  chains: number[]
}

export type { TUseWalletAddressesHistory, TUseWalletAddressesOptions }
