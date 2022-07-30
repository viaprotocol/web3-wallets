import { WALLET_NAMES } from '@/constants'

const EVM_WALLETS_CONFIG = [WALLET_NAMES.MetaMask, WALLET_NAMES.WalletConnect, WALLET_NAMES.Coinbase] as const

const SOL_WALLETS_CONFIG = [WALLET_NAMES.Phantom] as const

const COSMOS_WALLETS_CONFIG = [WALLET_NAMES.Keplr] as const

export { EVM_WALLETS_CONFIG, SOL_WALLETS_CONFIG, COSMOS_WALLETS_CONFIG }
