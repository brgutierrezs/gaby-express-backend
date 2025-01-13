

const sendResponse  = (res, statusCode, status, message, data = null, errors = null ) => {
    res.status(statusCode).json({
        status,
        message,
        data,
        errors
    })
}

module.exports = {
    sendResponse
}