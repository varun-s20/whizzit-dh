<?php
/**
 * Blog archives: a category (/blog/category/…/), an author or a date. The design
 * has no archive page of its own, so this pairs the article header with the blog
 * page's card grid.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'whizzit_post_card' ) ) {
	require get_stylesheet_directory() . '/index.php';
	return;
}

$title = is_category() ? single_cat_title( '', false ) : ( is_author() ? get_the_author_meta( 'display_name', (int) get_query_var( 'author' ) ) : wp_strip_all_tags( get_the_archive_title() ) );
$lead  = is_category() ? wp_strip_all_tags( category_description() ) : '';

get_header();
?>
<header class="hero hero--article">
	<div class="container">
		<?php echo whizzit_breadcrumbs( [ [ 'Home', '/' ], [ 'Blog', '/blog/' ], [ $title ] ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside. ?>
		<h1 class="hero__title mt-5"><?php echo esc_html( $title ); ?></h1>
		<p class="lead hero__lead"><?php echo esc_html( $lead ?: 'Practical, jargon-free guidance from the WhizzIT team.' ); ?></p>
	</div>
</header>

<section class="section">
	<div class="container">
		<?php if ( have_posts() ) : ?>
			<div class="post-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					echo whizzit_post_card( get_post() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside.
				endwhile;
				?>
			</div>
			<?php the_posts_pagination( [ 'mid_size' => 1 ] ); ?>
		<?php else : ?>
			<p>No articles here yet. <a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">See all articles</a>.</p>
		<?php endif; ?>
	</div>
</section>
<?php
get_footer();
