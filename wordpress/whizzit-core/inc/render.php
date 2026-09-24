<?php
/**
 * Rendering helpers shared by the shortcodes and the theme's blog templates.
 *
 * Each function prints the same markup as its counterpart in the design build
 * (_build/lib.mjs, pages/blog.mjs, pages/home.mjs, pages/articles.mjs), so the
 * design's stylesheet applies unchanged. The icon set, categories and services
 * come from data/*.json, exported by _build/wp-export.mjs.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

/** A data file from data/, decoded and cached for the request. */
function whizzit_data( $name ) {
	static $cache = [];
	if ( ! isset( $cache[ $name ] ) ) {
		$file           = plugin_dir_path( WHIZZIT_CORE_FILE ) . 'data/' . $name . '.json';
		$cache[ $name ] = is_readable( $file ) ? (array) json_decode( (string) file_get_contents( $file ), true ) : []; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file.
	}
	return $cache[ $name ];
}

/** The design's SVG icon (from icons.mjs), optionally with a class. */
function whizzit_icon( $name, $class = '' ) {
	$svg = whizzit_data( 'icons' )[ $name ] ?? '';
	return $class ? preg_replace( '/^<svg/', '<svg class="' . esc_attr( $class ) . '"', $svg, 1 ) : $svg;
}

/** The theme's design assets URL (images live with the design, in the theme). */
function whizzit_asset_url( $path ) {
	return get_stylesheet_directory_uri() . '/assets/' . ltrim( $path, '/' );
}

/* ---------- Posts ---------- */

/** Look (label, tone, icon, stand-in photo) for a blog category slug. */
function whizzit_category_look( $slug ) {
	foreach ( whizzit_data( 'categories' )['categories'] ?? [] as $cat ) {
		if ( $cat['slug'] === $slug ) {
			return $cat;
		}
	}
	return null;
}

/** The post's first category with a known look; unknown categories keep their name. */
function whizzit_post_category( $post ) {
	$fallback = [ 'slug' => 'managed-it', 'label' => 'Managed IT', 'tone' => 'support', 'icon' => 'book', 'photo' => 'team' ];
	$terms    = get_the_category( $post->ID );
	foreach ( $terms as $term ) {
		$look = whizzit_category_look( $term->slug );
		if ( $look ) {
			return array_merge( $look, [ 'label' => $term->name ] );
		}
	}
	if ( $terms && 'uncategorized' !== $terms[0]->slug ) {
		return array_merge( $fallback, [ 'slug' => $terms[0]->slug, 'label' => $terms[0]->name ] );
	}
	return $fallback;
}

/** Everything a card or the article header needs about a post. */
function whizzit_post( $post ) {
	$post  = get_post( $post );
	$words = str_word_count( wp_strip_all_tags( $post->post_content ) );
	$read  = (int) get_post_meta( $post->ID, '_whizzit_read', true );
	$by    = (string) get_post_meta( $post->ID, '_whizzit_author', true );
	return [
		'id'        => $post->ID,
		'url'       => get_permalink( $post ),
		'title'     => get_the_title( $post ),
		'excerpt'   => has_excerpt( $post ) ? get_the_excerpt( $post ) : wp_trim_words( wp_strip_all_tags( $post->post_content ), 30 ),
		'date'      => get_the_date( 'Y-m-d', $post ),
		'date_text' => get_the_date( 'j F Y', $post ),
		'read'      => $read ?: max( 1, (int) ceil( $words / 200 ) ),
		'author'    => $by ?: get_the_author_meta( 'display_name', $post->post_author ),
		'cat'       => whizzit_post_category( $post ),
		'thumb'     => get_post_thumbnail_id( $post ),
	];
}

/** Latest published posts. */
function whizzit_latest_posts( $count = -1, $args = [] ) {
	return get_posts( array_merge( [ 'post_type' => 'post', 'post_status' => 'publish', 'numberposts' => $count, 'orderby' => 'date', 'order' => 'DESC' ], $args ) );
}

/**
 * The post's image: its featured image if it has one, otherwise the category's
 * stock photograph (stockPhoto() in lib.mjs).
 */
