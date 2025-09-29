const { baseResponse } = require("@src/config/response");

const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        console.log("Validation result:", result.error);

        if (!result.success) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Validation error",
                data: result.error.errors,
            });
        }

        req.body = result.data.body; // chỉ lấy body sạch
        next();
    };
}

module.exports = validate;
