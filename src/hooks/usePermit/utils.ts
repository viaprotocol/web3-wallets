import type { Web3Provider } from '@ethersproject/providers'
import utf8 from 'utf8'
import { BigNumber } from 'ethers/lib/ethers'
import { hexZeroPad } from 'ethers/lib/utils'
import { EIP712DomainEthereum, EIP712DomainPolygon, NAME_FN, NONCES_FN, SUPPORTED_TOKENS } from './constants'
import { call } from './rpc'
import type { TDaiPermitMessage, TDomain, TERC2612PermitMessage, TPermitToken, TPermitTypes } from './types'
import { NETWORK_IDS } from '@/constants'

const hexToUtf8 = function (hex: string) {
  let str = ''
  let code = 0
  hex = hex.replace(/^0x/i, '')

  // remove 00 padding from either side
  hex = hex.replace(/^(?:00)*/, '')
  hex = hex.split('').reverse().join('')
  hex = hex.replace(/^(?:00)*/, '')
  hex = hex.split('').reverse().join('')

  const l = hex.length

  for (let i = 0; i < l; i += 2) {
    code = parseInt(hex.substr(i, 2), 16)
    // if (code !== 0) {
    str += String.fromCharCode(code)
    // }
  }

  return utf8.decode(str)
}

const addZeros = (numZeros: number) => ''.padEnd(numZeros, '0')

const getTokenName = async (provider: any, address: string) => {
  const hex: string = await call(provider, address, NAME_FN)
  return hexToUtf8(hex.substr(130))
}

const getDomain = (permitToken: TPermitToken): TDomain => {
  const { address, chainId, name } = permitToken

  const domain: TDomain = chainId === NETWORK_IDS.Ethereum ? { name, version: '1', chainId, verifyingContract: address } : { name, version: '1', verifyingContract: address, salt: hexZeroPad(BigNumber.from(chainId).toHexString(), 32) }
  console.log({ domain })
  return domain
}

const createTypedDaiData = (message: TDaiPermitMessage, domain: TDomain, chainId: number) => {
  const typedData = {
    types: {
      EIP712Domain: chainId === NETWORK_IDS.Ethereum ? EIP712DomainEthereum : EIP712DomainPolygon,
      Permit: [
        { name: 'holder', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'allowed', type: 'bool' }
      ]
    },
    primaryType: 'Permit',
    domain,
    message
  }

  return typedData
}

const createTypedERC2612Data = (message: TERC2612PermitMessage, domain: TDomain, chainId: number) => {
  const typedData = {
    types: {
      EIP712Domain: chainId === NETWORK_IDS.Ethereum ? EIP712DomainEthereum : EIP712DomainPolygon,
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    primaryType: 'Permit',
    domain,
    message
  }

  return typedData
}

const isTokenExists = (tokens: TPermitToken[], token: TPermitToken) => {
  return tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId)
}

const getPermitNonce = async (provider: Web3Provider, token: TPermitToken): Promise<number> => {
  const { address, noncesFn } = token
  const owner = await provider.getSigner().getAddress()

  return call(provider, address, `${noncesFn || NONCES_FN}${addZeros(24)}${owner.slice(2)}`)
}

const getTokenKey = (token: TPermitToken) => {
  const entry = Object.entries(SUPPORTED_TOKENS).find(([_, tokens]) => isTokenExists(tokens, token))
  if (!entry) {
    throw new Error('Token not supported')
  }

  return entry[0] as TPermitTypes
}

export { addZeros, isTokenExists, getTokenName, getDomain, createTypedDaiData, createTypedERC2612Data, getPermitNonce, getTokenKey }
