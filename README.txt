CAGE LEGENDS — PRE-FIGHT LOBBY + CONTROLLER
Files: index.html (iPad lobby/arena), host.js (fight engine), controller.html and controller.js (phone controller), config.js (Supabase URL/key), README.txt.

New in this build:
- Pre-fight GUI: choose VS AI or VS HUMAN, select character, create a room, connect controller(s), then press START FIGHT.
- Restart Fight button resets health/stamina and positions without needing a new room.
- VS HUMAN mode supports a second phone using controller.html?player=2.
- VS AI mode uses one controller and an AI opponent.

Install: upload all six files to the root of the existing GitHub Pages repository and commit. On iPad open the normal Pages URL. Choose mode and fighter, tap CREATE ROOM, then connect phone(s). For player 1 use /controller.html. For player 2 use /controller.html?player=2. Enter the same room code on each phone. The Start Fight button activates after the required controller(s) connect.

The config.js file contains the Supabase project URL and publishable key supplied by the user. Do not put a secret/service_role key in client-side code.
Prototype status: networking and controls need real-device testing; this is an early build, not a polished production game.
