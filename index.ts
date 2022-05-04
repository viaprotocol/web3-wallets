import type { TransactionReceipt } from '@ethersproject/providers'

import WalletProvider from './WalletProvider'

export { WalletContext } from './WalletContext'
export { shortenAddress, isValidAddress, parseAddressFromEns, toHex } from './utils'

export default WalletProvider

export type { TransactionReceipt }
