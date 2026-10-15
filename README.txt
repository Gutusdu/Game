CAGE LEGENDS — FRAME-BY-FRAME CLEANUP

All red_*_N.png and blue_*_N.png animation frames were regenerated from the two supplied full atlases.
The frames are detected from connected foreground components inside each animation panel, not split using approximate equal-width crops except where adjacent bottom-row poses merge.
The light grey checkerboard was made transparent using neutral-color masking while retaining dark outlines and saturated skin/clothing pixels.
Panel borders and labels are excluded from frame bounds. Each frame is cropped to its own detected sprite bounds and padded to a transparent canvas with a bottom-center foot anchor.
Player 1 uses red; Player 2 uses blue.
Host animation frame count for walk-left was updated to match the five visible frames.
The game and controller still require a live browser test after upload.

CONTROLLER FIX PASS:
Fixed controller Supabase key lookup to accept SUPABASE_PUBLISHABLE_KEY from config.js (previously the controller searched only other property names and could fail with CONFIG ERROR). Added blur/hidden-tab release to prevent stuck guard/movement inputs. Button payload names match host.js: jab, hook, uppercut, highKick, lowKick, ground, and high/low block.
