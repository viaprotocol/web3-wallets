import type { TAvailableWalletNames, TWalletAddressesHistory } from '@/types'

type TUseWalletAddressesHistory = [TWalletAddressesHistory, (walletName: TAvailableWalletNames, chainId: number, address: string) => void]

export type { TUseWalletAddressesHistory }
