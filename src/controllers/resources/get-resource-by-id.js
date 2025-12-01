import Resource from "../../models/Resource.js";
import { baseResponse } from "../../config/response.js";

const getResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findOne({ _id: id, isActive: true });

        if (!resource) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "RESOURCE_NOT_FOUND",
            });
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: resource,
            msg: "GET_RESOURCE_SUCCESS",
        });

    } catch (error) {
        console.error("Get resource by id error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getResourceById };

