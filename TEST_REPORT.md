# Test report — GAME KNB? COHORT 3 upgrade

## Checks performed on the generated project

- Confirmed the original uploaded game HTML was used as the starting point.
- Preserved the original question arrays, audio routines, graphics/CSS, pyramid mechanics, elimination/knockout/champion rendering and host-side game functions.
- Confirmed the main file is named `index.html` and remains at the project root.
- Added a Netlify Function for Metered TURN ICE server retrieval; its API key is read from Netlify environment variables, not hard-coded in the HTML.
- Added PeerJS ICE configuration for both host and player peers.
- Added temporary browser-tab reconnect identity and host-side team reattachment while a room remains alive.
- Added lobby disconnect grace cleanup, connection status text, ended-room rejection, and host page-exit cleanup.
- Added Netlify configuration and beginner deployment documentation.

## Not tested / cannot be certified from this workspace

- No Netlify site has been deployed from this project.
- No Metered account, credential, API key, or paid relay allocation was available here.
- No physical HOST/PLAYER devices on separate mobile/Wi-Fi networks were available for end-to-end testing.
- Therefore worldwide multiplayer is **not certified as working yet**. The code is prepared to use Metered TURN after configuration, but it must be tested on the live deployment.

## Required live acceptance tests

1. Open the deployed HTTPS URL and confirm `/.netlify/functions/turn-ice` returns a TURN server list.
2. Host on one Wi-Fi network; join from a phone using mobile data.
3. Join at least two more player devices; verify all see the same lobby and scores.
4. Run a complete round and verify questions, countdown, buzz, answers, pyramid movement, elimination, knockout and champion state remain synchronized.
5. Refresh a player, re-enter the same room code and verify that team reconnects with its existing score.
6. Refresh/close the host and verify every player is disconnected and the room cannot be joined.
7. Start a new host room and verify it receives a fresh room code.
8. End a game and verify the old room is rejected.
9. Repeat with a different provider/network (for example, home Wi-Fi vs mobile data). Check Metered usage/relay logs.

Only after these tests pass should you describe the deployment as tested across those networks. Even then, no WebRTC system can guarantee connectivity through every restrictive firewall/VPN/carrier.
