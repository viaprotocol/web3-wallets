const networksRaw = [
  // Ethereum
  {
    chain_id: 1,
    name: 'Ethereum Mainnet',
    short_name: 'Ethereum',
    logo_url: 'https://etherscan.io/images/ethereum-icon.png',
    explorer_url: 'https://etherscan.io',
    rpc_url: 'https://rpc.ankr.com/eth',
    currency_name: 'Ethereum',
    currency_symbol: 'ETH',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 5,
    name: 'Ethereum Goerli',
    short_name: 'Ethereum',
    logo_url: 'https://etherscan.io/images/ethereum-icon.png',
    explorer_url: 'https://goerli.etherscan.io/',
    rpc_url: 'https://rpc.ankr.com/eth_goerli',
    currency_name: 'Ethereum',
    currency_symbol: 'GoerliETH',
    currency_decimals: 18,
    is_testnet: true
  },
  {
    chain_id: 4,
    name: 'Rinkeby Testnet',
    short_name: 'Rinkeby Testnet',
    logo_url: 'https://etherscan.io/images/ethereum-icon.png',
    explorer_url: 'https://rinkeby.etherscan.io',
    rpc_url: 'https://rpc.ankr.com/eth_rinkeby',
    currency_name: 'Ethereum',
    currency_symbol: 'ETH',
    currency_decimals: 18,
    is_testnet: true
  },

  // Optimism
  {
    chain_id: 10,
    name: 'Optimism Mainnet',
    short_name: 'Optimism',
    logo_url: 'https://optimistic.etherscan.io/images/svg/brands/optimism.svg',
    explorer_url: 'https://optimistic.etherscan.io',
    rpc_url: 'https://mainnet.optimism.io',
    currency_name: 'OP Ethereum',
    currency_symbol: 'opETH',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 69,
    name: 'Optimism Testnet',
    short_name: 'Optimism Testnet',
    logo_url: 'https://optimistic.etherscan.io/images/svg/brands/optimism.svg',
    explorer_url: 'https://kovan-optimistic.etherscan.io',
    rpc_url: 'https://kovan.optimism.io',
    currency_name: 'OP Ethereum',
    currency_symbol: 'opETH',
    currency_decimals: 18,
    is_testnet: true
  },

  // Binance Smart Chain
  {
    chain_id: 56,
    name: 'Binance Smart Chain',
    short_name: 'BSC',
    logo_url: 'https://seeklogo.com/images/B/binance-coin-bnb-logo-CD94CC6D31-seeklogo.com.png',
    explorer_url: 'https://bscscan.com',
    rpc_url: 'https://bsc-dataseed.binance.org/',
    currency_name: 'Binance Coin',
    currency_symbol: 'BNB',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 97,
    name: 'BSC Testnet',
    short_name: 'BSC Testnet',
    logo_url: 'https://seeklogo.com/images/B/binance-coin-bnb-logo-CD94CC6D31-seeklogo.com.png',
    explorer_url: 'https://testnet.bscscan.com',
    rpc_url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    currency_name: 'Binance Coin',
    currency_symbol: 'BNB',
    currency_decimals: 18,
    is_testnet: true
  },

  // Polygon
  {
    chain_id: 137,
    name: 'Polygon Mainnet',
    short_name: 'Polygon',
    logo_url: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    explorer_url: 'https://polygonscan.com',
    rpc_url: 'https://polygon-rpc.com',
    currency_name: 'MATIC',
    currency_symbol: 'MATIC',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 80001,
    name: 'Polygon Testnet',
    short_name: 'Mumbai',
    logo_url: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    explorer_url: 'https://mumbai.polygonscan.com',
    rpc_url: 'https://rpc-mumbai.matic.today',
    currency_name: 'MATIC',
    currency_symbol: 'MATIC',
    currency_decimals: 18,
    is_testnet: true
  },

  // Arbitrum
  {
    chain_id: 42161,
    name: 'Arbitrum One',
    short_name: 'Arbitrum',
    logo_url: 'https://arbiscan.io/images/svg/brands/arbitrum.svg',
    explorer_url: 'https://arbiscan.io',
    rpc_url: 'https://arb1.arbitrum.io/rpc',
    currency_name: 'Arb Ethereum',
    currency_symbol: 'arETH',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 421611,
    name: 'Arbitrum Rinkeby',
    short_name: 'Arbitrum Rinkeby',
    logo_url: 'https://arbiscan.io/images/svg/brands/arbitrum.svg',
    explorer_url: 'https://testnet.arbiscan.io',
    rpc_url: 'https://rinkeby.arbitrum.io/rpc',
    currency_name: 'Arb Ethereum',
    currency_symbol: 'arETH',
    currency_decimals: 18,
    is_testnet: true
  },

  // Fantom
  {
    chain_id: 250,
    name: 'Fantom Mainnet',
    short_name: 'Fantom',
    logo_url: 'https://ftmscan.com/images/svg/brands/fantom.svg',
    explorer_url: 'https://ftmscan.com',
    rpc_url: 'https://rpc.ftm.tools/',
    currency_name: 'Fantom',
    currency_symbol: 'FTM',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 4002,
    name: 'Fantom Testnet',
    short_name: 'Fantom Testnet',
    logo_url: 'https://testnet.ftmscan.com/images/svg/brands/fantom.svg',
    explorer_url: 'https://testnet.ftmscan.com',
    rpc_url: 'https://rpc.testnet.fantom.network/',
    currency_name: 'Fantom',
    currency_symbol: 'FTM',
    currency_decimals: 18,
    is_testnet: true
  },

  // Avalance
  {
    chain_id: 43114,
    name: 'Avalanche C-Chain',
    short_name: 'Avalanche',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Avalanche.svg',
    explorer_url: 'https://snowtrace.io',
    rpc_url: 'https://api.avax.network/ext/bc/C/rpc',
    currency_name: 'Avalanche',
    currency_symbol: 'AVAX',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 43113,
    name: 'Avalanche Fuji Testnet',
    short_name: 'Avalanche Fuji',
    logo_url: 'https://snowtrace.io/images/svg/brands/mainbrand-1.svg',
    explorer_url: 'https://testnet.snowtrace.io',
    rpc_url: 'https://api.avax-test.network/ext/bc/C/rpc',
    currency_name: 'Avalanche',
    currency_symbol: 'AVAX',
    currency_decimals: 18,
    is_testnet: true
  },

  // Harmony
  {
    chain_id: 1666600000,
    name: 'Harmony Mainnet Shard 0',
    short_name: 'Harmony',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Harmony.svg',
    explorer_url: 'https://explorer.harmony.one',
    rpc_url: 'https://api.harmony.one',
    currency_name: 'Harmony',
    currency_symbol: 'ONE',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 1666700000,
    name: 'Harmony Testnet Shard 0',
    short_name: 'Harmony Testnet',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Harmony.svg',
    explorer_url: 'https://explorer.pops.one',
    rpc_url: 'https://api.s0.b.hmny.io',
    currency_name: 'Harmony',
    currency_symbol: 'ONE',
    currency_decimals: 18,
    is_testnet: true
  },

  // HECO
  {
    chain_id: 128,
    name: 'Huobi ECO Chain Mainnet',
    short_name: 'HECO',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Huobi.svg',
    explorer_url: 'https://hecoinfo.com',
    rpc_url: 'https://http-mainnet.hecochain.com',
    currency_name: 'Huobi Token',
    currency_symbol: 'HT',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 256,
    name: 'Huobi ECO Chain Testnet',
    short_name: 'HECO Testnet',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Huobi.svg',
    explorer_url: 'https://testnet.hecoinfo.com',
    rpc_url: 'https://http-testnet.hecochain.com/',
    currency_name: 'Huobi Token',
    currency_symbol: 'HT',
    currency_decimals: 18,
    is_testnet: true
  },

  // OKEx
  {
    chain_id: 66,
    name: 'OKExChain Mainnet',
    short_name: 'OKEX',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Okex.svg',
    explorer_url: 'https://www.oklink.com/okexchain',
    rpc_url: 'https://exchainrpc.okex.org',
    currency_name: 'OEC Token',
    currency_symbol: 'OKT',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 65,
    name: 'OKExChain Testnet',
    short_name: 'OKEX Testnet',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Okex.svg',
    explorer_url: 'https://www.oklink.com/oec-test',
    rpc_url: 'https://exchaintestrpc.okex.org',
    currency_name: 'OEC Token',
    currency_symbol: 'OKT',
    currency_decimals: 18,
    is_testnet: true
  },

  // Gnosis/xDai
  {
    chain_id: 100,
    name: 'Gnosis Chain (formerly xDai)',
    short_name: 'Gnosis',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Gnosis.svg',
    explorer_url: 'https://blockscout.com/xdai/mainnet',
    rpc_url: 'https://rpc.gnosischain.com',
    currency_name: 'xDai Token',
    currency_symbol: 'xDAI',
    currency_decimals: 18,
    is_testnet: false
  },
  /* { // Testnet not ready
    chain_id: 100,
    name: 'Gnosis Chain Testnet',
    short_name: 'Gnosis Testnet',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Gnosis.svg',
    explorer_url: 'https://blockscout.com/xdai/testnet',
    rpc_url: 'https://blockscout.com/xdai/testnet/api/eth-rpc',
    currency_name: 'xDai Token',
    currency_symbol: 'xDAI',
    currency_decimals: 18,
    is_testnet: false
  }, */

  // Moonbeam
  {
    chain_id: 1284,
    name: 'Moonbeam',
    short_name: 'Moonbeam',
    logo_url: 'https://cdn.via.exchange/networks/Moonbeam.svg',
    explorer_url: 'https://moonscan.io',
    rpc_url: 'https://rpc.ankr.com/moonbeam',
    currency_name: 'Moonbeam',
    currency_symbol: 'GLMR',
    currency_decimals: 18,
    is_testnet: false
  },

  // Moonriver
  {
    chain_id: 1285,
    name: 'Moonriver',
    short_name: 'Moonriver',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Moonriver.svg',
    explorer_url: 'https://moonriver.moonscan.io',
    rpc_url: 'https://rpc.api.moonriver.moonbeam.network',
    currency_name: 'Moonriver',
    currency_symbol: 'MOVR',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 1287,
    name: 'Moonbase Testnet',
    short_name: 'Moonbase Testnet',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Moonriver.svg',
    explorer_url: 'https://moonbase.moonscan.io',
    rpc_url: 'https://rpc.api.moonbase.moonbeam.network',
    currency_name: 'Moonbase',
    currency_symbol: 'DEV',
    currency_decimals: 18,
    is_testnet: true
  },

  // Solana
  {
    chain_id: -1,
    name: 'Solana',
    short_name: 'Solana',
    logo_url: 'https://solscan.io/static/media/solana-sol-logo.b612f140.svg',
    explorer_url: 'https://solscan.io',
    rpc_url: 'https://api.mainnet-beta.solana.com',
    currency_name: 'Solana',
    currency_symbol: 'SOL',
    currency_decimals: 9,
    is_testnet: false
  },
  {
    chain_id: -1001,
    name: 'Solana Testnet',
    short_name: 'Solana Testnet',
    logo_url: 'https://solscan.io/static/media/solana-sol-logo.b612f140.svg',
    explorer_url: 'https://solscan.io/?cluster=testnet',
    rpc_url: 'https://api.testnet.solana.com',
    currency_name: 'Solana',
    currency_symbol: 'SOL',
    currency_decimals: 9,
    is_testnet: true
  },
  {
    chain_id: 1313161554,
    name: 'Aurora',
    short_name: 'Aurora',
    logo_url: 'https://webill.sfo3.digitaloceanspaces.com/networks/Aurora.svg',
    explorer_url: 'https://aurorascan.dev',
    rpc_url: 'https://mainnet.aurora.dev/',
    currency_name: 'Ethereum',
    currency_symbol: 'ETH',
    currency_decimals: 18,
    is_testnet: false
  },
  // Candle
  {
    chain_id: 534,
    name: 'Candle',
    short_name: 'Candle',
    logo_url: 'https://i.ibb.co/86yLQRZ/candlelogo.png',
    explorer_url: 'https://candleexplorer.com',
    rpc_url: 'https://rpc.cndlchain.com',
    currency_name: 'Candle',
    currency_symbol: 'CNDL',
    currency_decimals: 18,
    is_testnet: false
  },
  // Cronos
  {
    chain_id: 25,
    name: 'Cronos',
    short_name: 'Cronos',
    logo_url: 'https://cdn.via.exchange/networks/Cronos.svg',
    explorer_url: 'https://cronoscan.com',
    rpc_url: 'https://evm.cronos.org',
    currency_name: 'Cronos',
    currency_symbol: 'CRO',
    currency_decimals: 18,
    is_testnet: false
  }
]

const networks = networksRaw.map(item => ({
  ...item,
  chainID: item.chain_id,
  icon: item.logo_url,
  fullName: item.name,
  name: item.short_name,
  data: {
    params: [
      {
        chainId: `0x${item.chain_id.toString(16)}`,
        chainName: item.name,
        nativeCurrency: {
          name: item.currency_name,
          symbol: item.currency_symbol,
          decimals: item.currency_decimals
        },
        rpcUrls: [item.rpc_url],
        blockExplorerUrls: [item.explorer_url]
      }
    ]
  }
}))

export const rpcMapping = networksRaw.reduce((mapper: { [chainId: number]: string }, network) => {
  mapper[network.chain_id] = network.rpc_url
  return mapper
}, {})

export const getNetworkById = (chainId: string | number) => {
  const network = networks.find(net => net.chain_id === chainId)
  if (network) {
    return network
  }

  throw new Error(`Unknown chainId ${chainId}`)
}

export const supportedNetworkIds = networks.map(net => net.chainID)

export default networks
