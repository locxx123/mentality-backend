const express = require("express");
const router = express.Router();

router.use(require("./auth"));
router.use(require("./emotion"));
router.use(require("./chat"));
router.use(require("./analytics"));
router.use(require("./resources"));
router.use(require("./user"));

module.exports = router;
