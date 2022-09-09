import type { TChainsWithWalletsLink } from './types'

export const WALLET_NAMES = {
  WalletConnect: 'WalletConnect',
  MetaMask: 'MetaMask',
  xDefi: 'xDefi',
  Phantom: 'Phantom',
  Near: 'Near',
  Coinbase: 'Coinbase',
  Keplr: 'Keplr'
} as const

export const WALLET_SUBNAME = {
  Safe: 'Safe'
} as const

export const NETWORK_IDS = {
  Ethereum: 1,
  Rinkeby: 4,
  Optimism: 10,
  OptimismTestnet: 69,
  Binance: 56,
  BinanceTestnet: 97,
  Polygon: 137,
  PolygonTestnet: 80001,
  Arbitrum: 42161,
  ArbitrumTestnet: 421611,
  Fantom: 250,
  Astar: 592,
  FantomTestnet: 4002,
  Avalanche: 43114,
  AvalancheTestnet: 43113,
  Harmony: 1666600000,
  HarmonyTestnet: 1666700000,
  Heco: 128,
  HecoTestnet: 256,
  Okex: 66,
  OkexTestnet: 65,
  Candle: 534,
  Gnosis: 100,
  KuCoin: 321,
  Moonbeam: 1284,
  Moonriver: 1285,
  MoonriverTestnet: 1287,
  Fuse: 122,
  Cube: 1818,
  Aurora: 1313161554,
  Cronos: 25,
  Boba: 288,
  Celo: 42220,
  Solana: -1,
  SolanaTestnet: -1001,
  TON: -3,
  Cosmos: -100,
  Osmosis: -101,
  Sifchain: -102,
  TONTestnet: -1003,
  BTC: -200,
  Litecoin: -201,
  BCH: -202
} as const

export const EVM_BASE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'
export const SOLANA_BASE_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111111'

export const EVM_ENS_POSTFIX = '.eth'
export const SOLANA_ENS_POSTFIX = '.sol'

export const EVM_NON_CONTRACT_ADDRESS_CODE = '0x'

export const ERRCODE = {
  UserRejected: 4001,
  UnrecognizedChain2: 4902,
  UnrecognizedChain: -32603
}

export const EVM_WALLETS_CONFIG = [WALLET_NAMES.MetaMask, WALLET_NAMES.WalletConnect, WALLET_NAMES.Coinbase, WALLET_NAMES.xDefi]
export const SOL_WALLETS_CONFIG = [WALLET_NAMES.Phantom]
export const COSMOS_WALLETS_CONFIG = [WALLET_NAMES.Keplr]

export const BTC_CHAINS = [NETWORK_IDS.BTC, NETWORK_IDS.Litecoin, NETWORK_IDS.BCH]
export const EVM_CHAINS = Object.keys(NETWORK_IDS).filter(chainName => NETWORK_IDS[chainName as keyof typeof NETWORK_IDS] > 0).map(chainName => NETWORK_IDS[chainName as keyof typeof NETWORK_IDS]).concat(BTC_CHAINS)
export const SOL_CHAINS = [NETWORK_IDS.Solana, NETWORK_IDS.SolanaTestnet]
export const COSMOS_CHAINS = [NETWORK_IDS.Cosmos, NETWORK_IDS.Osmosis, NETWORK_IDS.Sifchain] as const

export const cosmosChainsMap: { [key in typeof COSMOS_CHAINS[number]]: string } = {
  [NETWORK_IDS.Cosmos]: 'cosmoshub-4',
  [NETWORK_IDS.Osmosis]: 'osmosis-1',
  [NETWORK_IDS.Sifchain]: 'sifchain-1'
}

export const cosmosChainWalletMap: { name: string; chainId: typeof COSMOS_CHAINS[number] }[] = [
  { name: 'COSMOS', chainId: NETWORK_IDS.Cosmos },
  { name: 'OSMOSIS', chainId: NETWORK_IDS.Osmosis },
  { name: 'SIF', chainId: NETWORK_IDS.Sifchain }
]

export const CHAINS_WITH_WALLET: TChainsWithWalletsLink[] = [
  {
    key: 'EVM',
    chains: EVM_CHAINS,
    wallets: EVM_WALLETS_CONFIG
  },
  {
    key: 'SOL',
    chains: SOL_CHAINS,
    wallets: SOL_WALLETS_CONFIG
  },
  {
    key: 'COSMOS',
    chains: COSMOS_CHAINS,
    wallets: COSMOS_WALLETS_CONFIG
  }
]

export const LOCAL_STORAGE_WALLETS_KEY = 'web3-wallets-data'

export const LOCAL_STORAGE_WALLETS_ADDRESSES = 'web3-wallets-addresses'
