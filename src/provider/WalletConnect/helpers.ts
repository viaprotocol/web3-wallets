import { WC_SUPPORTED_CHAINS } from './consts'

const isChainSupportedByWC = (chainId: number) => {
  return WC_SUPPORTED_CHAINS.includes(chainId as any)
}

export { isChainSupportedByWC }
