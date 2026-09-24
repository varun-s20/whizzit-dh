<?php
/**
 * Shortcodes that list posts inside the imported pages, so a newly published
 * post appears on the blog page and the home page without editing either.
 *
 *   [whizzit_blog_featured]  latest post, large (blog page hero)
 *   [whizzit_blog_count]     number of published posts
 *   [whizzit_blog_filters]   topic filter buttons
 *   [whizzit_blog_grid]      every post except the latest, as cards
 *   [whizzit_blog_topics]    "The guides people read first" links
 *   [whizzit_insights]       four latest posts (home page)
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

// Elementor's HTML widget prints its content verbatim; run shortcodes in it.
add_filter( 'elementor/widget/render_content', function ( $content, $widget ) {
	return 'html' === $widget->get_name() ? do_shortcode( $content ) : $content;
}, 10, 2 );

add_shortcode( 'whizzit_blog_count', fn() => (string) (int) wp_count_posts( 'post' )->publish );

add_shortcode( 'whizzit_blog_featured', function () {
	$latest = whizzit_latest_posts( 1 );
	if ( ! $latest ) {
		return '';
	}
	$p = whizzit_post( $latest[0] );
	return sprintf(
		'<article class="featured-post"><p class="featured-post__label">%1$sLatest article</p><p class="post-card__meta"><span class="tag tag--blue">%2$s</span><time datetime="%3$s">%4$s</time><span>%5$d min read</span></p><h2 class="featured-post__title"><a class="card-link" href="%6$s">%7$s</a></h2><p>%8$s</p><span class="read-more" aria-hidden="true">Read the article %9$s</span></article>',
		whizzit_icon( 'sparkle' ),
		esc_html( $p['cat']['label'] ),
		esc_attr( $p['date'] ),
		esc_html( $p['date_text'] ),
		$p['read'],
		esc_url( $p['url'] ),
		esc_html( $p['title'] ),
		esc_html( $p['excerpt'] ),
		whizzit_icon( 'arrow' )
	);
} );

add_shortcode( 'whizzit_blog_filters', function () {
	$chips = [ '<button class="filter-chip" type="button" data-filter="all" aria-pressed="true">All articles</button>' ];
	$terms = get_terms( [ 'taxonomy' => 'category', 'hide_empty' => true ] );
	$order = array_column( whizzit_data( 'categories' )['categories'] ?? [], 'slug' );
	usort( $terms, function ( $a, $b ) use ( $order ) {
		$ia = array_search( $a->slug, $order, true );
		$ib = array_search( $b->slug, $order, true );
		return ( false === $ia ? 99 : $ia ) <=> ( false === $ib ? 99 : $ib );
	} );
	foreach ( $terms as $term ) {
		if ( 'uncategorized' === $term->slug ) {
			continue;
		}
		$chips[] = sprintf( '<button class="filter-chip" type="button" data-filter="%s" aria-pressed="false">%s</button>', esc_attr( $term->slug ), esc_html( $term->name ) );
	}
	return implode( '', $chips );
} );

add_shortcode( 'whizzit_blog_grid', function () {
	return implode( '', array_map( 'whizzit_post_card', array_slice( whizzit_latest_posts(), 1 ) ) );
} );

add_shortcode( 'whizzit_blog_topics', function () {
	$posts = whizzit_latest_posts( 6, [ 'category_name' => 'security,cloud,support,managed-it' ] );
	$out   = '';
	foreach ( $posts as $post ) {
		$p    = whizzit_post( $post );
		$out .= sprintf(
			'<li><a href="%1$s"><span class="topic-links__icon">%2$s</span><span><strong>%3$s</strong><span>%4$s · %5$d min read</span></span>%6$s</a></li>',
			esc_url( $p['url'] ),
			whizzit_icon( $p['cat']['icon'] ),
			esc_html( $p['title'] ),
			esc_html( $p['cat']['label'] ),
			$p['read'],
			whizzit_icon( 'arrow' )
		);
	}
	return $out;
} );

add_shortcode( 'whizzit_insights', function () {
	$variants = [ 'tall', 'card', 'card', 'wide' ];
	$out      = '';
	foreach ( whizzit_latest_posts( 4 ) as $i => $post ) {
		$out .= whizzit_insight( $post, $variants[ $i ] );
	}
	return $out;
} );

// The WordPress default category has no page in the design; after the import it
// is empty, so send its archive to the blog.
add_action( 'template_redirect', function () {
	if ( is_category( 'uncategorized' ) ) {
		wp_safe_redirect( home_url( '/blog/' ), 301 );
		exit;
	}
} );
