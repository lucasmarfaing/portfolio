# Déploiement (à la main, serveur Debian)

Le build produit un dossier `dist/` **autonome** : c'est la seule chose à envoyer sur le serveur.

- `dist/client/` : le site statique, servi par nginx ;
- `dist/server/` : le petit serveur Node du formulaire de contact (`/api/contact`), avec toutes ses bibliothèques incluses.

Pas de `npm install` sur le serveur, pas de `node_modules`, pas de `package.json`.

## Sur le PC : build

```powershell
npm.cmd run build
```

## Première installation (une seule fois)

Sur le serveur, il faut Node **22.23 ou plus** (`node -v`). Sinon :

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo bash -
sudo apt install -y nodejs nginx
```

1. Envoyer `dist/` dans `/var/www/portfolio/` (FileZilla/WinSCP, ou `scp -r dist toi@serveur:/tmp/` puis `sudo mkdir -p /var/www/portfolio && sudo mv /tmp/dist /var/www/portfolio/`).
2. Créer `/var/www/portfolio/.env` à partir de `.env.example` (identifiants SMTP), puis :
   ```bash
   sudo chown -R www-data:www-data /var/www/portfolio
   sudo chmod 600 /var/www/portfolio/.env
   ```
3. Envoyer aussi `deploy/portfolio.service` et `deploy/nginx.conf` (n'importe où, par ex. `/tmp/`), puis :
   ```bash
   sudo cp /tmp/portfolio.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now portfolio
   sudo cp /tmp/nginx.conf /etc/nginx/sites-available/portfolio
   sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
4. HTTPS :
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d lucasmarfaing.pro -d www.lucasmarfaing.pro -d lucasmarfaing.dev -d www.lucasmarfaing.dev
   ```

## Mise à jour

```bash
sudo rm -rf /var/www/portfolio/dist
# envoyer le nouveau dist/ dans /var/www/portfolio/
sudo chown -R www-data:www-data /var/www/portfolio/dist
sudo systemctl restart portfolio
```

## Vérifier le formulaire

```bash
sudo journalctl -u portfolio -n 50
```

En local (`npm run dev`) sans `.env`, les messages ne sont pas envoyés : ils s'affichent dans le terminal.
