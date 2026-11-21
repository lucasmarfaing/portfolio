# Déploiement

Le site est en HTML statique (servi par nginx). Seule la route `/api/contact` tourne sur un petit serveur Node.

## Build

```bash
npm ci
npm run build
```

Le build produit :

- `dist/client/` : le site statique, à servir par nginx ;
- `dist/server/entry.mjs` : le petit serveur Node du formulaire de contact.

## Première installation sur le serveur

1. Copier le projet (ou au minimum `dist/`, `scripts/`, `deploy/`, `package.json`, `package-lock.json`) dans `/var/www/portfolio`, puis installer les dépendances de production :
   ```bash
   cd /var/www/portfolio && npm ci --omit=dev
   ```
2. Créer `/var/www/portfolio/.env` à partir de `.env.example` et y mettre les identifiants SMTP.
   ```bash
   chmod 600 .env
   ```
3. Installer le service :
   ```bash
   sudo cp deploy/portfolio.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now portfolio
   ```
4. Ajouter le bloc de `deploy/nginx.conf` à la configuration nginx, puis :
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

## Mise à jour

```bash
npm run build                 # en local ou sur le serveur
# copier dist/ sur le serveur, puis :
sudo systemctl restart portfolio
```

Les pages statiques sont prises en compte immédiatement ; le redémarrage ne sert qu'au formulaire.

## Vérifier le formulaire

```bash
journalctl -u portfolio -f    # affiche les erreurs d'envoi éventuelles
```

En local (`npm run dev`) sans `.env`, les messages ne sont pas envoyés : ils s'affichent dans le terminal.
