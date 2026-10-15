CAGE LEGENDS — CODE-ONLY CONTROLLER PATCH

Only replace these two files in the existing GitHub Pages main-game folder:
- host.js
- controller.js

No animation images or other assets are included. Existing sprite files and controller artwork stay untouched.

Changes:
- High block only blocks head-level attacks; low block only blocks low kicks/ground-level attacks.
- Controller buttons use reliable pointer down/up/cancel handling to reduce stuck buttons.
- Block and movement inputs release when the controller loses focus or is hidden.
- Fighters are drawn 12px lower while the ground shadow stays in place (about one-eighth of the 98px draw height).

Syntax checked with node --check. Browser/live multiplayer test has not been performed.
