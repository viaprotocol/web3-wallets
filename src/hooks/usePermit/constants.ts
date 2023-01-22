import type { TPermitToken, TPermitTokens } from './types'
import { NETWORK_IDS } from '@/constants'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const EIP712Domains = {
  [NETWORK_IDS.Ethereum]: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'verifyingContract', type: 'address' },
    { name: 'chainId', type: 'uint256' }
  ],
  [NETWORK_IDS.Polygon]: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'salt', type: 'bytes32' },
    { name: 'verifyingContract', type: 'address' }
  ]
}

const NONCES_FN = '0x7ecebe00'
const NAME_FN = '0x06fdde03'

const ERC2612_TOKENS: TPermitToken[] = [
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    chainId: NETWORK_IDS.Ethereum,
    name: 'USD Coin',
    version: '2'
  },
  {
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
    chainId: NETWORK_IDS.Polygon,
    name: 'USD Coin (PoS)',
    version: '1'
  },
  {
    address: '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
    chainId: NETWORK_IDS.Ethereum
  },
  {
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
    chainId: NETWORK_IDS.Ethereum
  },
  {
    address: '0x92D6C1e31e14520e676a687F0a93788B716BEff5', // DYDX
    chainId: NETWORK_IDS.Ethereum
  },
  {
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH
    chainId: NETWORK_IDS.Ethereum
  },
  {
    address: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', // ENS
    chainId: NETWORK_IDS.Ethereum
  }
]

const DAI_TOKENS: TPermitToken[] = [
  {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    chainId: NETWORK_IDS.Ethereum,
    name: 'Dai Stablecoin'
  },
  {
    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    chainId: NETWORK_IDS.Polygon,
    noncesFn: '0x2d0335ab',
    name: '(PoS) Dai Stablecoin'
  },
  {
    address: '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429', // GLM
    chainId: NETWORK_IDS.Ethereum
  },
  {
    address: '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215', // CHAI
    chainId: NETWORK_IDS.Ethereum
  }
]

const SUPPORTED_TOKENS: TPermitTokens = {
  DAI: DAI_TOKENS,
  ERC2612: ERC2612_TOKENS
}

export { MAX_UINT256, EIP712Domains, NONCES_FN, NAME_FN, SUPPORTED_TOKENS, DAI_TOKENS, ERC2612_TOKENS }
