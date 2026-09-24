<?php
/**
 * Fallback for anything not built in Elementor yet (blog posts, archives, search,
 * 404). Replaces Hello Elementor's templates, which open a second <main>.
 * The designed blog post and archive templates come in a later stage.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<section class="section">
	<div class="container container--copy prose">
		<?php if ( is_404() ) : ?>
			<h1>Page not found</h1>
			<p>That page has moved or no longer exists. <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Go to the home page</a>.</p>
		<?php elseif ( is_singular() ) : ?>
			<?php while ( have_posts() ) : the_post(); ?>
				<h1><?php the_title(); ?></h1>
				<?php the_content(); ?>
			<?php endwhile; ?>
		<?php else : ?>
			<h1><?php the_archive_title(); ?></h1>
			<ul>
				<?php while ( have_posts() ) : the_post(); ?>
					<li><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></li>
				<?php endwhile; ?>
			</ul>
			<?php the_posts_pagination(); ?>
		<?php endif; ?>
	</div>
</section>
<?php
get_footer();
