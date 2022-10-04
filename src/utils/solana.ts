import { NameRegistryState, getHashedName, getNameAccountKey } from '@solana/spl-name-service'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'

import { NETWORK_IDS, SOLANA_ENS_POSTFIX } from '../constants'

const SOL_TLD_AUTHORITY = /* #__PURE__ */ new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')
const solanaNetwork = /* #__PURE__ */ clusterApiUrl('mainnet-beta')
const connection = /* #__PURE__ */ new Connection(solanaNetwork)

const getInputKey = async (input: string) => {
  const hashedInputName = await getHashedName(input)
  const inputDomainKey = await getNameAccountKey(hashedInputName, undefined, SOL_TLD_AUTHORITY)
  return { inputDomainKey, hashedInputName }
}

export const checkEnsValid = async (input: string) => {
  let addressTemp = input
  if (input.slice(-4) === SOLANA_ENS_POSTFIX) {
    addressTemp = input.slice(0, -4)
  }

  const { inputDomainKey } = await getInputKey(addressTemp)
  const registry = await NameRegistryState.retrieve(connection, inputDomainKey)

  return registry
}

export const parseAddressFromEnsSolana = async (input: string) => {
  const addressTemp = input.slice(0, -4)
  const { inputDomainKey } = await getInputKey(addressTemp)
  const registry = await NameRegistryState.retrieve(connection, inputDomainKey)

  return registry.owner.toBase58()
}

export const parseEnsFromSolanaAddress = async (input: string) => {
  try {
    const response = await fetch(`https://api.solscan.io/domain?address=${input}`)
    const json = await response.json()
    return json?.data?.[0]?.name || null
  } catch (error) {
    console.error('Failed parse solana ENS', error)
    return null
  }
}

export const getCluster = (chainId: number | null) => {
  if (chainId === NETWORK_IDS.SolanaTestnet) {
    return 'testnet'
  }

  if (chainId === NETWORK_IDS.Solana) {
    return 'mainnet-beta'
  }

  throw new Error(`Unknown state.chainId ${chainId} -> no cluster`)
}
