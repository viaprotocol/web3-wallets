import type { TPermitToken, TPermitTokens } from './types'
import { NETWORK_IDS } from '@/constants'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const EIP712PermitDomains = {
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

const EIP712Permit2Domain = [
  { name: 'name', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
]

const DaiPermitMessage = [
  { name: 'holder', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'expiry', type: 'uint256' },
  { name: 'allowed', type: 'bool' }
]

const PermitMessage = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' }
]

const PermitSingleMessage = [
  { name: 'details', type: 'PermitDetails' },
  { name: 'spender', type: 'address' },
  { name: 'sigDeadline', type: 'uint256' }
]

const PermitSingleDetails = [
  { name: 'token', type: 'address' },
  { name: 'amount', type: 'uint160' },
  { name: 'expiration', type: 'uint48' },
  { name: 'nonce', type: 'uint48' }
]

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
    name: 'USD Coin (PoS)'
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
  }
]

const SUPPORTED_TOKENS: TPermitTokens = {
  DAI: DAI_TOKENS,
  ERC2612: ERC2612_TOKENS
}

export { MAX_UINT256, EIP712PermitDomains, EIP712Permit2Domain, DaiPermitMessage, PermitMessage, PermitSingleMessage, PermitSingleDetails, NONCES_FN, NAME_FN, SUPPORTED_TOKENS, DAI_TOKENS, ERC2612_TOKENS }
