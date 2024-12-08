function apiResponse(status, subcode, msg, data) {
    return {
        status: status,
        subcode: subcode,
        message: msg,
        data: data
    }
}

module.exports = { apiResponse }
