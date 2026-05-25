# Nebula Panel Theme

A custom Pterodactyl Panel theme with a deep-space dark aesthetic, public chat, full file manager, and admin dashboard.

## Features

- Dark cyberpunk / deep-space UI design
- Full server management panel (like original Pterodactyl)
- File manager with context menu: Rename, Move, Permissions, Archive, Decompress, View, Delete
- Public chat room with file/image attachment support
- Admin dashboard: Overview, Servers, Nodes, Users, Locations, Nests/Eggs, Application API
- Node creation with full configuration
- Egg/Nest browser

## Install on Pterodactyl Panel

> Requirements: Pterodactyl Panel already installed at `/var/www/pterodactyl`

### Method 1: Auto Install (Recommended)

```bash
cd /var/www/pterodactyl
bash <(curl -s https://raw.githubusercontent.com/Im-Lawiett/nebula-panel-theme/main/install.sh)
```

### Method 2: Manual Install

```bash
# 1. Backup original theme
cd /var/www/pterodactyl
cp -r resources/scripts resources/scripts.bak
cp -r public/themes public/themes.bak

# 2. Download theme
git clone https://github.com/Im-Lawiett/nebula-panel-theme /tmp/nebula-theme

# 3. Copy theme files
cp -rf /tmp/nebula-theme/pterodactyl/resources/scripts/* resources/scripts/
cp -rf /tmp/nebula-theme/pterodactyl/public/themes/* public/themes/ 2>/dev/null || true

# 4. Install dependencies
composer install --no-dev --optimize-autoloader
yarn install --frozen-lockfile
yarn build:production

# 5. Clear cache
php artisan optimize:clear
php artisan config:clear
php artisan view:clear

echo "Nebula Theme installed successfully!"
```

### Uninstall / Restore Original

```bash
cd /var/www/pterodactyl
cp -rf resources/scripts.bak/* resources/scripts/
cp -rf public/themes.bak/* public/themes/ 2>/dev/null || true
yarn build:production
php artisan optimize:clear
echo "Original theme restored."
```

## Screenshots

The theme provides:
- Server list with real-time status indicators
- File manager with full context menu
- Admin panel matching Pterodactyl admin structure
- Public chat for all users

## License

MIT License — Free to use and distribute.

## Credits

- Based on Pterodactyl Panel
- Inspired by [reviactyl/panel](https://github.com/reviactyl/panel)
