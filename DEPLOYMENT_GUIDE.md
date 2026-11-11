# Publish GAME KNB? COHORT 3 on Netlify — beginner guide

Think of the game as a classroom. Netlify is the public school website. PeerJS helps the devices find each other. TURN is the relay helper for networks that will not let devices connect directly.

## 1) What you need

1. A Netlify account: https://app.netlify.com/signup
2. A Metered account with a TURN credential: https://www.metered.ca/turn-server/
3. Internet on every device. Players do not install an app; they open the Netlify website in a browser.

Netlify is the website host. It is **not** the TURN relay provider. The Metered TURN service may have usage limits or charges, so check its current plan/pricing before sharing the game widely.

## 2) Make a Metered TURN credential

1. Sign in to Metered and open the TURN Server dashboard.
2. Find your Metered app domain. It looks like `your-app-name.metered.live`. Copy only the hostname, without `https://` or a trailing slash.
3. Open the Metered **Developers** page and copy your account **Secret Key**. This key is only used in the one-time command below. Never put it in `index.html`, GitHub, or Netlify's public files.
4. On your computer, open Terminal / Command Prompt (Windows users can use PowerShell with `curl.exe`) and run this command after replacing the two capitalized values:

```bash
curl -X POST "https://YOUR-APP-NAME.metered.live/api/v1/turn/credential?secretKey=YOUR_METERED_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"expiryInSeconds":86400,"label":"game-knb-cohort3"}'
```

This example requests a credential that expires after 24 hours. You can change `86400` to another positive number of seconds. The result contains an `apiKey`. Copy that value; it is the **credential-scoped API key** used by the Netlify function. Do not copy the account Secret Key into Netlify as `METERED_TURN_API_KEY`.
5. Wait up to 2 minutes for the new credential to propagate through Metered's global TURN network before testing it.
6. In the Netlify environment settings (step 4 below), put your Metered hostname in `METERED_APP_DOMAIN` and the returned `apiKey` in `METERED_TURN_API_KEY`.

When this temporary credential expires, repeat the command to create a fresh one, replace `METERED_TURN_API_KEY` in Netlify, and redeploy. Metered documents the expiring-credential request and the two-minute propagation delay here: https://www.metered.ca/docs/turn-rest-api/post-create-credential/ . Its credential-scoped GET endpoint returns STUN/TURN URLs, username and password here: https://www.metered.ca/docs/turn-rest-api/get-credential/ .

## 3) Put the project online

**Important:** use Git-connected deploy or Netlify CLI. A simple static drag-and-drop upload is not enough for this project because it must also publish the `netlify/functions/turn-ice.mjs` server function.

### Beginner path: GitHub + Netlify

1. On your computer, unzip `GAME-KNB-COHORT3.zip`.
2. Create a new private GitHub repository, for example `game-knb-cohort3`.
3. Upload the *contents* of the `GAME-KNB-COHORT3` folder. Make sure `index.html` and `netlify.toml` are at the top level, and the `netlify/functions/turn-ice.mjs` file is present.
4. In Netlify, choose **Add new project** → **Import an existing project**.
5. Connect GitHub and choose `game-knb-cohort3`.
6. Build command: leave blank. Publish directory: `.`. The included `netlify.toml` also defines these settings.
7. Deploy the site. Netlify will give you a `https://something.netlify.app` address.

### Netlify CLI alternative

Install Node.js, then in a terminal opened inside the project folder run:

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --build
netlify deploy --build --prod
```

Choose the project/site when prompted. The production command publishes the public site.

## 4) Add the two secret settings to Netlify

1. Open your Netlify site dashboard.
2. Go to **Project configuration** → **Environment variables**.
3. Add these two variables. Set their scope to include **Functions** (or all scopes).

| Variable name | Value |
|---|---|
| `METERED_APP_DOMAIN` | Your Metered hostname, e.g. `your-app-name.metered.live` |
| `METERED_TURN_API_KEY` | The credential-scoped API key from your Metered TURN credential |

4. Save them.
5. Trigger a new deploy. Netlify applies environment-variable changes to new deploys/functions. Keep these values private.

The function reads the two settings on the server. The browser only receives the short-lived ICE server credentials returned by Metered. It does not receive your Metered account secret.

## 5) Check the TURN setup before playing

Open this address, replacing the domain with your real Netlify URL:

`https://YOUR-SITE.netlify.app/.netlify/functions/turn-ice`

A successful response is a JSON list containing at least one `turn:` URL and temporary username/password values. If you see an error, check the two Netlify variables, the Metered API key, its expiry, and redeploy.

Do not share the function response publicly; it contains temporary relay credentials. If the Metered credential expires, create/rotate a new temporary credential, update `METERED_TURN_API_KEY`, and redeploy.

## 6) Play

1. Open the Netlify HTTPS URL on the host device.
2. Tap **HOST**. Wait for the four-character room code.
3. On each player device, open the same URL and tap **PLAYER**.
4. Allow camera access, take the team photo, enter the room code and team name, then tap **JOIN**.
5. The host starts after at least two teams join.

Camera access requires a secure context such as Netlify's HTTPS site. Players do not need to be on the same Wi-Fi. TURN gives WebRTC a relay route when direct peer-to-peer paths fail, but no provider can promise every network/device will work (some schools, offices, VPNs or carrier networks block WebRTC entirely).

## 7) Refresh rules

- Host refresh/close: the room is destroyed and players are disconnected. Game progress is not saved.
- Player refresh: the same browser tab keeps a temporary reconnect token and team photo in `sessionStorage`. Return to PLAYER, enter the same room code, and tap JOIN to reconnect while the host room still exists.
- Player reconnect is not automatic; the player must submit the join form again.
- New host session: create a new room and a new four-character code.
- Ended/closed rooms cannot be rejoined.
- No database is used. If the host disappears, the in-memory room disappears too.

## 8) Folder structure

```text
GAME-KNB-COHORT3/
├── index.html
├── netlify.toml
├── README.md
├── DEPLOYMENT_GUIDE.md
├── TEST_REPORT.md
└── netlify/
    └── functions/
        └── turn-ice.mjs
```

Keep the names exactly as shown. `index.html` must stay at the top level.

## 9) Safety and limitations

- PeerJS's public signaling service is used for the room's initial rendezvous. It is convenient, but it is a shared third-party service, not a dedicated service under your control.
- Metered TURN relays traffic and may incur bandwidth charges. Monitor its usage.
- A four-character room code is convenient but not a high-security login. The host still validates all game actions and the server-side host is authoritative for score/state, but this is a casual party game, not a secure exam/payment system.
- A browser refresh on the host intentionally ends the session. No saved progress is restored.
- The project has been checked statically, but real cross-network testing requires your actual Netlify deployment, Metered credentials, and at least two physical devices on different internet connections. See `TEST_REPORT.md`.
