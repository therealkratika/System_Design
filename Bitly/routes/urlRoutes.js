const express = require("express");

const {
    createShortUrl,
    redirectToOriginalUrl
} = require("../controllers/urlControllers");

const router = express.Router();


// Create short URL
router.post("/api/urls", createShortUrl);


// Redirect
router.get("/:short_code", redirectToOriginalUrl);


module.exports = router;