<?php
/**
 * Plugin Name:       WhizzIT Core
 * Description:       WhizzIT's site tools: the WhizzIT Elementor widgets every page is built from, Sectors, site settings (Settings → WhizzIT), the blog and sector listings, and the import from the design build (Tools → WhizzIT import).
 * Version:           2.3.2
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Requires Plugins:  elementor
 * Author:            Digital Marketing Heroes
 * License:           Proprietary
 * Text Domain:       whizzit-core
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

const WHIZZIT_CORE_VERSION = '2.3.2';
const WHIZZIT_CORE_FILE    = __FILE__;

require __DIR__ . '/inc/render.php';
require __DIR__ . '/inc/sections.php';
require __DIR__ . '/inc/elementor.php';
require __DIR__ . '/inc/sectors.php';
require __DIR__ . '/inc/settings.php';
require __DIR__ . '/inc/shortcodes.php';
require __DIR__ . '/inc/migrate.php';
