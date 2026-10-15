CAGE LEGENDS MULTIPLAYER PROTOTYPE
Files: index.html (iPad host), controller.html (phone controller), host.js, controller.js, config.js.

ONE-TIME SETUP
1. In config.js replace PASTE_YOUR_SB_PUBLISHABLE_KEY_HERE with your Supabase publishable key (the public sb_publishable key, not a secret/service_role key).
2. Upload ALL files to the root of your existing GitHub Pages repository and commit.
3. On iPad open your GitHub Pages URL ending in / (index.html). Tap CREATE MULTIPLAYER ROOM. A 5-character room code appears.
4. On phone open the same GitHub Pages domain plus /controller.html, e.g. https://YOURNAME.github.io/YOURREPO/controller.html
5. Enter the room code and tap CONNECT. Phone buttons send actions to the iPad.

Supabase Realtime Broadcast is used; no database table or service_role key is required. Do not publish any secret key.
This is an early prototype. It needs testing on your devices; connection latency and free-tier limits may vary. The AI opponent is still on the iPad.
