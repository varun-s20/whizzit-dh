<?php
/**
 * Replaces Hello Elementor's footer: closes <main>, then the design's footer and
 * mobile menu.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;
?>
</main>
<?php whizzit_footer(); ?>
<?php whizzit_part( 'mobile-nav' ); ?>
<?php wp_footer(); ?>
</body>
</html>
