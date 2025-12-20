# Auto-Update avec GitHub - Configuration Complète

## État Actuel ✅
- `electron-updater` v6.6.2 est installé
- Composant `Updater.jsx` est prêt à afficher les notifications
- Main.js charge et configure les événements de l'updater

## Ce qui reste à faire

### 1. **Configuration package.json (FAIT)**
Le `build.appId` et `productName` sont déjà configurés. Vérifier :
```json
{
  "build": {
    "appId": "com.swingtradepro.app",
    "productName": "BatesTrading Vision",
    "publish": {
      "provider": "github",
      "owner": "SkouffyBates",
      "repo": "BatesTrading-Vision"
    }
  }
}
```

### 2. **Créer un GitHub Token** ⚠️ DOIT ÊTRE FAIT
1. Aller à https://github.com/settings/tokens/new
2. Créer un "Personal Access Token" (classic)
3. Permissions nécessaires :
   - ✅ `repo` (accès complet)
   - ✅ `write:packages`
4. Copier le token

### 3. **Configurer la variable d'environnement**
Avant de builder, définir :
```bash
$env:GH_TOKEN="votre_token_github"
```

### 4. **Créer un release sur GitHub** 📦
1. Aller à https://github.com/SkouffyBates/BatesTrading-Vision/releases/new
2. Tag version: `v1.0.1` (doit correspondre à `package.json` version)
3. Title: "BatesTrading Vision v1.0.1"
4. Description: Notes de version
5. Attacher le fichier `.exe` depuis `release/` dossier (après build)
6. Cocher "Set as the latest release"
7. Publier

### 5. **Build et Packaging**
```bash
# Compiler l'app Electron avec auto-updater
npm run electron:build

# Output: release/BatesTrading Vision Setup 1.0.1.exe
```

### 6. **Handler IPC pour l'updater** ✅ À AJOUTER
Dans `electron/main.js`, ajouter :
```javascript
// Updater IPC handlers
ipcMain.handle('updater:checkForUpdates', async () => {
  if (!autoUpdater) return { error: 'Updater not available' };
  return await autoUpdater.checkForUpdates();
});

ipcMain.handle('updater:downloadUpdate', async () => {
  if (!autoUpdater) return { error: 'Updater not available' };
  return await autoUpdater.downloadUpdate();
});

ipcMain.handle('updater:quitAndInstall', () => {
  if (autoUpdater) autoUpdater.quitAndInstall();
});
```

### 7. **Intégrer dans le preload** ✅ À VÉRIFIER
Dans `electron/preload.cjs` :
```javascript
contextBridge.exposeInMainWorld('updater', {
  on: (event, callback) => ipcRenderer.on(`update:${event}`, (e, data) => callback(data)),
  downloadUpdate: () => ipcRenderer.invoke('updater:downloadUpdate'),
  quitAndInstall: () => ipcRenderer.invoke('updater:quitAndInstall'),
  checkForUpdates: () => ipcRenderer.invoke('updater:checkForUpdates'),
});
```

## Workflow complet

### Développement (Local) 🔄
```bash
npm run electron:dev  # Dev mode, pas d'auto-update
```

### Release à GitHub 🚀
```bash
# 1. Mettre à jour version
# version: "1.0.2" dans package.json

# 2. Commit et tag
git add package.json
git commit -m "Version 1.0.2"
git tag v1.0.2
git push origin main
git push origin v1.0.2

# 3. Builder
$env:GH_TOKEN="votre_token"
npm run electron:build

# 4. Créer GitHub Release
# - Aller à /releases/new
# - Tag: v1.0.2
# - Upload: release/*.exe

# 5. Les utilisateurs recevront une notification d'update automatiquement!
```

## Flux Auto-Update Utilisateur 👤

1. Utilisateur lance l'app
2. App vérifie GitHub Releases automatiquement
3. Si nouvelle version trouvée → notification "Mise à jour disponible"
4. Utilisateur clique "Télécharger" → Progress bar affichée
5. Clique "Installer et redémarrer" → App redémarre avec nouvelle version

## Configuration de sécurité 🔒

### Variable d'environnement GH_TOKEN
- **NE PAS** commiter le token dans le repo
- Utiliser dans CI/CD (GitHub Actions) ou local build only
- Token scope: `repo` minimum

### Alternative: GitHub Actions
Créer `.github/workflows/release.yml` pour auto-build et publish :
```yaml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run electron:build
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

## Checklist Avant Premier Release 📋

- [ ] `GH_TOKEN` créé sur GitHub
- [ ] `package.json` - `publish` config ajoutée
- [ ] `electron/main.js` - Updater handlers ajoutés
- [ ] `electron/preload.cjs` - Updater exposé via contextBridge
- [ ] App testée en dev mode
- [ ] Version bumped (`1.0.1` → `1.0.2`)
- [ ] Git tag créé (`v1.0.2`)
- [ ] Build généré (`npm run electron:build`)
- [ ] GitHub Release créé avec `.exe` attaché
- [ ] Utilisateur teste installation et notif d'update

## Dépannage 🔧

### "Updater not available"
- Vérifier `electron-updater` est dans `package.json`
- Vérifier `preload.cjs` expose `window.updater`

### "No updates found"
- Vérifier version dans `package.json` < version du release GitHub
- Vérifier `package.json` - `publish` config a `owner` et `repo` corrects

### "Download fails"
- Vérifier `GH_TOKEN` a permissions `repo`
- Vérifier le `.exe` est attaché au GitHub Release

## Spécifique macOS (Sans Signature) 🍎

Si vous n'avez pas de certificat Apple Developer ($99/an), l'auto-update sur Mac a des limitations strictes :

1. **Configuration Build** :
   Dans `.github/workflows/release.yml`, nous avons ajouté `CSC_IDENTITY_AUTO_DISCOVERY: false` pour forcer le build sans signature.

2. **Limitations Utilisateur** :
   - L'application affichera probablement "Développeur non identifié" au premier lancement.
   - L'auto-update (téléchargement + redémarrage) peut échouer si macOS met la nouvelle version en quarantaine.
   - **Recommandation** : Sans signature, il est souvent préférable de demander aux utilisateurs Mac de télécharger manuellement le `.dmg` depuis GitHub Releases si l'auto-update échoue.

3. **Build Mac** :
   - Vous **devez** utiliser GitHub Actions (le fichier `release.yml`) pour générer la version Mac car vous êtes sous Windows.

---

**Prochaine étape** : Mettre à jour `package.json` avec la config `publish` et ajouter les handlers IPC !
