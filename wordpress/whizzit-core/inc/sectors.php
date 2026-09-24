<?php
/**
 * Sectors: the industries WhizzIT supports, as their own post type.
 *
 * The eight sector pages become "sector" posts on import (keeping their IDs, slugs
 * and designs), and every list of sectors on the site is drawn from them: the
 * Industries menu, the mobile menu, the footer, the home page cards, the
 * Industries directory and "Other industries" on each sector page. Adding a
 * sector (Sectors → Duplicate an existing one) adds it everywhere.
 *
 * Sector URLs stay at the root of the site (/it-support-construction/), as they
 * were when they were pages.
 *
 *   [whizzit_sectors view="directory|cards|grid" exclude="current" limit="4"]
 *   [whizzit_sectors_count]
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

const WHIZZIT_SECTOR_META = [
	'_whizzit_sector_label' => 'Short name (menus and cards)',
	'_whizzit_sector_desc'  => 'Card description',
	'_whizzit_sector_note'  => 'What this sector comes to us for (Industries page)',
	'_whizzit_sector_icon'  => 'Icon',
];

add_action( 'init', function () {
	register_post_type( 'sector', [
		'labels'        => [
			'name'          => 'Sectors',
			'singular_name' => 'Sector',
			'add_new_item'  => 'Add new sector',
			'edit_item'     => 'Edit sector',
			'all_items'     => 'All sectors',
			'search_items'  => 'Search sectors',
			'not_found'     => 'No sectors found',
		],
		'public'        => true,
		'show_in_rest'  => true,
		'menu_icon'     => 'dashicons-building',
		'menu_position' => 21,
		'supports'      => [ 'title', 'editor', 'thumbnail', 'page-attributes', 'custom-fields' ],
		'has_archive'   => false,
		'rewrite'       => false,
		'query_var'     => 'sector',
	] );
	foreach ( array_keys( WHIZZIT_SECTOR_META ) as $key ) {
		register_post_meta( 'sector', $key, [ 'type' => 'string', 'single' => true, 'show_in_rest' => true, 'auth_callback' => fn() => current_user_can( 'edit_posts' ) ] );
	}
} );

/* ---------- Root-level URLs ---------- */

add_filter( 'post_type_link', function ( $url, $post ) {
	return 'sector' === $post->post_type && $post->post_name && 'publish' === $post->post_status ? home_url( user_trailingslashit( $post->post_name ) ) : $url;
}, 10, 2 );

// /it-support-construction/: WordPress only matches its page rule when a page has
// that path, so read the path itself and serve the sector when one has it.
add_filter( 'request', function ( $vars ) {
	$path = trim( (string) ( $GLOBALS['wp']->request ?? '' ), '/' );
	if ( '' === $path || str_contains( $path, '/' ) || is_admin() || get_page_by_path( $path ) ) {
		return $vars;
	}
	$sector = get_page_by_path( $path, OBJECT, 'sector' );
	if ( ! $sector ) {
		return $vars;
	}
	// Keep query-string vars (preview and the like); drop what the failed match set.
	$vars = array_diff_key( $vars, array_flip( [ 'pagename', 'page', 'name', 'error', 'attachment', 'category_name' ] ) );
	return array_merge( $vars, [ 'sector' => $sector->post_name, 'post_type' => 'sector', 'name' => $sector->post_name ] );
} );

// Pages and sectors share the root, so a sector cannot take a page's slug (or the reverse).
add_filter( 'wp_unique_post_slug', function ( $slug, $id, $status, $type, $parent ) {
	if ( ! in_array( $type, [ 'sector', 'page' ], true ) || ( 'page' === $type && $parent ) ) {
		return $slug;
	}
	$other = 'sector' === $type ? 'page' : 'sector';
	$base  = $slug;
	for ( $n = 2; ( $found = get_page_by_path( $slug, OBJECT, $other ) ) && (int) $found->ID !== (int) $id; $n++ ) {
		$slug = "$base-$n";
	}
	return $slug;
}, 10, 5 );

