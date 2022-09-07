import type { TAvailableWalletsGroups, TWalletAddressesHistory } from '@/types'

type TUseWalletAddressesHistory = [TWalletAddressesHistory, (options: TUseWalletAddressesOptions) => void]

type TUseWalletAddressesOptions = TWalletAddressesHistory

type TWalletInfo = { [key in TAvailableWalletsGroups]: [string, number[]][] }

export type { TUseWalletAddressesHistory, TUseWalletAddressesOptions, TWalletInfo }
