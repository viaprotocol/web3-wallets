export const WALLET_NAMES = {
  WalletConnect: 'WalletConnect',
  MetaMask: 'MetaMask',
  Phantom: 'Phantom',
  Near: 'Near',
  Coinbase: 'Coinbase'
} as const

export const WALLET_SUBNAME = {
  GnosisSafe: 'Gnosis Safe Multisig'
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
  Moonbeam: 1284,
  Moonriver: 1285,
  MoonriverTestnet: 1287,
  Solana: -1,
  SolanaTestnet: -1001,
  TON: -3,
  Cosmos: -100,
  Osmosis: -101,
  Sifchain: -102,
  TONTestnet: -1003
} as const

export const EVM_BASE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'
export const SOLANA_BASE_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111111'

export const EVM_ENS_POSTFIX = '.eth'
export const SOLANA_ENS_POSTFIX = '.sol'

export const ERRCODE = {
  UserRejected: 4001,
  UnrecognizedChain2: 4902,
  UnrecognizedChain: -32603
}

export const LOCAL_STORAGE_WALLETS_KEY = 'web3-wallets-data'
