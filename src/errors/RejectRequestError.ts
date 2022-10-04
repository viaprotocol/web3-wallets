import { ERRCODE } from './codes'

class RejectRequestError extends Error {
  message = '[Wallet] User rejected the request'
  code = ERRCODE.UserRejected
}

export { RejectRequestError }
