const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const app = require("../server");
const pool = require("../db/database");
const encodeBase62 = require("../utils/base62");

const originalQuery = pool.query;
const urls = new Map();
let nextId = 1;
let server;
let origin;
let previousBaseUrl;

before(async () => {
    previousBaseUrl = process.env.BASE_URL;
    process.env.BASE_URL = "https://short.example/";

    pool.query = async (query, params) => {
        if (query.includes("SELECT")) {
            const row = [...urls.values()].find(
                (url) => url.short_code === params[0]
            );
            return { rows: row ? [{ ...row }] : [] };
        }

        if (query.includes("INSERT INTO urls")) {
            const customInsert = query.includes("short_code");
            const id = nextId++;
            const url = customInsert
                ? {
                    id,
                    short_code: params[0],
                    original_url: params[1],
                    expiration_time: params[2]
                }
                : {
                    id,
                    short_code: null,
                    original_url: params[0],
                    expiration_time: params[1]
                };
            urls.set(id, url);
            return { rows: [{ id }] };
        }

        if (query.includes("UPDATE urls")) {
            const [shortCode, id] = params;
            const url = urls.get(id);
            url.short_code = shortCode;
            return { rows: [{ ...url }] };
        }

        throw new Error(`Unexpected query: ${query}`);
    };

    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    pool.query = originalQuery;
    if (previousBaseUrl === undefined) {
        delete process.env.BASE_URL;
    } else {
        process.env.BASE_URL = previousBaseUrl;
    }
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

test("creates a short URL at the configured public base URL", async () => {
    const response = await fetch(`${origin}/api/urls`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ long_url: "https://example.com/path" })
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {
        short_url: "https://short.example/1"
    });
});

test("redirects a generated short code to its original URL", async () => {
    const response = await fetch(`${origin}/1`, { redirect: "manual" });

    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "https://example.com/path");
});

test("rejects URL creation when long_url is missing", async () => {
    const response = await fetch(`${origin}/api/urls`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({})
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
        message: "long_url is required"
    });
});

test("encodes PostgreSQL BIGINT IDs returned as strings", () => {
    assert.equal(
        encodeBase62("9007199254740993"),
        encodeBase62(9007199254740993n)
    );
});
