const baseResponse = (res, {
    success = true,
    statusCode = 200,
    data = null,
    msg = null,
} = {}) => {
    return res.status(statusCode).json({
        success,
        statusCode,
        responseTimestamp: new Date().toISOString(),
        ...(data !== null && { data }),
        ...(msg && { msg })
    });
};

module.exports = { baseResponse };