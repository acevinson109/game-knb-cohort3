# GAME KNB? COHORT 3

This project keeps the original game in `index.html` and adds a Netlify Function that supplies STUN/TURN connection settings securely.

## Folder contents

- `index.html` — the complete game UI, questions, sounds, scoring, pyramid, elimination, knockout and champion flow.
- `netlify/functions/turn-ice.mjs` — server-side endpoint that obtains the Metered TURN ICE server list. The Metered API key is stored in Netlify, not in the public HTML.
- `netlify.toml` — tells Netlify where the website and function are.
- `DEPLOYMENT_GUIDE.md` — beginner setup and publishing instructions.
- `TEST_REPORT.md` — what was checked here and what still requires real accounts/devices.

## Important

This is a Netlify project, not a plain double-click HTML preview. The `/.netlify/functions/turn-ice` endpoint only exists when deployed through Netlify (or run locally with Netlify CLI). Complete the Metered setup in `DEPLOYMENT_GUIDE.md` before trying HOST or PLAYER.

PeerJS's public signaling service is still used for room discovery. WebRTC media/data connections use STUN and Metered TURN relay candidates. No game database is used: a room lives only while its host page is alive. Player reconnect uses a temporary browser-tab token (`sessionStorage`) and only works while that host room is still active.
