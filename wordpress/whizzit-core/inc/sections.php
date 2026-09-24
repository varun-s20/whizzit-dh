<?php
/**
 * Section templates: loading and rendering (see widgets/class-section.php).
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

/** id => [ id, title, uses ] for every section template. */
function whizzit_section_index() {
	static $index = null;
	if ( null === $index ) {
		$file  = plugin_dir_path( WHIZZIT_CORE_FILE ) . 'data/sections/index.json';
		$rows  = is_readable( $file ) ? (array) json_decode( (string) file_get_contents( $file ), true ) : []; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file.
		$index = array_column( $rows, null, 'id' );
	}
	return $index;
}

/** One template, read only when its widget is used. */
function whizzit_section_template( $id ) {
	static $cache = [];
	if ( ! isset( $cache[ $id ] ) ) {
		$file         = plugin_dir_path( WHIZZIT_CORE_FILE ) . 'data/sections/' . preg_replace( '/[^a-f0-9]/', '', $id ) . '.json';
		$cache[ $id ] = is_readable( $file ) ? (array) json_decode( (string) file_get_contents( $file ), true ) : []; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file.
	}
	return $cache[ $id ];
}

/** Swaps the {{ASSETS}} token for the theme's design assets path. */
function whizzit_expand_assets( $value ) {
	return str_replace( '{{ASSETS}}', wp_make_link_relative( get_stylesheet_directory_uri() ) . '/assets', (string) $value );
}

/**
 * Fills a template with a widget's settings. Text is escaped as text and links
 * as URLs; the surrounding markup is the design's own and never changes.
 */
function whizzit_render_section( array $tpl, array $settings ) {
	if ( empty( $tpl['template'] ) ) {
		return '';
	}
	$slots = array_column( $tpl['slots'] ?? [], null, 'k' );
	$html  = preg_replace_callback(
		'/\{\{([sui]\d+)\}\}/',
		function ( $m ) use ( $slots, $settings ) {
			$key  = $m[1];
			$slot = $slots[ $key ] ?? null;
			if ( ! $slot ) {
				return '';
			}
			if ( 's' === $slot['type'] ) {
				return esc_html( (string) ( $settings[ $key ] ?? $slot['default'] ) );
			}
			if ( 'u' === $slot['type'] ) {
				return esc_url( whizzit_expand_assets( $settings[ $key ] ?? $slot['default'] ) );
			}
			return whizzit_section_image( $slot, $settings[ $key ] ?? null, $settings[ $key . '_html' ] ?? ( $slot['default']['html'] ?? '' ) );
		},
		$tpl['template']
	);
	return do_shortcode( whizzit_fix_counters( whizzit_expand_assets( $html ) ) );
}

/**
 * The design's image markup, unless a different image has been chosen in the
 * editor; then a plain responsive image in its place, keeping the original class.
 */
function whizzit_section_image( array $slot, $media, $default_html ) {
	$default_html = whizzit_expand_assets( $default_html );
	preg_match( '/<img[^>]*\ssrc="([^"]*)"/', $default_html, $src );
	$current = $src[1] ?? '';
	$chosen  = is_array( $media ) ? (string) ( $media['url'] ?? '' ) : '';
	if ( '' === $chosen || $chosen === $current ) {
		return $default_html;
	}
	preg_match( '/<img[^>]*\sclass="([^"]*)"/', $default_html, $class );
	preg_match( '/<img[^>]*\salt="([^"]*)"/', $default_html, $alt );
	if ( ! empty( $media['id'] ) ) {
		return wp_get_attachment_image( (int) $media['id'], 'large', false, array_filter( [
			'class'    => $class[1] ?? '',
			'loading'  => 'lazy',
			'decoding' => 'async',
		] ) );
	}
	return sprintf( '<img src="%s" alt="%s"%s loading="lazy" decoding="async">', esc_url( $chosen ), esc_attr( html_entity_decode( $alt[1] ?? '' ) ), isset( $class[1] ) ? ' class="' . esc_attr( $class[1] ) . '"' : '' );
}

/**
 * Animated counters read their target from data-count. When a figure is edited
 * ("35+" → "40+"), the target follows the new text; text with no number just
 * shows as written.
 */
function whizzit_fix_counters( $html ) {
	return preg_replace_callback(
		'/<span data-count="[^"]*"(?: data-suffix="[^"]*")?>([^<]*)<\/span>/',
		function ( $m ) {
			$text = html_entity_decode( $m[1] );
			if ( ! preg_match( '/^\s*([\d,]+(?:\.\d+)?)(.*)$/su', $text, $n ) ) {
				return '<span>' . $m[1] . '</span>';
			}
			$suffix = trim( $n[2] ) === '' ? '' : sprintf( ' data-suffix="%s"', esc_attr( $n[2] ) );
			return sprintf( '<span data-count="%s"%s>%s</span>', esc_attr( str_replace( ',', '', $n[1] ) ), $suffix, $m[1] );
		},
		$html
	);
}
