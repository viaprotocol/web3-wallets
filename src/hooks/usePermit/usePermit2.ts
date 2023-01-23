import { useCallback } from 'react'

import { MAX_UINT256 } from './constants'
import { signData } from './rpc'
import type { TPermitSingleDetails, TPermitSingleMessage, TPermitToken, TUsePermitOptions } from './types'
import { createTypedPermitSingleData, getPermit2Domain, getPermit2Nonce } from './utils'

const usePermit2 = (options: TUsePermitOptions) => {
  const { provider, token, spender, owner, chainId, deadline } = options

  const getSinglePermitTypedData = useCallback(async () => {
    const details: TPermitSingleDetails = {
      token,
      amount: MAX_UINT256,
      expiration: deadline || MAX_UINT256,
      nonce: await getPermit2Nonce(provider, owner, token, spender)
    }

    const message: TPermitSingleMessage = {
      details,
      spender,
      sigDeadline: deadline || MAX_UINT256
    }

    const permitToken: TPermitToken = {
      address: token,
      chainId,
      name: 'Permit2'
    }

    const domain = await getPermit2Domain(permitToken)
    return createTypedPermitSingleData(message, domain)
  }, [provider, spender, deadline])

  const permit = useCallback(async () => {
    const typedData = await getSinglePermitTypedData()

    return signData(provider, owner, typedData)
  }, [getSinglePermitTypedData, signData, provider, owner])

  return { permit }
}

export { usePermit2 }
