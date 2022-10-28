import type { Keplr } from '@keplr-wallet/types'
import { BroadcastMode, makeSignDoc } from '@cosmjs/launchpad'
import type { CosmosTransaction } from 'rango-sdk/lib'
import { cosmos } from '@keplr-wallet/cosmos'
import { SigningStargateClient } from '@cosmjs/stargate'
import Long from 'long'
import type { TChainWallet } from '../types'
import { cosmosChainWalletMap } from '../constants'
import { getConnectedWallets } from './common'

const uint8ArrayToHex = (buffer: Uint8Array): string => {
  return [...buffer]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
}

const STARGATE_CLIENT_OPTIONS = {
  gasLimits: {
    send: 80000,
    ibcTransfer: 500000,
    transfer: 250000,
    delegate: 250000,
    undelegate: 250000,
    redelegate: 250000,
    // The gas multiplication per rewards.
    withdrawRewards: 140000,
    govVote: 250000
  }
}

const getCosmosAccounts = async (provider: Keplr, chainId: string) => {
  const offlineSigner = await provider.getOfflineSigner(chainId)
  const accounts = await offlineSigner?.getAccounts()

  return accounts.map((account: { address: string }) => {
    return account.address
  })
}

const getCosmosConnectedWallets = async (provider: Keplr) => {
  return await getConnectedWallets(cosmosChainWalletMap, (walletData: TChainWallet) => getCosmosAccounts(provider, walletData.network))
}

const executeCosmosTransaction = async (cosmosTx: CosmosTransaction, provider: Keplr) => {
  const { memo, sequence, account_number, chainId, msgs, fee, signType, rpcUrl } = cosmosTx.data

  if (!chainId) {
    throw new Error('ChainId is undefined from server')
  }
  if (!account_number) {
    throw new Error('account_number is undefined from server')
  }
  if (!sequence) {
    throw new Error('Sequence is undefined from server')
  }

  function manipulateMsg(m: any): any {
    if (!m.__type) {
      return m
    }
    if (m.__type === 'DirectCosmosIBCTransferMessage') {
      const result = { ...m } as any
      if (result.value.timeoutTimestamp) {
        result.value.timeoutTimestamp = Long.fromString(result.value.timeoutTimestamp) as any
      }
      if (result.value.timeoutHeight?.revisionHeight) {
        result.value.timeoutHeight.revisionHeight = Long.fromString(result.value.timeoutHeight.revisionHeight) as any
      }
      if (result.value.timeoutHeight?.revisionNumber) {
        result.value.timeoutHeight.revisionNumber = Long.fromString(result.value.timeoutHeight.revisionNumber) as any
      }
      return result
    }
    return { ...m }
  }

  const msgsWithoutType = msgs.map(m => ({
    ...manipulateMsg(m),
    __type: undefined
  }))

  if (signType === 'AMINO') {
    const SignMode = cosmos.tx.signing.v1beta1.SignMode
    const signDoc = makeSignDoc(msgsWithoutType as any, fee as any, chainId, memo || undefined, account_number, sequence)
    const signResponse = await provider.signAmino(chainId, cosmosTx.fromWalletAddress, signDoc)

    const signedTx = cosmos.tx.v1beta1.TxRaw.encode({
      bodyBytes: cosmos.tx.v1beta1.TxBody.encode({
        messages: cosmosTx.data.protoMsgs.map(m => ({ type_url: m.type_url, value: new Uint8Array(m.value) })),
        memo: signResponse.signed.memo
      }).finish(),
      authInfoBytes: cosmos.tx.v1beta1.AuthInfo.encode({
        signerInfos: [
          {
            publicKey: {
              type_url: '/cosmos.crypto.secp256k1.PubKey',
              value: cosmos.crypto.secp256k1.PubKey.encode({
                key: Buffer.from(
                  signResponse.signature.pub_key.value,
                  'base64'
                )
              }).finish()
            },
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON
              }
            },
            sequence: Long.fromString(signResponse.signed.sequence)
          }
        ],
        fee: {
          amount: signResponse.signed.fee.amount as any[],
          gasLimit: Long.fromString(signResponse.signed.fee.gas)
        }
      }).finish(),
      signatures: [Buffer.from(signResponse.signature.signature, 'base64')]
    }).finish()
    const result = await provider.sendTx(chainId, signedTx, BroadcastMode.Async)
    return uint8ArrayToHex(result)
  } else if (signType === 'DIRECT') {
    if (!rpcUrl) {
      throw new Error('rpc url is undefined from server')
    }

    const sendingSigner = provider?.getOfflineSigner(chainId)
    const sendingStargateClient = await SigningStargateClient?.connectWithSigner(
      rpcUrl,
      sendingSigner,
      // @ts-expect-error 👨🏼‍💻
      STARGATE_CLIENT_OPTIONS
    )
    const feeArray = fee?.amount[0] ? [{ denom: fee.amount[0].denom, amount: fee?.amount[0].amount }] : []

    const isIbcTx = cosmosTx.data.msgs.filter(k => k.__type === 'DirectCosmosIBCTransferMessage').length > 0
    const tmpGas = isIbcTx ? STARGATE_CLIENT_OPTIONS.gasLimits.ibcTransfer : STARGATE_CLIENT_OPTIONS.gasLimits.transfer

    const broadcastTxRes = await sendingStargateClient.signAndBroadcast(
      cosmosTx.fromWalletAddress,
      msgs as any,
      { gas: tmpGas.toString(), amount: feeArray }
    )
    return broadcastTxRes.transactionHash
  } else {
    throw new Error(`Sign type for cosmos not supported, type: ${signType}`)
  }
}

export { getCosmosAccounts, executeCosmosTransaction, getCosmosConnectedWallets }
