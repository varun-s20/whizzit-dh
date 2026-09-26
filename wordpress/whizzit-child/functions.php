<?php
/**
 * WhizzIT child theme.
 *
 * Hello Elementor is only the parent so Elementor has a theme to hook into. Its
 * styles, title, skip link and description tag are switched off here; the design
 * brings its own. The header, footer and mobile menu are generated HTML parts in
 * parts/ (from _build/wp-export.mjs), printed by header.php and footer.php.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

const WHIZZIT_CHILD_VERSION = '2.1.1';

/* ---------- Hello Elementor: keep it out of the way ---------- */
add_filter( 'hello_elementor_enqueue_style', '__return_false' );
add_filter( 'hello_elementor_enqueue_theme_style', '__return_false' );
// Hello's header-footer.css styles .site-header and .site-footer, the same class
// names the design uses (it turned our header into a flex row).
add_filter( 'hello_elementor_header_footer', '__return_false' );
add_filter( 'hello_elementor_enable_skip_link', '__return_false' );
add_filter( 'hello_elementor_page_title', '__return_false' );
add_filter( 'hello_elementor_description_meta_tag', '__return_false' );

/**
 * Elementor's global colours and fonts are written onto <body> and out-rank the
 * design's own rules, and its Google Fonts duplicate ours. Switch all three off
 * once, when the theme is activated. They stay editable in Elementor's settings.
 */
add_action( 'after_switch_theme', function () {
	update_option( 'elementor_disable_color_schemes', 'yes' );
	update_option( 'elementor_disable_typography_schemes', 'yes' );
	update_option( 'elementor_google_font', '0' );
} );

/* ---------- Assets ---------- */
function whizzit_assets_url() {
	return get_stylesheet_directory_uri() . '/assets';
}

add_action( 'wp_enqueue_scripts', function () {
	$dir = get_stylesheet_directory();
	$uri = get_stylesheet_directory_uri();

	// Self-hosted: no request to Google, nothing to disclose in the cookie policy.
	wp_enqueue_style( 'whizzit-fonts', $uri . '/wp/fonts.css', [], filemtime( $dir . '/wp/fonts.css' ) );

	// After Elementor's CSS, so the design wins every tie.
	$after = wp_style_is( 'elementor-frontend', 'registered' ) ? [ 'elementor-frontend' ] : [];
	wp_enqueue_style( 'whizzit', $uri . '/assets/css/styles.css', array_merge( [ 'whizzit-fonts' ], $after ), filemtime( $dir . '/assets/css/styles.css' ) );
	wp_enqueue_style( 'whizzit-wp', $uri . '/wp/wp.css', [ 'whizzit' ], filemtime( $dir . '/wp/wp.css' ) );

	wp_enqueue_script( 'whizzit', $uri . '/assets/js/app.js', [], filemtime( $dir . '/assets/js/app.js' ), [ 'in_footer' => true, 'strategy' => 'defer' ] );
	wp_enqueue_script( 'whizzit-wp', $uri . '/wp/wp.js', [], filemtime( $dir . '/wp/wp.js' ), [ 'in_footer' => true, 'strategy' => 'defer' ] );
}, 20 );

add_action( 'wp_head', function () {
	printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url( get_stylesheet_directory_uri() . '/wp/fonts/urbanist-latin.woff2' ) );
	// The design's favicons, unless a Site Icon has been set in the Customizer.
	if ( ! has_site_icon() ) {
		$img = whizzit_assets_url() . '/images/brand';
		printf( '<link rel="icon" href="%s" sizes="any">' . "\n", esc_url( $img . '/favicon.ico' ) );
		printf( '<link rel="icon" href="%s" type="image/svg+xml">' . "\n", esc_url( $img . '/favicon.svg' ) );
		printf( '<link rel="apple-touch-icon" href="%s">' . "\n", esc_url( $img . '/apple-touch-icon.png' ) );
	}
}, 1 );

/* ---------- Generated parts ---------- */

/**
 * Prints a generated part from parts/, with its tokens filled in.
 *
 * @param string $name   Part name (header, footer, footer-cta, mobile-nav).
 * @param array  $tokens Extra {{TOKEN}} => value pairs.
 */
