/* eslint-disable */

import Web3 from 'web3'
import isMobile from 'ismobilejs'
import { PublicKey } from '@solana/web3.js'

import 'react-toastify/dist/ReactToastify.css'
import { Web3Provider } from '@ethersproject/providers'

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
    const deepLink = `https://metamask.app.link/dapp/${locationHrefNoProtocol}`
    window.location.href = deepLink
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

export const shortify = address => {
  const result = typeof address === 'string' ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}` : null
  return result
}

export const isValidAddress = (chainId: number | 'solana-testnet' | 'solana-mainnet', address: string) => {
  if (chainId === -1 || chainId === 'solana-testnet' || chainId === 'solana-mainnet') {
    try {
      return Boolean(new PublicKey(address))
    } catch (e) {
      return false
    }
  } else {
    return Web3.utils.isAddress(address)
  }
}

export const shortenAddress = address => {
  const result =
    typeof address === 'string'
      ? [address.slice(0, address.slice(0, 2) === '0x' ? 6 : 4), '...', address.slice(address.length - 4)].join('')
      : null
  return result
}

export const getDomainAddress = async (address: string, provider?: Web3Provider) => {
  try {
    if (provider) {
      const addressDomain = await provider.lookupAddress(address)
      return addressDomain
    }
  } catch (err) {}
  return null
}
