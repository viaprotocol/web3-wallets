import { useCallback, useMemo } from 'react'

import { MAX_UINT256, SUPPORTED_TOKENS } from './constants'
import { signData } from './rpc'
import type { TDaiPermitMessage, TERC2612PermitMessage, TUsePermitOptions } from './types'
import { createTypedDaiData, createTypedERC2612Data, getDomain, getPermitNonce, getTokenKey } from './utils'

const usePermit = (options: TUsePermitOptions) => {
  const { provider, token, spender, owner, chainId, deadline } = options

  const permitToken = useMemo(() => {
    return Object.values(SUPPORTED_TOKENS).flat().find(t => t.address.toLowerCase() === token.toLowerCase() && t.chainId === chainId)
  }, [token, chainId])

  const getDaiPermit = useCallback(async () => {
    const message: TDaiPermitMessage = {
      holder: owner,
      spender,
      nonce: await getPermitNonce(provider, permitToken!),
      expiry: deadline || MAX_UINT256,
      allowed: true
    }

    const domain = await getDomain(provider, permitToken!)
    return createTypedDaiData(message, domain)
  }, [provider, spender, owner, permitToken, deadline])

  const getERC2612Permit = useCallback(async () => {
    const message: TERC2612PermitMessage = {
      owner,
      spender,
      value: MAX_UINT256,
      nonce: await getPermitNonce(provider, permitToken!),
      deadline: deadline || MAX_UINT256
    }

    const domain = await getDomain(provider, permitToken!)
    return createTypedERC2612Data(message, domain)
  }, [provider, permitToken, spender, owner, deadline])

  const getTypedData = useCallback(async () => {
    switch (getTokenKey(permitToken!)) {
      case 'DAI':
        return getDaiPermit()
      case 'ERC2612':
        return getERC2612Permit()
      default:
        throw new Error('Token not supported')
    }
  }, [token, chainId, getDaiPermit, getERC2612Permit])

  const permit = useCallback(async () => {
    const typedData = await getTypedData()

    return signData(provider, owner, typedData)
  }, [getTypedData, signData, provider, owner])

  return { permit, isSupportedToken: !!permitToken }
}

export { usePermit }
