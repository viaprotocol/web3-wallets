import { PublicKey } from '@solana/web3.js'
import type { BytesLike } from 'ethers'
import { ethers } from 'ethers'
import type { Hexable } from 'ethers/lib/utils'
import isMobile from 'ismobilejs'

import {
  EVM_BASE_TOKEN_ADDRESS,
  EVM_ENS_POSTFIX,
  NETWORK_IDS,
  SOLANA_BASE_TOKEN_ADDRESS,
  SOLANA_ENS_POSTFIX
} from '../constants'
import { getNetworkById, supportedNetworkIds } from '../networks'

import { checkEnsValid, parseAddressFromEnsSolana } from './solana'

export const { BigNumber } = ethers

export const toHex = (value: BytesLike | Hexable | number | bigint) => ethers.utils.hexlify(value)

export const isValidAddress = async (chainId: number, address: string) => {
  if (chainId > 0) {
    // Chain ID > 0 === EVM-like network
    if (address.slice(-4) === EVM_ENS_POSTFIX) {
      const rpc = getNetworkById(NETWORK_IDS.Ethereum).rpc_url
      const provider = new ethers.providers.JsonRpcProvider(rpc)
      const result = await provider.resolveName(address)
      return !!result
    }
    return ethers.utils.isAddress(address)
  }
  if (chainId === NETWORK_IDS.Solana || chainId === NETWORK_IDS.SolanaTestnet) {
    try {
      if (address.slice(-4) === SOLANA_ENS_POSTFIX) {
        await checkEnsValid(address)
        return true
      }
      return Boolean(new PublicKey(address))
    } catch (e) {
      return false
    }
  }
  if (chainId === NETWORK_IDS.TON || chainId === NETWORK_IDS.TONTestnet) {
    // example:
    // EQBj0KYB_PG6zg_F3sjLwFkJ5C02aw0V10Dhd256c-Sr3BvF
    // EQCudP0_Xu7qi-aCUTCNsjXHvi8PNNL3lGfq2Wcmbg2oN-Jg
    // EQAXqKCSrUFgPKMlCKlfyT2WT7GhVzuHyXiPtDvT9s5FMp5o
    const prefix = address.slice(0, 2)
    return (
      address.length === 48
      && (prefix === 'EQ' || prefix === 'kQ' || prefix === 'Ef' || prefix === 'UQ')
      && /^[a-zA-Z0-9_-]*$/.test(address)
    )
  }
  throw new Error(`Not implemented or wrong chainId ${chainId}`)
}

export const shortenAddress = (address: string) => {
  if (address.length) {
    if (address[address.length - 4] === '.') {
      // If ENS - Return ENS name
      return address
    }
    return [address.slice(0, address.slice(0, 2) === '0x' ? 6 : 4), '...', address.slice(address.length - 4)].join('')
  }

  return ''
}

export const getAddressUrl = (chainId: number, address: string) => {
  if (!chainId || !address || !supportedNetworkIds.includes(chainId)) {
    return undefined
  }

  const network = getNetworkById(chainId)
  const explorerUrl = network.data.params[0].blockExplorerUrls[0]

  if (network.chain_id > 0) {
    return `${explorerUrl}/address/${address}`
  }

  if (network.chain_id === NETWORK_IDS.Solana) {
    return `${explorerUrl}/account/${address}`
  }

  if (network.chain_id === NETWORK_IDS.SolanaTestnet) {
    return `${explorerUrl}/account/${address}?cluster=testnet`
  }

  throw new Error(`getAddressUrl: not implemented for chainId ${chainId}`)
}

export const getTxUrl = (chainId: number, txHash: string): string | undefined => {
  if (!chainId || !txHash || !supportedNetworkIds.includes(chainId)) {
    return undefined
  }

  const network = getNetworkById(chainId)
  const explorerUrl = network.data.params[0].blockExplorerUrls[0]

  if (network.chain_id > 0) {
    return `${explorerUrl}/tx/${txHash}`
  }

  if (network.chain_id === NETWORK_IDS.Solana) {
    return `${explorerUrl}/tx/${txHash}`
  }

  if (network.chain_id === NETWORK_IDS.SolanaTestnet) {
    return `${explorerUrl}/tx/${txHash}?cluster=testnet`
  }

  throw new Error(`getTxUrl: not implemented for chainId ${chainId}`)
}

export const getNativeTokenAddress = (chainId: number) => {
  if (chainId === NETWORK_IDS.Solana || chainId === NETWORK_IDS.SolanaTestnet) {
    return SOLANA_BASE_TOKEN_ADDRESS
  }

  return EVM_BASE_TOKEN_ADDRESS
}

export const parseAddressFromEns = async (input: string) => {
  if (input.slice(-4) === SOLANA_ENS_POSTFIX) {
    return parseAddressFromEnsSolana(input)
  }

  if (input.slice(-4) === EVM_ENS_POSTFIX) {
    const rpc = getNetworkById(NETWORK_IDS.Ethereum).rpc_url
    const provider = new ethers.providers.JsonRpcProvider(rpc)
    return provider.resolveName(input) as Promise<string>
  }
  return input
}

export const isEvmChain = (chainId: number) => chainId > 0

export const goMetamask = () => {
  if (isMobile(window.navigator).any) {
    const locationHref = window.location.href
    let locationHrefNoProtocol = locationHref.replace('http://', '')
    locationHrefNoProtocol = locationHrefNoProtocol.replace('https://', '')
    window.location.href = `https://metamask.app.link/dapp/${locationHrefNoProtocol}`
  } else {
    window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn')
  }
}

export const goPhantom = () => {
  const url = 'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa'
  if (window) {
    window.open(url, '_blank')
  }
}
