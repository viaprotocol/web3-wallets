import { BTC_WALLETS_CONFIG, COSMOS_WALLETS_CONFIG, EVM_WALLETS_CONFIG, SOL_WALLETS_CONFIG, isBTClikeChain, isCosmosChain, isEvmChain, isSolChain } from '../constants'
import type { TBTCWalletStore, TCosmosWalletStore, TEvmWalletStore, TSolWalletStore, TWalletStore } from '@/types'

const isEvmWallet = (walletData: TWalletStore, fromChainId?: number | null): walletData is TEvmWalletStore => {
  return EVM_WALLETS_CONFIG.includes(walletData.name as any) && (!fromChainId || isEvmChain(fromChainId))
}

const isSolWallet = (walletData: TWalletStore, fromChainId?: number | null): walletData is TSolWalletStore => {
  return SOL_WALLETS_CONFIG.includes(walletData.name as any) && (!fromChainId || isSolChain(fromChainId))
}

const isCosmosWallet = (walletData: TWalletStore, fromChainId?: number | null): walletData is TCosmosWalletStore => {
  return COSMOS_WALLETS_CONFIG.includes(walletData.name as any) && (!fromChainId || isCosmosChain(fromChainId))
}

const isBTClikeWallet = (walletData: TWalletStore, fromChainId?: number | null): walletData is TBTCWalletStore => {
  return BTC_WALLETS_CONFIG.includes(walletData.name as any) && (!fromChainId || isBTClikeChain(fromChainId))
}

export { isEvmWallet, isSolWallet, isCosmosWallet, isBTClikeWallet }
