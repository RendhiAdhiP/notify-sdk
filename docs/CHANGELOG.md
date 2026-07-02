# Changelog

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
