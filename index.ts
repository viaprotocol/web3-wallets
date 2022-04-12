import type { TransactionReceipt } from '@ethersproject/providers'

import WalletProvider from './WalletProvider'

export { WalletContext } from './WalletContext'
export { shortenAddress, isValidAddress } from './utils'

export default WalletProvider

export type { TransactionReceipt }
