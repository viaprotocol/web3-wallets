import { ERRCODE } from '..'

class RejectRequestError extends Error {
  message = '[Wallet] User rejected the request'
  code = ERRCODE.UserRejected
}

export { RejectRequestError }
