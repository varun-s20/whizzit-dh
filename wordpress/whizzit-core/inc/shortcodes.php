<?php
/**
 * Shortcodes that list posts inside the imported pages, so a newly published
 * post appears on the blog page and the home page without editing either.
 *
 * The listing follows staging's blog page (whizzit_blog_listing()): its cards,
 * their wording, its four categories and its order.
 *
 *   [whizzit_blog_featured]  first card, large (blog page hero)
 *   [whizzit_blog_count]     number of published posts
 *   [whizzit_blog_filters]   topic filter buttons
 *   [whizzit_blog_grid]      every other card
 *   [whizzit_blog_topics]    "The guides people read first" links
 *   [whizzit_insights]       first four articles (home page)
 *   [whizzit_enquiry …]      the enquiry box inside an article
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
	$latest = whizzit_listing_posts( 1 );
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
		esc_html( $p['card_title'] ),
		esc_html( $p['card_excerpt'] ),
		whizzit_icon( 'arrow' )
	);
} );

// Staging's filters: All, then its four categories in its order.
add_shortcode( 'whizzit_blog_filters', function () {
	$chips = [ '<button class="filter-chip" type="button" data-filter="all" aria-pressed="true">All</button>' ];
	foreach ( whizzit_data( 'categories' )['categories'] ?? [] as $cat ) {
		$term    = get_term_by( 'slug', $cat['slug'], 'category' );
		$chips[] = sprintf( '<button class="filter-chip" type="button" data-filter="%s" aria-pressed="false">%s</button>', esc_attr( $cat['slug'] ), esc_html( $term ? $term->name : $cat['label'] ) );
	}
	return implode( '', $chips );
} );

add_shortcode( 'whizzit_blog_grid', function () {
	$items = whizzit_blog_listing();
	// The first post is the featured card above the grid.
	$first = whizzit_listing_posts( 1 );
	$items = array_filter( $items, fn( $item ) => ! ( $first && $item === $first[0] ) );
	return implode( '', array_map( 'whizzit_post_card', $items ) );
} );

add_shortcode( 'whizzit_blog_topics', function () {
	$want  = [ 'security', 'cloud', 'managed-it' ];
	$posts = array_slice( array_values( array_filter( whizzit_listing_posts(), fn( $post ) => in_array( whizzit_post( $post )['cat']['slug'], $want, true ) ) ), 0, 6 );
	$out   = '';
	foreach ( $posts as $post ) {
		$p    = whizzit_post( $post );
		$out .= sprintf(
			'<li><a href="%1$s"><span class="topic-links__icon">%2$s</span><span><strong>%3$s</strong><span>%4$s · %5$d min read</span></span>%6$s</a></li>',
			esc_url( $p['url'] ),
			whizzit_icon( $p['cat']['icon'] ),
			esc_html( $p['card_title'] ),
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
	foreach ( whizzit_listing_posts( 4 ) as $i => $post ) {
		$out .= whizzit_insight( $post, $variants[ $i ] );
	}
	return $out;
} );

// The WordPress default category has no page in the design; after the import it
// is empty, so send its archive to the blog. Staging has no other category pages,
// so neither does this site: they are "not found" (the blog's filters stand in).
add_action( 'template_redirect', function () {
	if ( is_category( 'uncategorized' ) ) {
		wp_safe_redirect( home_url( '/blog/' ), 301 );
		exit;
	}
	if ( is_category() ) {
		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
		nocache_headers();
	}
} );

// Category feeds and sitemap entries would point at pages that do not exist.
add_filter( 'wp_sitemaps_taxonomies', fn( $taxonomies ) => array_diff_key( $taxonomies, [ 'category' => true ] ) );

/**
 * [whizzit_enquiry eyebrow="" title="" text="" quote="" by="" role=""]: the
 * enquiry box staging has inside four articles, with a live message form
 * (form_name=inline). Markup from data/enquiry.html (enquiryBox() in lib.mjs).
 */
add_shortcode( 'whizzit_enquiry', function ( $atts ) {
	static $n = 0;
	$atts = shortcode_atts( [ 'eyebrow' => '', 'title' => '', 'text' => '', 'quote' => '', 'by' => '', 'role' => '' ], $atts, 'whizzit_enquiry' );
	$file = plugin_dir_path( WHIZZIT_CORE_FILE ) . 'data/enquiry.html';
	if ( ! is_readable( $file ) ) {
		return '';
	}
	$tokens = [ '{{ID}}' => 'eq' . $n++ ];
	foreach ( $atts as $key => $value ) {
		$tokens[ '{{' . strtoupper( $key ) . '}}' ] = esc_html( $value );
	}
	$html = strtr( (string) file_get_contents( $file ), $tokens ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file.
	return function_exists( 'whizzit_apply_settings' ) ? whizzit_apply_settings( $html ) : $html;
} );

/* ---------- Blog listing fields on each post ---------- */

// Staging's blog cards word each article differently from its own title and
// excerpt; these fields hold that wording. Empty means the post's own.
add_action( 'add_meta_boxes_post', function () {
	add_meta_box( 'whizzit-card', 'Blog listing', 'whizzit_card_box', 'post', 'normal', 'high' );
} );

function whizzit_card_box( $post ) {
	wp_nonce_field( 'whizzit_card', 'whizzit_card_nonce' );
	$title   = (string) get_post_meta( $post->ID, '_whizzit_card_title', true );
	$excerpt = (string) get_post_meta( $post->ID, '_whizzit_card_excerpt', true );
	?>
	<p>How this article appears on the blog page and the home page. Leave empty to use the article's title and excerpt.</p>
	<p><label for="whizzit-card-title"><strong>Card title</strong></label><br><input class="large-text" id="whizzit-card-title" name="whizzit_card_title" value="<?php echo esc_attr( $title ); ?>" placeholder="<?php echo esc_attr( $post->post_title ); ?>"></p>
	<p><label for="whizzit-card-excerpt"><strong>Card text</strong></label><br><textarea class="large-text" rows="3" id="whizzit-card-excerpt" name="whizzit_card_excerpt" placeholder="<?php echo esc_attr( $post->post_excerpt ); ?>"><?php echo esc_textarea( $excerpt ); ?></textarea></p>
	<?php
}

add_action( 'save_post_post', function ( $id ) {
	if ( ! isset( $_POST['whizzit_card_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['whizzit_card_nonce'] ) ), 'whizzit_card' ) || ! current_user_can( 'edit_post', $id ) ) {
		return;
	}
	update_post_meta( $id, '_whizzit_card_title', sanitize_text_field( wp_unslash( $_POST['whizzit_card_title'] ?? '' ) ) );
	update_post_meta( $id, '_whizzit_card_excerpt', sanitize_textarea_field( wp_unslash( $_POST['whizzit_card_excerpt'] ?? '' ) ) );
} );