function whizzit_post_photo( array $p, $cls, $ratio, $sizes ) {
	$open = sprintf( '<figure class="media ratio-%s %s">', esc_attr( $ratio ), esc_attr( $cls ) );
	if ( $p['thumb'] ) {
		return $open . wp_get_attachment_image( $p['thumb'], 'large', false, [ 'sizes' => $sizes, 'alt' => '', 'loading' => 'lazy', 'decoding' => 'async' ] ) . '</figure>';
	}
	$slug = $p['cat']['photo'] ?? 'team';
	$set  = implode( ', ', array_map( fn( $w ) => whizzit_asset_url( "images/photos/stock-{$slug}-{$w}.webp" ) . " {$w}w", [ 480, 768, 1024, 1280 ] ) );
	return $open . sprintf(
		'<img src="%s" srcset="%s" sizes="%s" alt="" width="1024" height="683" loading="lazy" decoding="async"></figure>',
		esc_url( whizzit_asset_url( "images/photos/stock-{$slug}-1024.webp" ) ),
		esc_attr( $set ),
		esc_attr( $sizes )
	);
}

/** Decorative art for a category icon (blogArt() in lib.mjs). */
function whizzit_blog_art( $icon ) {
	$glyph = preg_replace( '/^<svg/', '<svg x="146" y="86" width="28" height="28"', whizzit_icon( $icon ), 1 );
	return '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor" stroke-width="1" opacity=".35"><circle cx="160" cy="100" r="40"/><circle cx="160" cy="100" r="70"/><circle cx="160" cy="100" r="100"/></g><path d="M0 150 C80 150 100 100 160 100 S260 40 320 40" stroke="currentColor" stroke-width="1.2" fill="none" stroke-dasharray="4 5" opacity=".6"/><rect x="132" y="72" width="56" height="56" rx="16" fill="#fff"/>' . $glyph . '</svg>';
}

/** Blog index card (card() in pages/blog.mjs). */
function whizzit_post_card( $post ) {
	$p = whizzit_post( $post );
	return sprintf(
		'<article class="post-card" data-category="%1$s">%2$s<div class="post-card__body"><p class="post-card__meta"><span class="tag tag--blue">%3$s</span><time datetime="%4$s">%5$s</time><span>%6$d min read</span></p><h3 class="post-card__title"><a class="card-link" href="%7$s">%8$s</a></h3><p>%9$s</p></div></article>',
		esc_attr( $p['cat']['slug'] ),
		whizzit_post_photo( $p, 'post-card__art', '3-2', '(min-width: 1024px) 30vw, 100vw' ),
		esc_html( $p['cat']['label'] ),
		esc_attr( $p['date'] ),
		esc_html( $p['date_text'] ),
		$p['read'],
		esc_url( $p['url'] ),
		esc_html( $p['title'] ),
		esc_html( $p['excerpt'] )
	);
}

/** Related-articles card (blogCard() in lib.mjs). */
function whizzit_blog_card( $post ) {
	$p = whizzit_post( $post );
	return sprintf(
		'<article class="blog-card" data-category="%1$s"><div class="blog-card__art tone-%2$s" aria-hidden="true">%3$s</div><div class="stack"><div class="meta-row"><span class="tag tag--blue">%4$s</span><time datetime="%5$s">%6$s</time><span>%7$d min read</span></div><h3 class="blog-card__title"><a class="card-link" href="%8$s">%9$s</a></h3><p>%10$s</p></div></article>',
		esc_attr( $p['cat']['slug'] ),
		esc_attr( $p['cat']['tone'] ),
		whizzit_blog_art( $p['cat']['icon'] ),
		esc_html( $p['cat']['label'] ),
		esc_attr( $p['date'] ),
		esc_html( $p['date_text'] ),
		$p['read'],
		esc_url( $p['url'] ),
		esc_html( $p['title'] ),
		esc_html( $p['excerpt'] )
	);
}

