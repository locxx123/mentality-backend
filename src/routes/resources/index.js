import express from "express";
import { getResources } from "../../controllers/resources/get-resources.js";
import { getResourceById } from "../../controllers/resources/get-resource-by-id.js";

const router = express.Router();

router.get("/resources", getResources);
router.get("/resources/:id", getResourceById);

export default router;

