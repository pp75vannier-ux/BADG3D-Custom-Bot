# Bot Discord — Render

Bot Discord.js v14 sans base de données.

## Fonctionnalités

- Message de bienvenue
- Auto-rôle
- Tickets privés
- Fermeture / réouverture
- Transcriptions HTML
- Logs
- Ban / Kick / Timeout
- Clear
- Warn / warnings / clearwarn
- Annonces
- Slash commands
- Configuration centralisée

## Installation locale

```bash
npm install
```

Copier `.env.example` vers `.env` puis remplir :

```env
DISCORD_TOKEN=...
CLIENT_ID=...
GUILD_ID=...
```

Modifier ensuite `src/config.js` avec les IDs Discord.

Déployer les commandes :

```bash
npm run deploy
```

Lancer le bot :

```bash
npm start
```

## Render

Créer un **Background Worker** sur Render.

Build Command:

```bash
npm install
```

Start Command:

```bash
npm start
```

Ajouter dans les Environment Variables :

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`

## Important

Les avertissements sont stockés dans `data/warnings.json`. Il n'y a aucune base de données.

Sur un hébergeur avec stockage éphémère, ces fichiers peuvent être perdus lors de certaines opérations. Le bot reste fonctionnel sans eux.

## Permissions

Le bot doit avoir au minimum :

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Channels
- Manage Roles (si auto-rôle)
- Ban Members
- Kick Members
- Moderate Members
- Manage Messages
- Attach Files

Donne uniquement les permissions nécessaires au bot.
