# server.js

## Purpose

The application entry point. Creates the Express app, reads the `PORT` environment variable, and starts an HTTP server that listens for incoming requests.

## Exports

None. This file is meant to be run directly (via `npm start` or `node src/server.js`).

## Behavior / business rules

- Loads the app from `./app.js`.
- Reads `PORT` from environment (default: `3000`).
- Starts the server synchronously and logs two lines to stdout:
  - `[server] running on http://localhost:<PORT>`
  - `[server] health: http://localhost:<PORT>/health`
- Does not handle graceful shutdown or uncaught exceptions; relies on the process manager (systemd, PM2, etc.) to restart on crash.

## Dependencies

- **Imports:** `./app`, `./config/env`
- **Depends on:** Nothing (it's the top-level entry point)

## Notes

- The log prefix `[server]` is used for filtering/parsing in monitoring systems.
- The health endpoint URL is logged as a convenience for developers starting the server locally.
