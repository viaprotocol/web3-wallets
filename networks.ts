/* eslint-disable */

const infuraKey = process.env.REACT_APP_INFURA_KEY

if (!infuraKey) {
  throw new Error('Missing env REACT_APP_INFURA_KEY')
}

const networksRaw = [
  // Ethereum
  {
    chain_id: 1,
    name: 'Ethereum Mainnet',
    short_name: 'Ethereum',
    logo_url: 'https://etherscan.io/images/ethereum-icon.png',
    explorer_url: 'https://etherscan.io/',
    rpc_url: `https://mainnet.infura.io/v3/${infuraKey}`,
    currency_name: 'Ethereum',
    currency_symbol: 'ETH',
    currency_decimals: 18,
    is_testnet: false
  },
  {
    chain_id: 4,
    name: 'Rinkeby Testnet',
    short_name: 'Rinkeby Testnet',
    logo_url: 'https://etherscan.io/images/ethereum-icon.png',
    explorer_url: 'https://rinkeby.etherscan.io/',
    rpc_url: `https://rinkeby.infura.io/v3/${infuraKey}`,
    currency_name: 'Ethereum',
    currency_symbol: 'ETH',
    currency_decimals: 18,
    is_testnet: true
  },

  // Optimism
  {
    'chain_id': 10,
    'name': 'Optimism Mainnet',
    'short_name': 'Optimism',
    'logo_url': 'https://optimistic.etherscan.io/images/svg/brands/optimism.svg',
    'explorer_url': 'https://optimistic.etherscan.io/',
    'rpc_url': `https://mainnet.optimism.io`,
    'currency_name': 'OP Ethereum',
    'currency_symbol': 'ETH',
    'currency_decimals': 18,
    'is_testnet': false
  },
  {
    'chain_id': 69,
    'name': 'Optimism Testnet',
    'short_name': 'Optimism Testnet',
    'logo_url': 'https://optimistic.etherscan.io/images/svg/brands/optimism.svg',
    'explorer_url': 'https://kovan-optimistic.etherscan.io',
    'rpc_url': `https://kovan.optimism.io`,
    'currency_name': 'OP Ethereum',
    'currency_symbol': 'ETH',
    'currency_decimals': 18,
    'is_testnet': true
  },

  // Binance Smart Chain
  {
    chain_id: 56,
    name: 'Binance Smart Chain',
    short_name: 'BSC',
    logo_url: 'https://seeklogo.com/images/B/binance-coin-bnb-logo-CD94CC6D31-seeklogo.com.png',
    explorer_url: 'https://bscscan.com/',
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
    explorer_url: 'https://testnet.bscscan.com/',
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
    explorer_url: 'https://polygonscan.com/',
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
    explorer_url: 'https://mumbai.polygonscan.com/',
    rpc_url: 'https://rpc-mumbai.matic.today',
    currency_name: 'MATIC',
    currency_symbol: 'MATIC',
    currency_decimals: 18,
    is_testnet: true
  }

  // Arbitrum
  {
    'chain_id': 42161,
    'name': 'Arbitrum One',
    'short_name': 'Arbitrum',
    'logo_url': 'https://arbiscan.io/images/svg/brands/arbitrum.svg',
    'explorer_url': 'https://arbiscan.io/',
    'rpc_url': 'https://arb1.arbitrum.io/rpc',
    'currency_name': 'Arb Ethereum',
    'currency_symbol': 'ETH',
    'currency_decimals': 18,
    'is_testnet': false
  },
  {
    'chain_id': 421611,
    'name': 'Arbitrum Rinkeby',
    'short_name': 'Arbitrum Rinkeby',
    'logo_url': 'https://arbiscan.io/images/svg/brands/arbitrum.svg',
    'explorer_url': 'https://testnet.arbiscan.io/',
    'rpc_url': 'https://rinkeby.arbitrum.io/rpc',
    'currency_name': 'Arb Ethereum',
    'currency_symbol': 'ETH',
    'currency_decimals': 18,
    'is_testnet': true
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
        chainId: '0x' + item.chain_id.toString(16),
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

export const getNetworkById = (chainId: string | number) => {
  const network = networks.find(net => net.chain_id === chainId)
  if (network) {
    return network
  }
  throw new Error(`Unknown chainId ${chainId}`)
}

export default networks
