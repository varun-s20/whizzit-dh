<?php
/**
 * Registers the WhizzIT Elementor widgets.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

add_action( 'elementor/elements/categories_registered', function ( $manager ) {
	$manager->add_category( 'whizzit', [ 'title' => 'WhizzIT', 'icon' => 'eicon-site-identity' ] );
	$manager->add_category( 'whizzit-sections', [ 'title' => 'WhizzIT page sections', 'icon' => 'eicon-single-page' ] );
} );

add_action( 'elementor/widgets/register', function ( $widgets ) {
	require_once __DIR__ . '/widgets/class-section.php';
	$classes = array_merge(
		require __DIR__ . '/widgets/class-blocks.php',
		require __DIR__ . '/generated-sections.php'
	);
	foreach ( $classes as $class ) {
		$widgets->register( new $class() );
	}
} );
