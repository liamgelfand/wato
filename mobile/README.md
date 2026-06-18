# Wato Mobile (Expo)

React Native app for iOS and Android. Consumes the Wato REST API.

## Setup

From the project root (recommended):

```bash
make mobile-setup    # first time only
make docker-up       # backend API at :3000
make mobile-web      # open app in browser on laptop
```

Or manually:

```bash
cd mobile
npm install
```

Set API URL in `.env`:

```
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
```

For physical device testing, use your machine's LAN IP (not localhost).

## Run

| Command | What it does |
|---------|----------------|
| `make mobile` | Expo dev server (QR for phone, `w` for web) |
| `make mobile-web` | Open in browser (laptop) |
| `make mobile-android` | Android emulator |

```bash
make mobile-web
```

## Store builds (EAS)

1. Install EAS CLI: `npm i -g eas-cli`
2. `eas login`
3. `eas build:configure`
4. `eas build --platform android`
5. `eas build --platform ios`
6. `eas submit`

## Features in scaffold

- Mobile JWT login (`/api/auth/mobile/login`)
- Challenge feed (`/api/feed`)
- Secure token storage
- Deep link config in `app.json` (update YOUR_DOMAIN)
- Camera + notifications plugins (wire up in next iteration)

See [../docs/API.md](../docs/API.md) for full API reference.
