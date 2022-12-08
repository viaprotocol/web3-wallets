import { useCallback } from 'react'
import { DAI_TOKENS, MAX_UINT256, SUPPORTED_TOKENS } from './constants'
import { signData } from './rpc'
import type { TDaiPermitMessage, TERC2612PermitMessage, TRSVResponse, TUsePermitOptions } from './types'
import { createTypedDaiData, createTypedERC2612Data, getDomain, getPermitNonce, isTokenExists } from './utils'

const usePermit = (options: TUsePermitOptions) => {
  const { provider, token, spender, owner, chainId, deadline } = options

  const signDaiPermit = useCallback(async () => {
    const message: TDaiPermitMessage = {
      holder: owner,
      spender,
      nonce: await getPermitNonce(provider, token, chainId),
      expiry: deadline || MAX_UINT256,
      allowed: true
    }

    const domain = await getDomain(provider, token, chainId)
    const typedData = createTypedDaiData(message, domain)

    const sig = await signData(provider, owner, typedData)

    return { ...sig, ...message }
  }, [provider, token, spender, owner, chainId, deadline])

  const signERC2612Permit = useCallback(async (): Promise<TERC2612PermitMessage & TRSVResponse> => {
    const message: TERC2612PermitMessage = {
      owner,
      spender,
      value: MAX_UINT256,
      nonce: await getPermitNonce(provider, token, chainId),
      deadline: deadline || MAX_UINT256
    }

    const domain = await getDomain(provider, token, chainId)
    const typedData = createTypedERC2612Data(message, domain)

    const sig = await signData(provider, owner, typedData)

    return { ...sig, ...message }
  }, [provider, token, spender, owner, chainId, deadline])

  const permit = useCallback(async () => {
    const permitToken = { address: token, chainId }

    if (isTokenExists(SUPPORTED_TOKENS, permitToken)) {
      // We have a special case for DAI
      if (isTokenExists(DAI_TOKENS, permitToken)) {
        return signDaiPermit()
      } else {
        return signERC2612Permit()
      }
    } else {
      throw new Error('Token not supported')
    }
  }, [token, chainId, signDaiPermit, signERC2612Permit])

  return { permit }
}

export { usePermit }
