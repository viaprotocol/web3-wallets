import type { TWalletAddressesHistory } from '@/types'

type TUseWalletAddressesHistory = [TWalletAddressesHistory, (options: TUseWalletAddressesOptions) => void]

type TUseWalletAddressesOptions = TWalletAddressesHistory

export type { TUseWalletAddressesHistory, TUseWalletAddressesOptions }
