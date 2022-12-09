import { useCallback } from 'react'

import { MAX_UINT256 } from './constants'
import { signData } from './rpc'
import type { TPermitSingleMessage, TPermitSingleDetails, TUsePermitOptions, TPermitToken } from './types'
import { createTypedPermitSingleData, getPermit2Domain, getPermitNonce } from './utils'

const usePermit2 = (options: TUsePermitOptions) => {
  const { provider, token, spender, owner, chainId, deadline } = options

  const permitToken: TPermitToken = {
    address: token,
    chainId: chainId
  }

  const getSinglePermitTypedData = useCallback(async () => {
    const details: TPermitSingleDetails = {
      token,
      amount: MAX_UINT256,
      expiration: deadline || MAX_UINT256,
      nonce: await getPermitNonce(provider, permitToken),
    }

    const message: TPermitSingleMessage = {
        details,
        spender,
        sigDeadline: deadline || MAX_UINT256
    }

    const domain = await getPermit2Domain(provider, permitToken!)
    return createTypedPermitSingleData(message, domain)
  }, [provider, permitToken, spender, owner, deadline])

  const permit = useCallback(async () => {
    const typedData = await getSinglePermitTypedData()

    return signData(provider, owner, typedData)
  }, [getSinglePermitTypedData, signData, provider, owner])

  return { permit }
}

export { usePermit2 }
