import type { TransactionReceipt } from '@ethersproject/providers'

import WalletProvider from './context/WalletProvider'
export { WalletContext } from './context/WalletContext'

export { BigNumber, toHex, shortenAddress, isValidAddress, parseAddressFromEns } from './utils'

export default WalletProvider

export type { TransactionReceipt }
