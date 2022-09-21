import { NETWORK_IDS } from '@/constants'

const WC_SUPPORTED_CHAINS = [
  // Mainnets
  NETWORK_IDS.Arbitrum,
  NETWORK_IDS.Avalanche,
  NETWORK_IDS.Binance,
  NETWORK_IDS.Ethereum,
  NETWORK_IDS.Fantom,
  NETWORK_IDS.Optimism,
  NETWORK_IDS.Polygon,
  // Testnets
  NETWORK_IDS.ArbitrumTestnet,
  NETWORK_IDS.AvalancheTestnet,
  NETWORK_IDS.BinanceTestnet,
  NETWORK_IDS.FantomTestnet,
  NETWORK_IDS.OptimismTestnet,
  NETWORK_IDS.PolygonTestnet,
  NETWORK_IDS.Rinkeby
]

export { WC_SUPPORTED_CHAINS }
