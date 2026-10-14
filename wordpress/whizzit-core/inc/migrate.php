<?php
/**
 * Tools → WhizzIT import.
 *
 * Puts each page's design (data/pages.json, exported from the design build) into
 * Elementor: one full-width container holding the page's WhizzIT widgets, each
 * with its text, links and images as fields. Pages are found
 * by URL path, never created or deleted, and keep their slug, parent and ID, so
 * every URL stays the same. The old content is left untouched in post_content,
 * which is what "Revert" switches back to.
 *
 * Posts (data/posts.json) get their clean article text in the normal post editor,
 * with an excerpt, a date and a category; the theme's single.php draws the rest.
 * Their previous content is kept in the _whizzit_old_content field for Revert.
 *
 * @package WhizzIT
 */

namespace WhizzIT\Migrate;

defined( 'ABSPATH' ) || exit;

const PAGE_SLUG = 'whizzit-import';
const BUILD_OPTION = 'whizzit_imported_build';

/** The content build this plugin carries (data/build.json, from the export). */
function content_build() {
	$file = plugin_dir_path( WHIZZIT_CORE_FILE ) . 'data/build.json';
	if ( ! is_readable( $file ) ) {
		return '';
	}
	$data = json_decode( (string) file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file.
	return is_string( $data['build'] ?? null ) ? $data['build'] : '';
}

/** True when the pages in WordPress were imported from an older content build. */
function import_is_stale() {
	$build = content_build();
	return '' !== $build && get_option( BUILD_OPTION ) !== $build;
}

/*
 * Uploading a new whizzit-core replaces its section templates. Until the import
 * is run again, pages still point at the old ones and those sections render
 * empty, so say so on every admin screen until it is done.
 */
add_action( 'admin_notices', function () {
	if ( ! current_user_can( 'manage_options' ) || ! import_is_stale() ) {
		return;
	}
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( $screen && 'tools_page_' . PAGE_SLUG === $screen->id && isset( $_POST['whizzit_action'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- read only, to hide the notice while the import runs.
		return;
	}
	printf(
		'<div class="notice notice-error"><p><strong>WhizzIT: the pages need re-importing.</strong> This version of the WhizzIT Core plugin carries updated page designs that are not in the pages yet, so some sections show empty until they are. Run <a href="%s">Tools &rarr; WhizzIT import</a> (it replaces the page content, so any Elementor edits made since the last import are lost), then purge the cache.</p></div>',
		esc_url( admin_url( 'tools.php?page=' . PAGE_SLUG ) )
	);
} );

/** @return array<int, array<string, mixed>> Page records from data/pages.json. */
function records() {
	$file = plugin_dir_path( WHIZZIT_CORE_FILE ) . 'data/pages.json';
	if ( ! is_readable( $file ) ) {
		return [];
	}
	$data = json_decode( (string) file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file.
	return is_array( $data['pages'] ?? null ) ? $data['pages'] : [];
}

function is_post_record( array $rec ) {
	return str_starts_with( $rec['path'], '/blog/' ) && '/blog/' !== $rec['path'];
}

/** The WordPress page at a URL path, or null. */
function find_page( $path ) {
	if ( '/' === $path ) {
		$front = (int) get_option( 'page_on_front' );
		return $front ? get_post( $front ) : get_page_by_path( 'home' );
	}
	$found = get_page_by_path( trim( $path, '/' ), OBJECT, [ 'page', 'sector' ] );
	// Industry pages are sectors at /industries/<slug>/, found by their slug.
	if ( ! $found && preg_match( '#^/industries/[^/]+/$#', $path ) && function_exists( 'whizzit_sector_by_path' ) ) {
		$found = whizzit_sector_by_path( $path );
	}
	return $found;
}

/** Stable 7-character Elementor element ID, so re-imports do not churn IDs. */
function element_id( $seed ) {
	return substr( md5( $seed ), 0, 7 );
}

/** Repeater rows need their own IDs. */
function rows( array $rows, $seed, callable $map ) {
	$out = [];
	foreach ( array_values( $rows ) as $n => $row ) {
		$out[] = [ '_id' => element_id( "$seed:$n" ) ] + $map( $row );
	}
	return $out;
}

/** One widget's settings, from its record in pages.json. */
function widget_settings( array $w, $seed ) {
	$s = $w['settings'];
	if ( 'section' === $w['widget'] ) {
		// Images: the media field starts as the design's own image, so the page
		// keeps its srcset until someone picks a different one.
		foreach ( $s as $key => $value ) {
			if ( str_ends_with( $key, '_html' ) && preg_match( '/<img[^>]*\ssrc="([^"]*)"/', $value, $m ) ) {
				$s[ substr( $key, 0, -5 ) ] = [ 'url' => whizzit_expand_assets( html_entity_decode( $m[1] ) ), 'id' => '' ];
			}
		}
		return $s;
	}
	$lists = fn( $rows ) => rows( $rows, "$seed:list", fn( $l ) => [ 'title' => $l['title'], 'items' => implode( "\n", $l['items'] ) ] );
	$out   = [
		'eyebrow' => $s['eyebrow'] ?? '',
		'title'   => $s['title'] ?? '',
		'lead'    => $s['lead'] ?? '',
		'body'    => whizzit_expand_assets( $s['body'] ?? '' ),
	];
	if ( isset( $s['lists'] ) ) {
		$out['lists'] = $lists( $s['lists'] );
	}
	if ( isset( $s['cards'] ) ) {
		$out['cards'] = rows( $s['cards'], "$seed:card", fn( $c ) => [ 'title' => $c['title'], 'text' => $c['text'] ] );
	}
	if ( isset( $s['tabs'] ) ) {
		$out['tabs'] = rows( $s['tabs'], "$seed:tab", fn( $t ) => [ 'label' => $t['label'], 'html' => whizzit_expand_assets( $t['html'] ) ] );
	}
	if ( isset( $s['items'] ) ) {
		$out['items'] = rows( $s['items'], "$seed:item", fn( $f ) => [ 'q' => $f['q'], 'a' => whizzit_expand_assets( $f['a'] ) ] );
	}
	if ( ! empty( $s['repeated'] ) ) {
		$out['repeated'] = 'yes';
	}
	return $out;
}

function elementor_data( array $rec ) {
	$zero     = [ 'unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'isLinked' => true ];
	$elements = [];
	foreach ( $rec['widgets'] as $n => $w ) {
		$seed       = $rec['path'] . ':' . $n;
		$elements[] = [
			'id'         => element_id( $seed ),
			'elType'     => 'widget',
			'widgetType' => 'section' === $w['widget'] ? 'whizzit-sec-' . $w['tpl'] : 'whizzit-' . $w['widget'],
			'settings'   => widget_settings( $w, $seed ),
			'elements'   => [],
		];
	}
	return [
		[
			'id'       => element_id( $rec['path'] . ':stack' ),
			'elType'   => 'container',
			'isInner'  => false,
			'settings' => [
				'content_width' => 'full',
				'css_classes'   => 'whz-stack',
				'padding'       => $zero,
				'flex_gap'      => [ 'unit' => 'px', 'size' => 0, 'column' => '0', 'row' => '0', 'isLinked' => true ],
			],
			'elements' => $elements,
		],
	];
}

/** @return array<int, array{path:string, status:string, id:int}> */
function import_pages() {
	$report  = [];
	$version = defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '';
	foreach ( records() as $rec ) {
		if ( is_post_record( $rec ) ) {
			continue;
		}
		$post = find_page( $rec['path'] );
		if ( ! $post ) {
			$report[] = [ 'path' => $rec['path'], 'status' => 'missing', 'id' => 0 ];
			continue;
		}
		$id    = $post->ID;
		$title = '/' === $rec['path'] ? $rec['title'] : $rec['title'] . ' | WhizzIT';

		update_post_meta( $id, '_elementor_data', wp_slash( wp_json_encode( elementor_data( $rec ) ) ) );
		update_post_meta( $id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $id, '_elementor_template_type', 'wp-page' );
		update_post_meta( $id, '_elementor_version', $version );
		update_post_meta( $id, '_wp_page_template', 'elementor_header_footer' );
		update_post_meta( $id, '_whizzit_body_class', $rec['bodyClass'] );
		update_post_meta( $id, '_whizzit_title', $title );
		update_post_meta( $id, '_whizzit_description', $rec['description'] );
		update_post_meta( $id, '_whizzit_footer_cta', $rec['footerCta'] ? wp_slash( wp_json_encode( $rec['footerCta'] ) ) : '' );
		delete_post_meta( $id, '_elementor_css' );

		$report[] = [ 'path' => $rec['path'], 'status' => 'imported', 'id' => $id ];
	}
	flush_caches();
	return $report;
}

/** Post records from data/posts.json. */
function post_records() {
	return whizzit_data( 'posts' )['posts'] ?? [];
}

/** Creates the blog categories that have posts; returns slug => term ID. */
function ensure_categories() {
	$ids = [];
	foreach ( whizzit_data( 'categories' )['categories'] ?? [] as $cat ) {
		if ( empty( $cat['used'] ) ) {
			continue;
		}
		$term = get_term_by( 'slug', $cat['slug'], 'category' );
		if ( ! $term ) {
			$made = wp_insert_term( $cat['label'], 'category', [ 'slug' => $cat['slug'] ] );
			$term = is_wp_error( $made ) ? null : get_term( $made['term_id'], 'category' );
		}
		if ( $term ) {
			$ids[ $cat['slug'] ] = (int) $term->term_id;
		}
	}
	return $ids;
}

/** @return array<int, array{path:string, status:string, id:int}> */
function import_posts() {
	$report = [];
	$cats   = ensure_categories();
	$records = post_records();
	foreach ( $records as $n => $rec ) {
		$post = get_page_by_path( $rec['slug'], OBJECT, 'post' );
		$path = '/blog/' . $rec['slug'] . '/';
		if ( ! $post ) {
			$report[] = [ 'path' => $path, 'status' => 'missing', 'id' => 0 ];
			continue;
		}
		$id = $post->ID;
		if ( '' === get_post_meta( $id, '_whizzit_old_content', true ) ) {
			update_post_meta( $id, '_whizzit_old_content', wp_slash( $post->post_content ) );
			update_post_meta( $id, '_whizzit_old_excerpt', wp_slash( $post->post_excerpt ) );
			update_post_meta( $id, '_whizzit_old_title', wp_slash( $post->post_title ) );
		}
		// Posts sharing a date keep the design's order: earlier in the list, later in the day.
		$date = $rec['date'] . ' ' . gmdate( 'H:i:s', 9 * HOUR_IN_SECONDS + ( count( $records ) - $n ) * MINUTE_IN_SECONDS );
		// The slug is never passed, so it (and the URL) cannot change.
		wp_update_post( wp_slash( [
			'ID'            => $id,
			'post_title'    => $rec['title'],
			'post_content'  => $rec['body'],
			'post_excerpt'  => $rec['excerpt'],
			'post_date'     => $date,
			'post_date_gmt' => get_gmt_from_date( $date ),
		] ) );
		if ( isset( $cats[ $rec['category'] ] ) ) {
			wp_set_post_categories( $id, [ $cats[ $rec['category'] ] ] );
		}
		update_post_meta( $id, '_whizzit_read', (int) $rec['read'] );
		update_post_meta( $id, '_whizzit_author', $rec['author'] );
		// Staging's blog card wording, the article's own chip, staging's related picks.
		update_post_meta( $id, '_whizzit_card_title', wp_slash( $rec['cardTitle'] ?? '' ) );
		update_post_meta( $id, '_whizzit_card_excerpt', wp_slash( $rec['cardExcerpt'] ?? '' ) );
		update_post_meta( $id, '_whizzit_chip', wp_slash( $rec['chip'] ?? '' ) );
		update_post_meta( $id, '_whizzit_related', implode( ',', $rec['related'] ?? [] ) );
		// What the design prints after the body (single.php): author box, FAQ,
		// partners, and the closing call to action's own wording.
		update_post_meta( $id, '_whizzit_author_box', wp_slash( $rec['authorHtml'] ?? '' ) );
		update_post_meta( $id, '_whizzit_faq', wp_slash( $rec['faqHtml'] ?? '' ) );
		update_post_meta( $id, '_whizzit_partners', wp_slash( $rec['partnersHtml'] ?? '' ) );
		update_post_meta( $id, '_whizzit_cta', ! empty( $rec['cta'] ) ? wp_slash( wp_json_encode( $rec['cta'] ) ) : '' );
		$report[] = [ 'path' => $path, 'status' => 'imported', 'id' => $id ];
	}
	// Categories an earlier import made that staging's four replaced.
	foreach ( [ 'support', 'strategy', 'careers' ] as $old ) {
		$term = get_term_by( 'slug', $old, 'category' );
		if ( $term && 0 === (int) $term->count ) {
			wp_delete_term( $term->term_id, 'category' );
		}
	}
	return $report;
}

/** Puts every imported post back to its previous content and category. */
function revert_posts() {
	$report = [];
	foreach ( post_records() as $rec ) {
		$post = get_page_by_path( $rec['slug'], OBJECT, 'post' );
		if ( ! $post || '' === get_post_meta( $post->ID, '_whizzit_old_content', true ) ) {
			continue;
		}
		wp_update_post( wp_slash( [
			'ID'           => $post->ID,
			'post_title'   => get_post_meta( $post->ID, '_whizzit_old_title', true ) ?: $post->post_title,
			'post_content' => get_post_meta( $post->ID, '_whizzit_old_content', true ),
			'post_excerpt' => get_post_meta( $post->ID, '_whizzit_old_excerpt', true ),
		] ) );
		wp_set_post_categories( $post->ID, [ (int) get_option( 'default_category' ) ] );
		foreach ( [ '_whizzit_old_content', '_whizzit_old_excerpt', '_whizzit_old_title', '_whizzit_read', '_whizzit_author', '_whizzit_card_title', '_whizzit_card_excerpt', '_whizzit_chip', '_whizzit_related' ] as $key ) {
			delete_post_meta( $post->ID, $key );
		}
		$report[] = [ 'path' => '/blog/' . $rec['slug'] . '/', 'status' => 'reverted', 'id' => $post->ID ];
	}
	return $report;
}

/** Switches every imported page back to its original content. */
function revert_pages() {
	$report = [];
	foreach ( records() as $rec ) {
		if ( is_post_record( $rec ) ) {
			continue;
		}
		$post = find_page( $rec['path'] );
		if ( ! $post ) {
			continue;
		}
		delete_post_meta( $post->ID, '_elementor_edit_mode' );
		update_post_meta( $post->ID, '_wp_page_template', 'default' );
		foreach ( [ '_whizzit_body_class', '_whizzit_title', '_whizzit_description', '_whizzit_footer_cta' ] as $key ) {
			delete_post_meta( $post->ID, $key );
		}
		$report[] = [ 'path' => $rec['path'], 'status' => 'reverted', 'id' => $post->ID ];
	}
	flush_caches();
	return $report;
}

function flush_caches() {
	if ( class_exists( '\Elementor\Plugin' ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	do_action( 'litespeed_purge_all' );
}

/* ---------- Admin screen ---------- */

add_action( 'admin_menu', function () {
	add_management_page( 'WhizzIT import', 'WhizzIT import', 'manage_options', PAGE_SLUG, __NAMESPACE__ . '\\screen' );
} );

function screen() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$report = null;
	$action = isset( $_POST['whizzit_action'] ) ? sanitize_key( wp_unslash( $_POST['whizzit_action'] ) ) : '';
	if ( $action && check_admin_referer( 'whizzit_import' ) ) {
		// Seventy-odd pages of Elementor data can outlast a 30-second host limit.
		if ( function_exists( 'set_time_limit' ) ) {
			set_time_limit( 300 );
		}
		if ( 'import' === $action ) {
			// Sectors first, so a slow host can never leave them unconverted.
			$report = array_merge( whizzit_import_sectors(), import_pages(), import_posts() );
			update_option( BUILD_OPTION, content_build(), false );
		} elseif ( 'revert' === $action ) {
			$report = array_merge( whizzit_revert_sectors(), revert_pages(), revert_posts() );
			delete_option( BUILD_OPTION );
		}
		flush_caches();
	}

	$pages = count( array_filter( records(), fn( $r ) => ! is_post_record( $r ) ) );
	$posts = count( post_records() );
	?>
	<div class="wrap">
		<h1>WhizzIT import</h1>
		<p>Puts the new design into Elementor on all <strong><?php echo (int) $pages; ?></strong> pages (the sector pages become Sectors, at the same URLs), and the article text, excerpt, date and category into all <strong><?php echo (int) $posts; ?></strong> blog posts. Everything is matched by its URL and keeps it. Nothing is deleted: the old content is kept, and <em>Revert</em> switches back to it.</p>
		<p>Now: plugin <?php echo esc_html( WHIZZIT_CORE_VERSION ); ?>, theme <?php echo esc_html( wp_get_theme()->get( 'Version' ) ); ?>, <strong><?php echo (int) count( get_posts( [ 'post_type' => 'sector', 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids' ] ) ); ?></strong> sectors.</p>
		<p>Page content in this plugin: <code><?php echo esc_html( content_build() ?: 'unknown' ); ?></code>. Last imported: <code><?php echo esc_html( (string) ( get_option( BUILD_OPTION ) ?: 'not recorded' ) ); ?></code>
			<?php echo import_is_stale() ? ' &mdash; <strong>import needed</strong>' : ' &mdash; up to date'; ?></p>
		<?php if ( ! defined( 'ELEMENTOR_VERSION' ) ) : ?>
			<div class="notice notice-error"><p>Elementor is not active. Activate it first.</p></div>
		<?php endif; ?>
		<form method="post">
			<?php wp_nonce_field( 'whizzit_import' ); ?>
			<p>
				<button class="button button-primary" name="whizzit_action" value="import">Import pages and posts</button>
				<button class="button" name="whizzit_action" value="revert" onclick="return confirm('Switch every page and post back to its old content, and the sectors back to pages?');">Revert to old content</button>
			</p>
		</form>
		<?php if ( $report ) : ?>
			<?php
			$counts = array_count_values( array_column( $report, 'status' ) );
			echo '<div class="notice notice-success"><p>';
			foreach ( $counts as $status => $n ) {
				printf( '%s: <strong>%d</strong>&nbsp;&nbsp; ', esc_html( ucfirst( $status ) ), (int) $n );
			}
			echo '</p></div>';
			?>
			<table class="widefat striped" style="max-width:900px">
				<thead><tr><th>URL</th><th>Result</th><th>Page ID</th></tr></thead>
				<tbody>
				<?php foreach ( $report as $row ) : ?>
					<tr>
						<td><a href="<?php echo esc_url( home_url( $row['path'] ) ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $row['path'] ); ?></a></td>
						<td><?php echo 'missing' === $row['status'] ? '<strong style="color:#b32d2e">Missing: no page at this URL</strong>' : esc_html( ucfirst( $row['status'] ) ); ?></td>
						<td><?php echo $row['id'] ? (int) $row['id'] : '—'; ?></td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
		<?php endif; ?>
	</div>
	<?php
}
