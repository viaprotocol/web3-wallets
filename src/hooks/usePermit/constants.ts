import type { TPermitToken, TPermitTokens } from './types'
import { NETWORK_IDS } from '@/constants'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
]

const NONCES_FN = '0x7ecebe00'
const NAME_FN = '0x06fdde03'

const ERC2612_TOKENS: TPermitToken[] = [
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    chainId: NETWORK_IDS.Ethereum
  },
  {
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
    chainId: NETWORK_IDS.Polygon
  }
]

const DAI_TOKENS: TPermitToken[] = [
  {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    chainId: NETWORK_IDS.Ethereum
  },
  {
    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    chainId: NETWORK_IDS.Polygon,
    noncesFn: '0x2d0335ab'
  }
]

const SUPPORTED_TOKENS: TPermitTokens = {
  DAI: DAI_TOKENS,
  ERC2612: ERC2612_TOKENS
}

export { MAX_UINT256, EIP712Domain, NONCES_FN, NAME_FN, SUPPORTED_TOKENS, DAI_TOKENS, ERC2612_TOKENS }
