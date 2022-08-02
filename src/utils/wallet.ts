import type { TCosmosWalletStore, TEvmWalletStore, TSolWalletStore, TWalletStoreState } from '@/types'
import { COSMOS_WALLETS_CONFIG, EVM_WALLETS_CONFIG, SOL_WALLETS_CONFIG } from '@/hooks/useBalance/config'

const isEvmWallet = (walletData: TWalletStoreState): walletData is TEvmWalletStore => {
  return EVM_WALLETS_CONFIG.includes(walletData.name as any)
}

const isSolWallet = (walletData: TWalletStoreState): walletData is TSolWalletStore => {
  return SOL_WALLETS_CONFIG.includes(walletData.name as any)
}

const isCosmosWallet = (walletData: TWalletStoreState): walletData is TCosmosWalletStore => {
  return COSMOS_WALLETS_CONFIG.includes(walletData.name as any)
}

export { isEvmWallet, isSolWallet, isCosmosWallet }
