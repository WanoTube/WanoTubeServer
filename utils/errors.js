const ErrorStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
}

const throwError = (statusCode, msg) => {
  if (!msg) {
    switch (statusCode) {
      case ErrorStatus.BAD_REQUEST:
        msg = "Bad request!"
        break
      case ErrorStatus.UNAUTHORIZED:
        msg = "You are not authenticated!"
        break
      case ErrorStatus.PAYMENT_REQUIRED:
        msg = "Payment required!"
        break
      case ErrorStatus.FORBIDDEN:
        msg = "You are not allowed!"
        break
      case ErrorStatus.NOT_FOUND:
        msg = "Not found!"
        break
      case ErrorStatus.CONFLICT:
        msg = "Conflict"
        break
      case ErrorStatus.UNPROCESSABLE_ENTITY:
        msg = "Unprocessable Entity"
        break
      case ErrorStatus.INTERNAL_SERVER_ERROR:
        msg = "Something went wrong!"
        break
    }
  }

  const err = new Error(msg)
  err.statusCode = statusCode
  throw err
}

module.exports = {
  throwError,
  ErrorStatus,
}