/* ---------- Elementor: edit sectors like pages ---------- */

$whizzit_cpt = fn( $types ) => array_values( array_unique( array_merge( (array) $types, [ 'page', 'post', 'sector' ] ) ) );
add_filter( 'option_elementor_cpt_support', $whizzit_cpt );
add_filter( 'default_option_elementor_cpt_support', $whizzit_cpt );

// New sectors use the full-width Elementor canvas, like the imported ones.
add_action( 'save_post_sector', function ( $id, $post, $update ) {
	if ( ! $update && ! get_post_meta( $id, '_wp_page_template', true ) ) {
		update_post_meta( $id, '_wp_page_template', 'elementor_header_footer' );
	}
}, 10, 3 );

/* ---------- Data ---------- */

/** Published sectors in menu order; before the import, the exported list. */
function whizzit_sectors() {
	static $list = null;
	if ( null !== $list ) {
		return $list;
	}
	$posts = get_posts( [ 'post_type' => 'sector', 'post_status' => 'publish', 'numberposts' => -1, 'orderby' => [ 'menu_order' => 'ASC', 'title' => 'ASC' ] ] );
	if ( ! $posts ) {
		$list = array_map( fn( $s ) => [ 'id' => 0, 'url' => home_url( $s['path'] ), 'label' => $s['label'], 'icon' => $s['icon'], 'desc' => $s['desc'], 'note' => $s['note'], 'thumb' => 0, 'photo' => $s['photo'] ], whizzit_data( 'sectors' )['sectors'] ?? [] );
		return $list;
	}
	$list = array_map( function ( $post ) {
		$meta = fn( $k ) => (string) get_post_meta( $post->ID, $k, true );
		return [
			'id'    => $post->ID,
			'url'   => get_permalink( $post ),
			'label' => $meta( '_whizzit_sector_label' ) ?: get_the_title( $post ),
			'icon'  => $meta( '_whizzit_sector_icon' ) ?: 'briefcase',
			'desc'  => $meta( '_whizzit_sector_desc' ),
			'note'  => $meta( '_whizzit_sector_note' ),
			'thumb' => get_post_thumbnail_id( $post ),
			'photo' => $meta( '_whizzit_sector_photo' ) ?: 'meeting',
		];
	}, $posts );
	return $list;
}

/** The sector's featured image, or its stock photograph. */
function whizzit_sector_photo( array $s, $cls, $sizes ) {
	return whizzit_post_photo( [ 'thumb' => $s['thumb'], 'cat' => [ 'photo' => $s['photo'] ] ], $cls, '3-2', $sizes );
}

/**
 * The sector list in one of its designs (see the matching markup in
 * pages/industries.mjs, home.mjs, subpages.mjs and lib.mjs).
 */
