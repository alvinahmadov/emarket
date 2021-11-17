#!/bin/bash
source "$(pwd)/.scripts/constants"

check_install() {
	packages=("$@")
	for pkg in    "${packages[@]}"; do
		is_pkg_installed=$(     dpkg-query -W --showformat='${Status}\n' ${pkg} | grep "install ok installed")

		if       [ "${is_pkg_installed}" != "install ok installed" ]; then
			apt          install "${pkg}" -y
		fi
	done
}

install_deps() {
	apt update
	for pkg in "${DPKG_PACKAGES[@]}"; do
		check_install "$pkg"
	done
}

install_nvm() {
	if [ ! -d "$NVM_ROOT_DIR" ]; then
		curl "$NVM_INSTALL_SCRIPT" | bash
		source "$HOME/.profile"
		nvm       install --lts "$NODEJS_VERSION"
		npm       i -g npm@latest
		npm       i -g --quiet node-gyp@latest yarn@latest
	fi
	nvm    alias default "$NODEJS_VERSION"
}

clear_builds() {
	# shellcheck disable=SC2153
	for package in "${MODULES[@]}"; do
		for folder in     "${TEMP_FOLDERS[@]}"; do
			if     [ -d "${package}/$folder" ]; then
				printf     "\n${BRIGHT}${MAGENTA}Removing directory %s/%s${NORMAL}\n" "${package}" "${folder}"
				rm     -rfd "${package:?}/${folder}"
			fi
		done
	done
}

clear_all() {
	clear_builds
	# shellcheck disable=SC2059
	if [ -d "$PROJECT_DIR/node_modules" ]; then
		printf    "\n${BRIGHT}${MAGENTA}Removing directory %s/node_modules${NORMAL}\n" "$PROJECT_DIR"
		rm       -rfd "$PROJECT_DIR/node_modules"
	fi

	for package in    "${MODULES[@]}"; do
		if    [ -d "${package}/node_modules" ]; then
			printf    "\n${BRIGHT}${MAGENTA}Removing directory %s/node_modules${NORMAL}\n" "${package}"
			rm       -rfd "${package}/node_modules"
		fi
	done
}

_create_symlink() {
	local src=$1
	local dest="$2/node_modules/@ever-platform/$1"

	if [ -d "$dest" ]; then
		printf "\n${BRIGHT}${MAGENTA}Removing directory %s${NORMAL}\n" "$dest"
		printf "\n${BRIGHT}${POWDER_BLUE}Installing symlink for %s from %s ${NORMAL}\n" "$dest" "$PROJECT_DIR/packages/$src"
		rm       -rfd "$dest"
		ln       -sr "./$src" "$dest"
	fi
}

install_symlinks() {
	cd "$PROJECT_DIR/packages" || exit
	modules=("$@")

	# shellcheck disable=SC2059
	printf "\n${BRIGHT}${POWDER_BLUE}Installing symlinks...${NORMAL}\n"

	for module in "${modules[@]}"; do
		_create_symlink "common" "$module"
		_create_symlink "common-angular" "$module"
	done
}

_install_module() {
	local MODULE_NAME=$1
	local    SRC=$2
	local    DEST=$3
	local    MODULE_DIR=$4
	local    COMMAND=$5

	# shellcheck disable=SC2059
	printf    "\n\n${BRIGHT}${POWDER_BLUE}Building %s package...${NORMAL}\n" "$MODULE_NAME"
	cd    "$MODULE_DIR" || exit
	eval    "$COMMAND"

	if    [ -d "$DEST" ]; then
		printf       "\n${BRIGHT}${MAGENTA}Destination exists. Removing directory %s${NORMAL}\n" "$DEST"
		rm    -rfd "$DEST"
	else
		printf    "\n${BRIGHT}${LIME_YELLOW}Moving built %s package to %s...${NORMAL}\n" "$MODULE_NAME" "$DEST"
		cp       -r "$SRC" "$DEST"
	fi
}

_install_admin() {
	_install_module "admin" "$ADMIN_PACKAGE_DIR/www" "$NGINX_SERVE_DIR/admin-web-angular" "$ADMIN_PACKAGE_DIR" "yarn run build"
}

_install_merchant() {
	_install_module "merchant" "$MERCHANT_PACKAGE_DIR/www" "$NGINX_SERVE_DIR/merchant-tablet-ionic" "$MERCHANT_PACKAGE_DIR" "yarn run build:dev"
}

_install_shop() {
	_install_module "shop" "$SHOP_PACKAGE_DIR/www" "$NGINX_SERVE_DIR/shop-web-angular" "$SHOP_PACKAGE_DIR" "yarn run build:dev"
}

_install_core() {
	# Core
	# shellcheck disable=SC2059
	printf "\n\n${BRIGHT}${POWDER_BLUE}Building core package...${NORMAL}\n"
	cd "$CORE_PACKAGE_DIR" || exit
	yarn run build
}

_install_common() {
	# Common
	cd "$PROJECT_DIR" || exit
	# shellcheck disable=SC2059
	printf "\n\n${BRIGHT}${POWDER_BLUE}Building common packages...${NORMAL}\n"
	yarn run build:common
}

install_packages() {
	cd "$PROJECT_DIR" || exit
	yarn install

	_install_common

	install_symlinks "$CORE_PACKAGE_DIR" "$ADMIN_PACKAGE_DIR" "$MERCHANT_PACKAGE_DIR" "$SHOP_PACKAGE_DIR"

	_install_admin
	_install_merchant
	_install_shop
	_install_core

	service nginx reload
}

function install_dependencies() {
	install_deps
	install_nvm
}

function reinstall_node_modules() {
	clear_all
}

function rebuild_packages() {
	clear_builds
	install_packages
}

prompt_options() {
	PS3="Select the operation: "

	select opt in    rebuild_packages install_dependencies install_symlinks clear_builds clear_all default exit; do
		case $opt in
			rebuild_packages)
				rebuild_packages
				;;
			clear_builds)
				clear_builds
				;;
			clear_all)
				clear_all
				;;
			install_dependencies)
				install_dependencies
				;;
			install_symlinks)
				install_symlinks "$CORE_PACKAGE_DIR" "$ADMIN_PACKAGE_DIR" "$MERCHANT_PACKAGE_DIR" "$SHOP_PACKAGE_DIR"
				;;
			default)
				install_dependencies
				clear_all
				rebuild_packages
				;;
			exit)
				break
				;;
			*)
				echo       "Invalid option $REPLY"
				;;
		esac
	done
}

prompt_options
