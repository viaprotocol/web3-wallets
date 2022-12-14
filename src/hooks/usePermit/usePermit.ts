import { useCallback, useMemo } from 'react'

import { MAX_UINT256, SUPPORTED_TOKENS } from './constants'
import { signData } from './rpc'
import type { TDaiPermitMessage, TERC2612PermitMessage, TUsePermitOptions } from './types'
import { createTypedDaiData, createTypedERC2612Data, getDomain, getPermitNonce, getTokenKey } from './utils'

const usePermit = (options: TUsePermitOptions) => {
  const { provider, token, spender, owner, chainId, deadline } = options

  const permitToken = useMemo(() => {
    return Object.values(SUPPORTED_TOKENS).flat().find(
      t =>
        t.address.toLowerCase() === token.toLowerCase()
        && t.chainId === chainId
    )
  }, [token, chainId])

  const getTypedData = useCallback(async () => {
    const permitNonce = await getPermitNonce(provider, permitToken!)
    const domain = getDomain(permitToken!)

    switch (getTokenKey(permitToken!)) {
      case 'DAI': {
        const message: TDaiPermitMessage = {
          holder: owner,
          spender,
          nonce: permitNonce,
          expiry: deadline || MAX_UINT256,
          allowed: true
        }
        return createTypedDaiData(message, domain, chainId)
      }
      case 'ERC2612': {
        const message: TERC2612PermitMessage = {
          owner,
          spender,
          value: MAX_UINT256,
          nonce: permitNonce,
          deadline: deadline || MAX_UINT256
        }
        return createTypedERC2612Data(message, domain, chainId)
      }
      default:
        throw new Error('Token not supported')
    }
  }, [provider, permitToken, spender, owner, deadline])

  const permit = useCallback(async () => {
    const typedData = await getTypedData()

    return signData(provider, owner, typedData)
  }, [getTypedData, signData, provider, owner])

  return { permit, isSupportedToken: !!permitToken }
}

export { usePermit }
