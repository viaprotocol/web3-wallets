import type { TEvmWalletStore, TSolWalletStore, TWalletStoreState } from '@/types'
import { EVM_WALLETS_CONFIG, SOL_WALLETS_CONFIG } from '@/hooks/useBalance/config'

const isEvmWallet = (walletData: TWalletStoreState): walletData is TEvmWalletStore => {
  return EVM_WALLETS_CONFIG.includes(walletData.name as any)
}

const isSolWallet = (walletData: TWalletStoreState): walletData is TSolWalletStore => {
  return SOL_WALLETS_CONFIG.includes(walletData.name as any)
}

export { isEvmWallet, isSolWallet }
