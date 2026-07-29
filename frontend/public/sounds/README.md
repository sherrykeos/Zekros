# ZEKROS Sound Assets Directory

Place your production `.mp3` audio files in this directory (`frontend/public/sounds/`).

## Expected Sound File Names

| Sound Key | Default File Path | Category | Description |
|---|---|---|---|
| `click` | `/sounds/click.mp3` | `ui` | UI Button / Toggle clicks |
| `move` | `/sounds/move.mp3` | `gameplay` | Current player piece drop |
| `opponentMove` | `/sounds/opponentMove.mp3` | `gameplay` | Opponent piece drop |
| `invalid` | `/sounds/invalid.mp3` | `gameplay` | Invalid cell move attempt |
| `reclaim` | `/sounds/reclaim.mp3` | `gameplay` | Piece reclaim token action |
| `disappear` | `/sounds/disappear.mp3` | `gameplay` | Active piece vanish effect |
| `victory` | `/sounds/victory.mp3` | `gameplay` | Match win cue |
| `defeat` | `/sounds/defeat.mp3` | `gameplay` | Match loss cue |
| `draw` | `/sounds/draw.mp3` | `gameplay` | Match draw cue |
| `gameStart` | `/sounds/gameStart.mp3` | `gameplay` | Match start chime |
| `gameEnd` | `/sounds/gameEnd.mp3` | `gameplay` | Match completion chime |
| `playerJoin` | `/sounds/playerJoin.mp3` | `system` | Player joined multiplayer room |
| `playerLeave` | `/sounds/playerLeave.mp3` | `system` | Player left multiplayer room |
| `reconnect` | `/sounds/reconnect.mp3` | `system` | Socket connection re-established |
| `notification` | `/sounds/notification.mp3` | `ui` | Toast / Code copy notification |

All audio loading fails silently if files are absent, keeping the application stable and crash-free.
