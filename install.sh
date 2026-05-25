#!/bin/bash
# Nebula Panel Theme Installer
# Usage: bash <(curl -s https://raw.githubusercontent.com/Im-Lawiett/nebula-panel-theme/main/install.sh)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "  _   _      _           _        ____                  _ "
echo " | \ | | ___| |__  _   _| | __ _ |  _ \ __ _ _ __   ___| |"
echo " |  \| |/ _ \ '_ \| | | | |/ _\` || |_) / _\` | '_ \ / _ \ |"
echo " | |\  |  __/ |_) | |_| | | (_| ||  __/ (_| | | | |  __/ |"
echo " |_| \_|\___|_.__/ \__,_|_|\__,_||_|   \__,_|_| |_|\___|_|"
echo -e "${NC}"
echo -e "${CYAN}Pterodactyl Panel Theme Installer${NC}"
echo ""

PANEL_DIR="/var/www/pterodactyl"
THEME_DIR="/tmp/nebula-panel-theme"
REPO="https://github.com/Im-Lawiett/nebula-panel-theme"

# Check if panel exists
if [ ! -d "$PANEL_DIR" ]; then
    echo -e "${RED}Error: Pterodactyl panel not found at $PANEL_DIR${NC}"
    echo "Please install Pterodactyl panel first."
    exit 1
fi

echo -e "${YELLOW}[1/6]${NC} Backing up original theme..."
cd "$PANEL_DIR"
if [ ! -d "resources/scripts.bak" ]; then
    cp -r resources/scripts resources/scripts.bak
    echo -e "${GREEN}  Backup created: resources/scripts.bak${NC}"
else
    echo -e "${YELLOW}  Backup already exists, skipping.${NC}"
fi

echo -e "${YELLOW}[2/6]${NC} Downloading Nebula theme..."
if [ -d "$THEME_DIR" ]; then
    rm -rf "$THEME_DIR"
fi
git clone --depth=1 "$REPO" "$THEME_DIR"
echo -e "${GREEN}  Downloaded successfully!${NC}"

echo -e "${YELLOW}[3/6]${NC} Copying theme files..."
if [ -d "$THEME_DIR/pterodactyl/resources/scripts" ]; then
    cp -rf "$THEME_DIR/pterodactyl/resources/scripts/"* resources/scripts/
fi
if [ -d "$THEME_DIR/pterodactyl/public/themes" ]; then
    mkdir -p public/themes
    cp -rf "$THEME_DIR/pterodactyl/public/themes/"* public/themes/
fi
echo -e "${GREEN}  Theme files installed!${NC}"

echo -e "${YELLOW}[4/6]${NC} Installing dependencies..."
if command -v composer &> /dev/null; then
    composer install --no-dev --optimize-autoloader --quiet
fi
if command -v yarn &> /dev/null; then
    yarn install --frozen-lockfile --silent
fi
echo -e "${GREEN}  Dependencies installed!${NC}"

echo -e "${YELLOW}[5/6]${NC} Building theme assets..."
if command -v yarn &> /dev/null; then
    yarn build:production
elif command -v npm &> /dev/null; then
    npm run build:production
fi
echo -e "${GREEN}  Assets built!${NC}"

echo -e "${YELLOW}[6/6]${NC} Clearing cache..."
php artisan optimize:clear
php artisan config:clear
php artisan view:clear
echo -e "${GREEN}  Cache cleared!${NC}"

# Cleanup
rm -rf "$THEME_DIR"

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  Nebula Panel Theme installed successfully!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "Visit your panel to see the new theme."
echo ""
echo -e "To uninstall, run:"
echo -e "${CYAN}  cd $PANEL_DIR && cp -rf resources/scripts.bak/* resources/scripts/ && yarn build:production && php artisan optimize:clear${NC}"
