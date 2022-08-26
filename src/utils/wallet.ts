import { COSMOS_WALLETS_CONFIG, EVM_WALLETS_CONFIG, SOL_WALLETS_CONFIG } from '..'
import type { TCosmosWalletStore, TEvmWalletStore, TSolWalletStore, TWalletStore } from '@/types'

const isEvmWallet = (walletData: TWalletStore): walletData is TEvmWalletStore => {
  return EVM_WALLETS_CONFIG.includes(walletData.name as any)
}

const isSolWallet = (walletData: TWalletStore): walletData is TSolWalletStore => {
  return SOL_WALLETS_CONFIG.includes(walletData.name as any)
}

const isCosmosWallet = (walletData: TWalletStore): walletData is TCosmosWalletStore => {
  return COSMOS_WALLETS_CONFIG.includes(walletData.name as any)
}

export { isEvmWallet, isSolWallet, isCosmosWallet }