function whizzit_sector_links( $view, $exclude = 0, $limit = 0 ) {
	$list = array_values( array_filter( whizzit_sectors(), fn( $s ) => ! $exclude || $s['id'] !== $exclude ) );
	if ( $limit ) {
		$list = array_slice( $list, 0, $limit );
	}
	$out = '';
	foreach ( $list as $n => $s ) {
		$url   = esc_url( $s['url'] );
		$label = esc_html( $s['label'] );
		$desc  = esc_html( $s['desc'] );
		switch ( $view ) {
			case 'directory':
				$out .= '<article class="sector-tile sector-tile--photo"><a class="card-link" href="' . $url . '" aria-label="' . esc_attr( $s['label'] ) . '"></a>'
					. whizzit_sector_photo( $s, 'sector-tile__photo', '(min-width: 1024px) 24vw, 100vw' )
					. sprintf( '<span class="sector-tile__num">%02d</span>', $n + 1 )
					. "<h3>$label</h3><p>$desc</p>"
					. '<p class="sector-tile__note">' . whizzit_icon( 'alert' ) . esc_html( $s['note'] ) . '</p>'
					. '<span class="read-more" aria-hidden="true">See ' . esc_html( strtolower( $s['label'] ) ) . ' IT support ' . whizzit_icon( 'arrow' ) . '</span></article>';
				break;
			case 'cards':
				$out .= '<li class="sector-card"><a href="' . $url . '">'
					. whizzit_sector_photo( $s, 'sector-card__art', '(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw' )
					. '<span class="sector-card__body"><span class="sector-card__icon">' . whizzit_icon( $s['icon'] ) . "</span><strong>$label</strong>"
					. '<span class="sector-card__desc">' . $desc . '</span><span class="sector-card__go" aria-hidden="true">' . whizzit_icon( 'arrow' ) . '</span></span></a></li>';
				break;
			case 'grid':
				$out .= '<li><a href="' . $url . '"><span class="sector-grid__icon">' . whizzit_icon( $s['icon'] ) . "</span><strong>$label</strong><span>$desc</span></a></li>";
				break;
			case 'mega':
				$out .= '<li><a class="mega-link mega-link--plain" href="' . $url . '">' . whizzit_icon( $s['icon'] ) . "<span>$label</span></a></li>";
				break;
			default: // mobile, footer.
				$out .= '<li><a href="' . $url . '">' . $label . '</a></li>';
		}
	}
	return $out;
}

add_shortcode( 'whizzit_sectors', function ( $atts ) {
	$atts = shortcode_atts( [ 'view' => 'grid', 'exclude' => '', 'limit' => 0 ], $atts );
	$skip = 'current' === $atts['exclude'] ? get_queried_object_id() : (int) $atts['exclude'];
	return whizzit_sector_links( sanitize_key( $atts['view'] ), $skip, (int) $atts['limit'] );
} );

add_shortcode( 'whizzit_sectors_count', fn() => (string) count( whizzit_sectors() ) );

/* ---------- Editing ---------- */

add_action( 'add_meta_boxes_sector', function () {
	add_meta_box( 'whizzit-sector', 'How this sector is listed', 'whizzit_sector_box', 'sector', 'normal', 'high' );
} );

function whizzit_sector_box( $post ) {
	wp_nonce_field( 'whizzit_sector', 'whizzit_sector_nonce' );
	echo '<p>Shown in the Industries menu, the footer, the home page, the Industries page and "Other industries". The featured image is the card photo.</p><table class="form-table">';
	foreach ( WHIZZIT_SECTOR_META as $key => $label ) {
		$value = (string) get_post_meta( $post->ID, $key, true );
		printf( '<tr><th><label for="%1$s">%2$s</label></th><td>', esc_attr( $key ), esc_html( $label ) );
		if ( '_whizzit_sector_icon' === $key ) {
			printf( '<select id="%1$s" name="%1$s">', esc_attr( $key ) );
			foreach ( array_keys( whizzit_data( 'icons' ) ) as $name ) {
				printf( '<option value="%1$s"%2$s>%1$s</option>', esc_attr( $name ), selected( $value ?: 'briefcase', $name, false ) );
			}
			echo '</select>';
		} elseif ( '_whizzit_sector_label' === $key ) {
			printf( '<input class="regular-text" id="%1$s" name="%1$s" value="%2$s">', esc_attr( $key ), esc_attr( $value ) );
		} else {
			printf( '<textarea class="large-text" rows="3" id="%1$s" name="%1$s">%2$s</textarea>', esc_attr( $key ), esc_textarea( $value ) );
		}
		echo '</td></tr>';
	}
	echo '</table>';
}

