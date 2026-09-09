const pool = require("../db/database");
const findByShortCode = async (shortCode) => {
    const result = await pool.query(
        `SELECT *
         FROM urls
         WHERE short_code = $1`,
        [shortCode]
    );

    return result.rows[0];
};

const findByShortCodeForAlias = async (shortCode) => {
    const result = await pool.query(
        `SELECT id
         FROM urls
         WHERE short_code = $1`,
        [shortCode]
    );

    return result.rows[0];
};


// Create URL and return generated ID
const createUrl = async (
    originalUrl,
    expirationTime
) => {
    const result = await pool.query(
        `INSERT INTO urls
        (
            original_url,
            expiration_time
        )
        VALUES ($1, $2)
        RETURNING id`,
        [
            originalUrl,
            expirationTime || null
        ]
    );

    return result.rows[0];
};


// Update generated short code
const updateShortCode = async (
    id,
    shortCode
) => {
    const result = await pool.query(
        `UPDATE urls
         SET short_code = $1
         WHERE id = $2
         RETURNING *`,
        [shortCode, id]
    );

    return result.rows[0];
};

const createCustomUrl = async (
    customAlias,
    originalUrl,
    expirationTime
) => {
    const result = await pool.query(
        `INSERT INTO urls
        (
            short_code,
            original_url,
            expiration_time
        )
        VALUES ($1, $2, $3)
        RETURNING *`,
        [
            customAlias,
            originalUrl,
            expirationTime || null
        ]
    );

    return result.rows[0];
};


module.exports = {
    findByShortCode,
    findByShortCodeForAlias,
    createUrl,
    updateShortCode,
    createCustomUrl
};