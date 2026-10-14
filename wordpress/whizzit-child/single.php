<?php
/**
 * A blog post in the design (pages/articles.mjs): the article header with the
 * callback form, the text from the post editor with an "In this article" list
 * built from its headings, the related service, related articles and a CTA.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

// The article parts come from the WhizzIT Core plugin; without it, fall back.
if ( ! function_exists( 'whizzit_post' ) ) {
	require get_stylesheet_directory() . '/index.php';
	return;
}

get_header();

while ( have_posts() ) :
	the_post();
	$p                = whizzit_post( get_post() );
	$slug             = get_post_field( 'post_name' );
	[ $body, $toc ]   = whizzit_content_with_toc( apply_filters( 'the_content', get_the_content() ) );
	$svc              = whizzit_service_for( $p, $slug );
	// Previous and next follow the blog listing's order, as the design does.
	$list  = whizzit_listing_posts();
	$at    = array_search( $p['id'], array_map( fn( $post ) => $post->ID, $list ), true );
	$older = false === $at ? get_previous_post() : ( $list[ $at + 1 ] ?? null );
	$newer = false === $at ? get_next_post() : ( $at > 0 ? $list[ $at - 1 ] : null );
	// Staging's own picks (set by the import); otherwise the same category.
	$picked  = array_filter( explode( ',', (string) get_post_meta( $p['id'], '_whizzit_related', true ) ) );
	$related = $picked ? whizzit_latest_posts( 3, [ 'post_name__in' => $picked, 'orderby' => 'post_name__in' ] ) : whizzit_latest_posts( 3, [ 'post__not_in' => [ $p['id'] ], 'category__in' => wp_get_post_categories( $p['id'] ) ] );
	if ( count( $related ) < 3 ) {
		$related = array_merge( $related, whizzit_latest_posts( 3 - count( $related ), [ 'post__not_in' => array_merge( [ $p['id'] ], wp_list_pluck( $related, 'ID' ) ) ] ) );
	}
	// After the body, as the design prints it (exported by the build, set by the import).
	$extra = function ( $key ) use ( $p ) {
		$html = (string) get_post_meta( $p['id'], $key, true );
		$html = function_exists( 'whizzit_expand_assets' ) ? whizzit_expand_assets( $html ) : $html;
		return function_exists( 'whizzit_apply_settings' ) ? whizzit_apply_settings( $html ) : $html;
	};
	$cta      = json_decode( (string) get_post_meta( $p['id'], '_whizzit_cta', true ), true );
	$initials = strtoupper( implode( '', array_map( fn( $w ) => $w[0] ?? '', array_slice( preg_split( '/\s+/', trim( $p['author'] ) ), 0, 2 ) ) ) );
	?>
<article>
	<header class="hero hero--article">
		<div class="container">
			<?php echo whizzit_breadcrumbs( [ [ 'Home', '/' ], [ 'Blog', '/blog/' ], [ $p['title'] ] ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside. ?>
			<div class="meta-row"><a class="tag tag--blue" href="<?php echo esc_url( home_url( '/blog/?category=' . $p['cat']['slug'] ) ); ?>"><?php echo esc_html( $p['chip'] ); ?></a><time datetime="<?php echo esc_attr( $p['date'] ); ?>"><?php echo esc_html( $p['date_text'] ); ?></time><span><?php echo (int) $p['read']; ?> min read</span></div>
			<h1 class="hero__title mt-5"><?php the_title(); ?></h1>
			<?php if ( $p['excerpt'] ) : ?>
				<p class="lead hero__lead"><?php echo esc_html( $p['excerpt'] ); ?></p>
			<?php endif; ?>
			<div class="person mt-6"><span class="avatar" aria-hidden="true"><?php echo esc_html( $initials ?: 'WZ' ); ?></span><span><span class="person__name"><?php echo esc_html( $p['author'] ); ?></span><span class="person__role">WhizzIT</span></span></div>
			<?php whizzit_part( 'callback', [ '{{TRACK}}' => esc_attr( 'article-' . $slug ), '{{CAPTCHA_THEME}}' => 'light' ] ); ?>
			<?php if ( $p['thumb'] ) : ?>
				<figure class="media ratio-16-9 article-cover"><?php echo wp_get_attachment_image( $p['thumb'], 'full', false, [ 'loading' => 'eager', 'sizes' => '(min-width: 1280px) 1240px, 100vw' ] ); ?></figure>
			<?php else : ?>
				<div class="blog-card__art article-cover tone-<?php echo esc_attr( $p['cat']['tone'] ); ?>" aria-hidden="true"><?php echo whizzit_blog_art( $p['cat']['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?></div>
			<?php endif; ?>
		</div>
	</header>

	<div class="container article-layout">
		<div class="prose">
			<?php echo $body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- the_content output. ?>
			<h2 id="help">How WhizzIT can help</h2>
			<?php if ( $svc ) : ?>
				<p>If you'd like a second opinion on any of this, our team is happy to talk it through. See our <a href="<?php echo esc_url( home_url( $svc['url'] ) ); ?>"><?php echo esc_html( str_replace( 'it ', 'IT ', strtolower( $svc['title'] ) ) ); ?></a> service or <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">get in touch</a>.</p>
			<?php endif; ?>
			<?php echo $extra( '_whizzit_author_box' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- generated design markup. ?>
			<nav class="article-nav" aria-label="More articles">
				<?php if ( $older ) : ?>
					<a href="<?php echo esc_url( get_permalink( $older ) ); ?>" rel="prev"><span>Previous article</span><?php echo esc_html( get_the_title( $older ) ); ?></a>
				<?php else : ?>
					<span></span>
				<?php endif; ?>
				<?php if ( $newer ) : ?>
					<a href="<?php echo esc_url( get_permalink( $newer ) ); ?>" rel="next"><span>Next article</span><?php echo esc_html( get_the_title( $newer ) ); ?></a>
				<?php endif; ?>
			</nav>
		</div>

		<aside class="article-aside" aria-label="Article tools">
			<nav class="toc" aria-labelledby="toc-title">
				<h2 id="toc-title">In this article</h2>
				<ol>
					<?php foreach ( $toc as $item ) : ?>
						<li><a href="#<?php echo esc_attr( $item['id'] ); ?>"><?php echo esc_html( $item['title'] ); ?></a></li>
					<?php endforeach; ?>
					<li><a href="#help">How WhizzIT can help</a></li>
				</ol>
			</nav>
			<?php if ( $svc ) : ?>
				<div class="card card--surface stack">
					<p class="h5"><strong>Related service</strong></p>
					<?php echo whizzit_service_row( $svc ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside. ?>
					<a class="btn btn--primary btn--sm" href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" data-track="<?php echo esc_attr( 'article-' . $slug . '-aside-cta' ); ?>"><span>Book a consultation</span><?php echo whizzit_icon( 'arrow', 'btn__arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?></a>
				</div>
			<?php endif; ?>
		</aside>
	</div>
</article>

<?php echo $extra( '_whizzit_faq' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- generated design markup. ?>

<?php if ( $related ) : ?>
<section class="section" aria-labelledby="related-articles-title">
	<div class="container">
		<h2 id="related-articles-title" class="h3">Related articles</h2>
		<div class="blog-grid mt-7"><?php echo implode( '', array_map( 'whizzit_blog_card', $related ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside. ?></div>
	</div>
</section>
<?php endif; ?>

<?php echo $extra( '_whizzit_partners' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- generated design markup. ?>

	<?php
	// The closing CTA card sits at the top of the footer, as on every page,
	// with the article's own wording from staging where it has one.
	$footer_cta = [
		'title' => is_array( $cta ) && ! empty( $cta['title'] ) ? $cta['title'] : 'Want help putting this into practice?',
		'text'  => is_array( $cta ) && ! empty( $cta['text'] ) ? $cta['text'] : 'Our engineers can review your setup and tell you what to prioritise.',
		'cta'   => 'Talk to an IT expert',
		'track' => 'article-' . $slug . '-final-cta',
	];
endwhile;

get_footer( null, [ 'cta' => $footer_cta ?? null ] );
