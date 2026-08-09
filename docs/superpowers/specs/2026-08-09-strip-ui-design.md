# Strip UI Design

**Date:** 2026-08-09

## Goal

Remove all existing browser UI so the repository is ready for a fresh interface implementation, while retaining the working Wasp backend.

## Scope

- Delete all React pages, components, client utilities, and client styles under `src/client/`.
- Delete the legacy global stylesheet `src/Main.css` and the favicon in `public/`.
- Remove page and route declarations, their reference imports, and the `client.rootComponent` configuration from `main.wasp.ts`.
- Preserve the Wasp app metadata, database seed, authentication configuration, server queries, server actions, and server utilities.
- Remove direct npm dependencies that are only used by the deleted UI, then regenerate the lockfile.

## Resulting Architecture

`main.wasp.ts` will describe a backend-only Wasp application: its database seed, authentication, queries, and actions remain registered, but it has no browser routes, page components, root React component, CSS, or static UI assets. Wasp's generated runtime remains responsible for the server and its operation endpoints.

## Compatibility and Failure Handling

The updated specification must compile without references to deleted files. Authentication remains configured for future UI work, but no login route is exposed until a replacement UI is built.

## Verification

- Run `wasp compile` as the Wasp configuration check.
- Run the existing automated tests after the deletion.
- Confirm no deleted client imports remain using a repository search.
