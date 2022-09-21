const ERRCODE = {
  UserRejected: 4001,
  UnrecognizedChain2: 4902,
  UnrecognizedChain: -32603
}

const ERROR_MESSAGE = {
  MetaMask: 'ACTION_REJECTED',
  xDeFi: 'XDEFI: user rejected the message signing',
  Keplr: 'Request rejected'
}

export { ERRCODE, ERROR_MESSAGE }
