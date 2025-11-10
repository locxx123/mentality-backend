const express = require("express");
const router = express.Router();

const { getResources } = require("@src/controllers/resources/get-resources");
const { getResourceById } = require("@src/controllers/resources/get-resource-by-id");

router.get("/resources", getResources);
router.get("/resources/:id", getResourceById);

module.exports = router;

