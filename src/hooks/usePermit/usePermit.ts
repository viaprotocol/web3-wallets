import { useCallback } from 'react'

import { DAI_TOKENS, ERC2612_TOKENS, MAX_UINT256 } from './constants'
import { signData } from './rpc'
import type { TDaiPermitMessage, TERC2612PermitMessage, TUsePermitOptions } from './types'
import { createTypedDaiData, createTypedERC2612Data, getDomain, getPermitNonce, isTokenExists } from './utils'

const usePermit = (options: TUsePermitOptions) => {
  const { provider, token, spender, owner, chainId, deadline } = options

  const getDaiPermit = useCallback(async () => {
    const message: TDaiPermitMessage = {
      holder: owner,
      spender,
      nonce: await getPermitNonce(provider, token, chainId),
      expiry: deadline || MAX_UINT256,
      allowed: true
    }

    const domain = await getDomain(provider, token, chainId)
    return createTypedDaiData(message, domain)
  }, [provider, token, spender, owner, chainId, deadline])

  const getERC2612Permit = useCallback(async () => {
    const message: TERC2612PermitMessage = {
      owner,
      spender,
      value: MAX_UINT256,
      nonce: await getPermitNonce(provider, token, chainId),
      deadline: deadline || MAX_UINT256
    }

    const domain = await getDomain(provider, token, chainId)
    return createTypedERC2612Data(message, domain)
  }, [provider, token, spender, owner, chainId, deadline])

  const getTypedData = useCallback(async () => {
    const permitToken = { address: token, chainId }

    // We have a special case for DAI
    if (isTokenExists(DAI_TOKENS, permitToken)) {
      return getDaiPermit()
    } else if (isTokenExists(ERC2612_TOKENS, permitToken)) {
      return getERC2612Permit()
    } else {
      throw new Error('Token not supported')
    }
  }, [token, chainId, getDaiPermit, getERC2612Permit])

  const permit = useCallback(async () => {
    const typedData = await getTypedData()

    return signData(provider, owner, typedData)
  }, [getTypedData, signData, provider, owner])

  return { permit }
}

export { usePermit }
