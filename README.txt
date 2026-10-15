CAGE LEGENDS — updated arena build

Upload/replace all files in the ZIP in the ROOT of your existing GitHub Pages repository, then Commit changes. Keep config.js and its current Supabase project key intact.

Files: index.html (iPad/host), controller.html (phone controls), host.js (fight), controller.js (phone input), config.js (Supabase config), arena.png (arena artwork cropped from the supplied concept sheet).

New in this build:
- Player and opponent name fields; names are shown over fighters.
- Clear LEFT HAND BLOCK hold button on the phone controller.
- Critical hits cause a short burst of red blood particles, plus stronger screen shake and stun.
- Smoother, more detailed drawn fighters and a cropped arena image based on the supplied artwork.
- Existing room/multiplayer setup and fighter selection retained.

Controller URL for player 1: https://YOUR-GITHUB-PAGES-URL/controller.html
Player 2 for VS HUMAN: https://YOUR-GITHUB-PAGES-URL/controller.html?player=2

This remains a browser-game prototype. The uploaded image was a labeled concept collage, not a clean transparent animation atlas, so the arena art is used as the backdrop while fighters are currently drawn in code; clean individual transparent animation frames can be integrated when available.