function whizzit_part( $name, $tokens = [] ) {
	$file = get_stylesheet_directory() . '/parts/' . $name . '.html';
	if ( ! is_readable( $file ) ) {
		return;
	}
	$html = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local theme file.
	$html = preg_replace( '/^<!--.*?-->\s*/', '', $html );
	$tokens = array_merge( [ '{{ASSETS}}' => esc_url( whizzit_assets_url() ) ], $tokens );
	// Sector lists come from the Sectors post type (whizzit-core).
	if ( function_exists( 'whizzit_sector_links' ) ) {
		$tokens += [
			'{{SECTORS_MEGA}}'                                         => whizzit_sector_links( 'mega' ),
			'<li><a href="#sectors-mobile">{{SECTORS_MOBILE}}</a></li>' => whizzit_sector_links( 'mobile' ),
			'<li><a href="#sectors-footer">{{SECTORS_FOOTER}}</a></li>' => whizzit_sector_links( 'footer', 0, 6 ),
		];
	}
	$html = strtr( $html, $tokens );
	// Phone, email and links from Settings → WhizzIT.
	echo function_exists( 'whizzit_apply_settings' ) ? whizzit_apply_settings( $html ) : $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- generated markup; token values escaped by callers.
}

/**
 * The footer, with the CTA card on the pages that carry one. Imported pages keep
 * the card's copy in the _whizzit_footer_cta meta field.
 */
function whizzit_footer() {
	$cta  = '';
	$data = is_singular() ? json_decode( (string) get_post_meta( get_queried_object_id(), '_whizzit_footer_cta', true ), true ) : null;
	if ( is_array( $data ) && ! empty( $data['title'] ) ) {
		ob_start();
		whizzit_part( 'footer-cta', [
			'{{TITLE}}' => esc_html( $data['title'] ),
			'{{TEXT}}'  => esc_html( $data['text'] ?? '' ),
			'{{LABEL}}' => esc_html( $data['cta'] ?? 'Book a consultation' ),
		] );
		$cta = ob_get_clean();
	}
	whizzit_part( 'footer', [ '{{FOOTER_CTA}}' => $cta ] );
}

/* ---------- Page classes, titles and descriptions from the import ---------- */

// The design keys its page layouts off body classes (page--home, page--sky …).
add_filter( 'body_class', function ( $classes ) {
	if ( is_singular() ) {
		$extra = (string) get_post_meta( get_queried_object_id(), '_whizzit_body_class', true );
		if ( $extra ) {
			$classes = array_merge( $classes, preg_split( '/\s+/', trim( $extra ) ) );
		}
	}
	// Blog posts and archives use the design's light article header.
	if ( is_singular( 'post' ) || is_archive() || is_search() || is_404() ) {
		$classes[] = 'page--article';
	}
	if ( ! in_array( 'page', $classes, true ) ) {
		$classes[] = 'page';
	}
	return array_unique( $classes );
} );

/** True when an SEO plugin is managing titles and descriptions. */
function whizzit_seo_plugin_active() {
	return defined( 'RANK_MATH_VERSION' ) || defined( 'WPSEO_VERSION' );
}

// "Title | WhizzIT" everywhere, as in the design, whatever the Site Title says.
add_filter( 'document_title_separator', fn( $sep ) => whizzit_seo_plugin_active() ? $sep : '|' );
add_filter( 'document_title_parts', function ( $parts ) {
	if ( ! whizzit_seo_plugin_active() ) {
		$parts['site'] = 'WhizzIT';
		unset( $parts['tagline'] );
	}
	return $parts;
} );

add_filter( 'pre_get_document_title', function ( $title ) {
	if ( whizzit_seo_plugin_active() || ! is_singular() ) {
		return $title;
	}
	$stored = (string) get_post_meta( get_queried_object_id(), '_whizzit_title', true );
	return $stored ?: $title;
} );

add_action( 'wp_head', function () {
	if ( whizzit_seo_plugin_active() || ! is_singular() ) {
		return;
	}
	$desc = (string) get_post_meta( get_queried_object_id(), '_whizzit_description', true );
	if ( ! $desc && is_single() ) {
		$desc = wp_strip_all_tags( get_the_excerpt( get_queried_object_id() ) );
	}
	if ( $desc ) {
		printf( '<meta name="description" content="%s">' . "\n", esc_attr( $desc ) );
	}
}, 2 );
