const {
    findByShortCode,
    findByShortCodeForAlias,
    createUrl,
    updateShortCode,
    createCustomUrl
} = require("../repository/urlRepository");
const encodeBase62 = require("../utils/base62");

const getShortUrl = (req, shortCode) => {
    const baseUrl = process.env.BASE_URL
        ? process.env.BASE_URL.replace(/\/+$/, "")
        : `${req.protocol}://${req.get("host")}`;

    return `${baseUrl}/${encodeURIComponent(shortCode)}`;
};

const createShortUrl = async (req, res) => {

    try {

        const {
            long_url,
            custom_alias,
            expiration_date
        } = req.body;

        if (!long_url) {
            return res.status(400).json({
                message: "long_url is required"
            });
        }

        if (custom_alias) {

            const existing =
                await findByShortCodeForAlias(
                    custom_alias
                );

            if (existing) {
                return res.status(409).json({
                    message:
                        "Custom alias already exists"
                });
            }


            const url =
                await createCustomUrl(
                    custom_alias,
                    long_url,
                    expiration_date
                );


            return res.status(201).json({
                short_url: getShortUrl(req, url.short_code)
            });
        }

        const url = await createUrl(
            long_url,
            expiration_date
        );


        // Database ID → Base62
        const shortCode =
            encodeBase62(url.id);


        // Save generated short code
        await updateShortCode(
            url.id,
            shortCode
        );


        return res.status(201).json({
            short_url: getShortUrl(req, shortCode)
        });

    } catch (error) {

        console.error(
            "Create URL Error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};



// REDIRECT
const redirectToOriginalUrl = async (
    req,
    res
) => {

    try {

        const {
            short_code
        } = req.params;


        const url =
            await findByShortCode(
                short_code
            );


        // Not found
        if (!url) {
            return res.status(404).json({
                message:
                    "Short URL not found"
            });
        }


        // Expired
        if (
            url.expiration_time &&
            new Date() >
            new Date(url.expiration_time)
        ) {

            return res.status(410).json({
                message:
                    "Short URL has expired"
            });
        }

        return res.redirect(
            302,
            url.original_url
        );

    } catch (error) {

        console.error(
            "Redirect Error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    createShortUrl,
    redirectToOriginalUrl
};