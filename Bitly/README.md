# Bitly URL Shortener Backend

## Setup

Set `DATABASE_URL` to a PostgreSQL connection string. Optionally set `PORT`
(defaults to `3000`) and `BASE_URL` (the public origin used in returned short
links, for example `https://short.example`).

Create the database table by running `db/schema.sql` against that database.
Then start the server with `npm start`; run the test suite with `npm test`.

## Endpoints

- `POST /api/urls` — accepts `long_url`, and optionally `custom_alias` and
  `expiration_date`; returns a `short_url`.
- `GET /:short_code` — redirects to the original URL, or returns `404` when
  the code does not exist and `410` when it has expired.
