//Client Errors.
export const RESPONSE_400 = (userMess) => ({ code: 400, message: userMess || "You request data is wrong!" })
export const RESPONSE_403 = (userMess) => ({ code: 403, message: userMess || "You have no access permission!" })
export const RESPONSE_404 = (userMess) => ({ code: 404, message: userMess || "Resource is not found!" })
export const RESPONSE_409 = (userMess) => ({ code: 409, message: userMess || "Resource alredy exist!" })

//Server Errors.
export const RESPONSE_500 = (userMess) => ({ code: 500, message: "Server Error!" })