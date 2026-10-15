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


ATLAS UPDATE:
Player 1 is always red; Player 2 is always blue.
The fighter_red.png and fighter_blue.png files are now 4-frame-per-row sprite sheets using the supplied atlas idle/walk rows. The complete atlases are included as fighter_red_atlas.png and fighter_blue_atlas.png for later attack/ground animation mapping.
The full attack, block, hit, stun and ground sequences still need to be mapped to actions in a later pass.


GRAPHIC CONTROLLER UPDATE:
Uses the supplied controller artwork as an unchanged visual image with transparent clickable hit zones over the buttons and joystick. No text is drawn on top of the artwork. Buttons send action events and separate high/low block levels. This controller UI is a prototype; host.js must interpret the updated action names/levels for all moves to work in-game.
\n\nIMPORTANT ATLAS-ONLY FIX:\nRemoved the generated fighter_red.png and fighter_blue.png cutout files. host.js now loads the original fighter_red_atlas.png and fighter_blue_atlas.png directly and derives idle/walk frames in code from the atlas. Controller graphic and invisible touch zones are retained.\n

INDIVIDUAL ANIMATION INTEGRATION (v2):
Uses per-action frame PNGs extracted from the separate animation strips supplied by the user. No fighter_red.png, fighter_blue.png, fighter_red_atlas.png, or fighter_blue_atlas.png is used by host.js or included. Player 1 uses red_* frames; Player 2 uses blue_* frames. Controller uses the supplied graphic with transparent tap zones. The code is syntax-checked; live browser and multiplayer behavior still require testing.
