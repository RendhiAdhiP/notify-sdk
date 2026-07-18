# Changelog

## [2.0.0] - 2026-07-18

### Changed
-   **Package renamed**: `notification-sdk` → `rws-sdk` (import from `"rws-sdk"`)
-   **Class renamed**: `NotificationClient` → `RWSClient`
-   **Type export names**: All types now prefixed with `RWS` (e.g., `RWSConfig`, `RWSPayload`)
-   Payload fields use snake_case: `is_read`, `created_at`, `updated_at`, `owner_id`, `user_unique_code`
-   `autoConnect` now only auto-connects in browser environment (SSR-safe)

### Added
-   `client.origin` getter property
-   `setOrigin()` method for dynamic origin changes
-   Automatic room re-join on reconnect
-   Connection timeout with configurable `timeout` option
-   `RWSEventMap` type for strict event typing
-   Export all types from package entry point

### Removed
-   `reconnected` event (use `connect` event after reconnect)

### Fixed
-   SSR crash prevention — `connect()` rejects with clear error in non-browser
-   Memory leak on rapid connect/disconnect cycles
-   Race condition in `getNotifications` timeout handling

## [1.0.0] - 2026-07-01

### Added
-   Initial release
-   `NotificationClient` — WebSocket client dengan autentikasi dan auto-reconnect
-   Event listener system (`on`, `off`) untuk event `connect`, `disconnect`, `reconnecting`, `error`, `notification`
-   Channel subscription (`join`, `leave`, `leaveAll`)
-   Fetch notifikasi via WebSocket (`getNotifications`)
-   REST API wrapper untuk mark as read (`markAsRead`, `markAllAsRead`)
-   REST API wrapper untuk soft delete (`markAsDelete`)
-   Reconnection manager dengan exponential backoff
-   Auth manager untuk project token & origin
-   Full TypeScript type definitions
-   Framework-agnostic, zero dependency besides `socket.io-client`
