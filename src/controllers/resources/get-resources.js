import Resource from "../../models/Resource.js";
import { baseResponse } from "../../config/response.js";

const getResources = async (req, res) => {
    try {
        const { type, category, page = 1, limit = 20, search } = req.query;

        const query = { isActive: true };

        if (type) {
            query.type = type;
        }

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [resources, total] = await Promise.all([
            Resource.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Resource.countDocuments(query),
        ]);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                resources,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            msg: "GET_RESOURCES_SUCCESS",
        });

    } catch (error) {
        console.error("Get resources error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getResources };