add_action( 'save_post_sector', function ( $id ) {
	if ( ! isset( $_POST['whizzit_sector_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['whizzit_sector_nonce'] ) ), 'whizzit_sector' ) || ! current_user_can( 'edit_post', $id ) ) {
		return;
	}
	foreach ( array_keys( WHIZZIT_SECTOR_META ) as $key ) {
		if ( isset( $_POST[ $key ] ) ) {
			update_post_meta( $id, $key, sanitize_textarea_field( wp_unslash( $_POST[ $key ] ) ) );
		}
	}
} );

// Duplicate: the quickest way to add a sector with the same page design.
add_filter( 'post_row_actions', function ( $actions, $post ) {
	if ( 'sector' === $post->post_type && current_user_can( 'edit_posts' ) ) {
		$url                  = wp_nonce_url( admin_url( 'admin-post.php?action=whizzit_duplicate_sector&post=' . $post->ID ), 'whizzit_duplicate_' . $post->ID );
		$actions['duplicate'] = '<a href="' . esc_url( $url ) . '">Duplicate</a>';
	}
	return $actions;
}, 10, 2 );

add_action( 'admin_post_whizzit_duplicate_sector', function () {
	$id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0;
	check_admin_referer( 'whizzit_duplicate_' . $id );
	$post = get_post( $id );
	if ( ! $post || 'sector' !== $post->post_type || ! current_user_can( 'edit_posts' ) ) {
		wp_die( 'Cannot duplicate this sector.' );
	}
	$copy = wp_insert_post( wp_slash( [
		'post_type'    => 'sector',
		'post_status'  => 'draft',
		'post_title'   => $post->post_title . ' (copy)',
		'post_content' => $post->post_content,
		'menu_order'   => $post->menu_order + 1,
	] ) );
	// The design and listing come across; the old page's title, description and
	// importer bookkeeping do not.
	$skip = [ '_edit_lock', '_edit_last', '_elementor_css', '_whizzit_title', '_whizzit_description', '_whizzit_sector_key' ];
	foreach ( get_post_meta( $id ) as $key => $values ) {
		if ( ! in_array( $key, $skip, true ) ) {
			update_post_meta( $copy, $key, wp_slash( maybe_unserialize( $values[0] ) ) );
		}
	}
	wp_safe_redirect( admin_url( 'post.php?action=edit&post=' . $copy ) );
	exit;
} );

/* ---------- Import: the sector pages become sectors ---------- */

/** @return array<int, array{path:string, status:string, id:int}> */
function whizzit_import_sectors() {
	$report = [];
	foreach ( whizzit_data( 'sectors' )['sectors'] ?? [] as $n => $s ) {
		$post = get_page_by_path( trim( $s['path'], '/' ), OBJECT, [ 'page', 'sector' ] );
		if ( ! $post ) {
			$report[] = [ 'path' => $s['path'], 'status' => 'missing', 'id' => 0 ];
			continue;
		}
		if ( 'page' === $post->post_type ) {
			set_post_type( $post->ID, 'sector' );
			wp_update_post( [ 'ID' => $post->ID, 'menu_order' => $n ] );
		}
		foreach ( [ 'label' => '_whizzit_sector_label', 'desc' => '_whizzit_sector_desc', 'note' => '_whizzit_sector_note', 'icon' => '_whizzit_sector_icon', 'photo' => '_whizzit_sector_photo', 'key' => '_whizzit_sector_key' ] as $field => $key ) {
			update_post_meta( $post->ID, $key, wp_slash( $s[ $field ] ) );
		}
		$report[] = [ 'path' => $s['path'], 'status' => 'sector', 'id' => $post->ID ];
	}
	return $report;
}

/** Imported sectors back to pages (sectors added since are left alone). */
function whizzit_revert_sectors() {
	$report = [];
	foreach ( get_posts( [ 'post_type' => 'sector', 'post_status' => 'any', 'numberposts' => -1, 'meta_key' => '_whizzit_sector_key' ] ) as $post ) { // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- eight rows, admin only.
		set_post_type( $post->ID, 'page' );
		$report[] = [ 'path' => '/' . $post->post_name . '/', 'status' => 'page again', 'id' => $post->ID ];
	}
	return $report;
}
