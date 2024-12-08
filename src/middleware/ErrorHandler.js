const ErrorHandler = (err, req, res, next) => {
    console.log('Middleware Error Handler');
    const errStatus = err?.statusCode || 500;
    const errMsg = err?.message;
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: err?.stack || {}
    })
}

module.exports = ErrorHandler;