import { useCallback, useMemo } from 'react'

import { MAX_UINT256, SUPPORTED_TOKENS } from './constants'
import { signData } from './rpc'
import type { TDaiPermitMessage, TERC2612PermitMessage, TUsePermitOptions, TPermitToken, TPermit2Message } from './types'
import { createTypedDaiData, createTypedERC2612Data, getPermit2Domain, getPermitNonce, getTokenKey } from './utils'

const usePermit2 = (options: TUsePermitOptions) => {
  const { provider, token, spender, owner, chainId, deadline } = options

  const permitToken: TPermitToken = {
    address: token,
    chainId: chainId
  }

  const getPermit = useCallback(async () => {
    const message: TPermit2Message = {
        details: {
            token,
            amount: MAX_UINT256,
            expiration: deadline || MAX_UINT256,
            nonce: await getPermitNonce(provider, permitToken),
        },
        spender,
        sigDeadline: deadline || MAX_UINT256
    }

    const domain = await getPermit2Domain(provider, permitToken!)
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