/** Home page insight tile (insight() in pages/home.mjs). */
function whizzit_insight( $post, $variant ) {
	$p = whizzit_post( $post );
	return sprintf(
		'<article class="insight insight--%1$s">%2$s<div class="insight__body"><p class="insight__date">%3$s<time datetime="%4$s">%5$s</time><span class="tag tag--blue">%6$s</span></p><h3 class="insight__title"><a class="card-link" href="%7$s">%8$s</a></h3><p>%9$s</p></div></article>',
		esc_attr( $variant ),
		whizzit_post_photo( $p, 'insight__art', 'tall' === $variant ? '4-5' : '3-2', '(min-width: 1024px) 32vw, 100vw' ),
		whizzit_icon( 'calendar' ),
		esc_attr( $p['date'] ),
		esc_html( $p['date_text'] ),
		esc_html( $p['cat']['label'] ),
		esc_url( $p['url'] ),
		esc_html( $p['title'] ),
		esc_html( $p['excerpt'] )
	);
}

/* ---------- Services and small parts ---------- */

/** The service a post points readers towards (SERVICE_FOR in pages/articles.mjs). */
function whizzit_service_for( array $p, $slug = '' ) {
	$for = [ 'support' => 'support', 'managed-it' => 'support', 'security' => 'cyber', 'cloud' => 'cloud', 'network' => 'network', 'strategy' => 'projects', 'careers' => 'support' ];
	$key = 'how-to-choose-managed-network-services-provider' === $slug ? 'network' : ( $for[ $p['cat']['slug'] ] ?? 'support' );
	foreach ( whizzit_data( 'services' )['services'] ?? [] as $s ) {
		if ( $s['key'] === $key ) {
			return $s;
		}
	}
	return null;
}

/** serviceRow() in lib.mjs. */
function whizzit_service_row( array $s ) {
	return sprintf(
		'<div class="service-row"><span class="icon-tile icon-tile--sm tone-%1$s">%2$s</span><div><a class="card-link service-row__title" href="%3$s">%4$s</a><span class="service-row__desc">%5$s</span></div>%6$s</div>',
		esc_attr( $s['tone'] ),
		whizzit_icon( $s['icon'] ),
		esc_url( home_url( $s['url'] ) ),
		esc_html( $s['title'] ),
		esc_html( $s['short'] ),
		whizzit_icon( 'arrow' )
	);
}

/** breadcrumbs() in lib.mjs. $items: [ [ title, url ], …, [ title ] ]. */
function whizzit_breadcrumbs( array $items ) {
	$last = count( $items ) - 1;
	$lis  = '';
	foreach ( $items as $i => $item ) {
		$lis .= $i === $last
			? '<li><span aria-current="page">' . esc_html( $item[0] ) . '</span></li>'
			: '<li><a href="' . esc_url( home_url( $item[1] ) ) . '">' . esc_html( $item[0] ) . '</a></li>';
	}
	return '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>' . $lis . '</ol></nav>';
}

/**
 * The article body with an id on every <h2> (new posts from the editor have
 * none), and the contents list built from those headings.
 *
 * @return array{0:string, 1:array<int, array{id:string, title:string}>}
 */
function whizzit_content_with_toc( $html ) {
	$toc  = [];
	$used = [];
	$html = preg_replace_callback(
		'/<h2(\s[^>]*)?>(.*?)<\/h2>/is',
		function ( $m ) use ( &$toc, &$used ) {
			$attrs = $m[1] ?? '';
			$text  = trim( wp_strip_all_tags( $m[2] ) );
			if ( preg_match( '/\sid="([^"]+)"/', $attrs, $id ) ) {
				$id = $id[1];
			} else {
				$base = sanitize_title( $text ) ?: 'section';
				$id   = $base;
				for ( $n = 2; isset( $used[ $id ] ); $n++ ) {
					$id = $base . '-' . $n;
				}
				$attrs .= ' id="' . esc_attr( $id ) . '"';
			}
			$used[ $id ] = true;
			$toc[]       = [ 'id' => $id, 'title' => preg_replace( '/^\d+[.)]\s*/', '', $text ) ];
			return '<h2' . $attrs . '>' . $m[2] . '</h2>';
		},
		$html
	);
	return [ $html, $toc ];
}
