const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const { reverseGeocodeHandler, searchAddressHandler } = require("./geocode.controller");

router.use(protect);

router.post("/reverse", reverseGeocodeHandler);
router.get("/search", searchAddressHandler);

module.exports = router;
