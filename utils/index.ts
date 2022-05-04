import { PublicKey } from '@solana/web3.js'
import { isAddress } from 'ethers/lib/utils'
import { ethers } from 'ethers'
import isMobile from 'ismobilejs'

import { checkEnsValid, parseAddressFromEnsSolana } from './solana'
import { getNetworkById } from '../networks'

export * from './solana'
export * from './evm'
export * from './useBalance'

export const isValidAddress = async (chainId: number, address: string) => {
  if (chainId > 0) {
    if (address.slice(-4) === '.eth') {
      const rpc = getNetworkById(1).rpc_url
      const provider = new ethers.providers.JsonRpcProvider(rpc)
      const result = await provider.resolveName(address)
      return !!result
    }
    return isAddress(address)
  }
  if (chainId === -1 || chainId === -1001) {
    try {
      if (address.slice(-4) === '.sol') {
        await checkEnsValid(address)
        return true
      }
      return Boolean(new PublicKey(address))
    } catch (e) {
      return false
    }
  }
  if (chainId === -3 || chainId === -1003) {
    // example:
    // EQBj0KYB_PG6zg_F3sjLwFkJ5C02aw0V10Dhd256c-Sr3BvF
    // EQCudP0_Xu7qi-aCUTCNsjXHvi8PNNL3lGfq2Wcmbg2oN-Jg
    // EQAXqKCSrUFgPKMlCKlfyT2WT7GhVzuHyXiPtDvT9s5FMp5o
    return (
      address.length === 48 &&
      (address.slice(0, 2) === 'EQ' ||
        address.slice(0, 2) === 'kQ' ||
        address.slice(0, 2) === 'Ef' ||
        address.slice(0, 2) === 'UQ') &&
      /^[a-zA-Z0-9_-]*$/.test(address)
    )
  }
  throw new Error(`Not implemented or wrong chainId ${chainId}`)
}

export const shortenAddress = address => {
  if (typeof address === 'string') {
    if (address.at(-4) === '.') {
      return address
    }
    return [address.slice(0, address.slice(0, 2) === '0x' ? 6 : 4), '...', address.slice(address.length - 4)].join('')
  }

  return ''
}

export const nativeTokenAddress = (chainId: number) => {
  if (chainId === -1 || chainId === -1001) {
    return 'So11111111111111111111111111111111111111111'
  }
  return '0x0000000000000000000000000000000000000000'
}

export const parseAddressFromEns = async (input: string) => {
  if (input.slice(-4) === '.sol') {
    return parseAddressFromEnsSolana(input)
  }
  if (input.slice(-4) === '.eth') {
    const rpc = getNetworkById(1).rpc_url
    const provider = new ethers.providers.JsonRpcProvider(rpc)
    return provider.resolveName(input) as Promise<string>
  }
  return input
}

export const toHex = (value) => ethers.utils.hexlify(value)

export const goMetamask = () => {
  if (isMobile(window.navigator).any) {
    /*
        open app in mobile metamask
        info: https://docs.metamask.io/guide/mobile-best-practices.html#deeplinking
        `https://checkout.webill.io/nft/bb811382-1f1b-4376-8884-5f74bd808f83/`
        ->
        `https://metamask.app.link/dapp/checkout.webill.io/nft/bb811382-1f1b-4376-8884-5f74bd808f83/`
      */
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
