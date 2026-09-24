<?php
/**
 * A page section as an Elementor widget.
 *
 * The section's markup comes from data/sections/{id}.json (exported from the
 * design build). Every piece of visible text, every link and every image in it is
 * a field; the markup around them is fixed, so the design cannot drift. Each
 * template has its own small class (inc/generated-sections.php) because Elementor
 * needs one class per widget type; they all share this one.
 *
 * @package WhizzIT
 */

namespace WhizzIT\Widgets;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

defined( 'ABSPATH' ) || exit;

abstract class Section extends Widget_Base {

	const TPL = '';

	public function get_name() {
		return 'whizzit-sec-' . static::TPL;
	}

	public function get_title() {
		return 'WhizzIT · ' . ( whizzit_section_index()[ static::TPL ]['title'] ?? 'Section' );
	}

	public function get_icon() {
		return 'eicon-single-page';
	}

	public function get_categories() {
		return [ 'whizzit-sections' ];
	}

	public function get_keywords() {
		return [ 'whizzit', 'section' ];
	}

	/** Page sections are edited where they are, not added from the panel. */
	public function show_in_panel() {
		return false;
	}

	protected function template() {
		return whizzit_section_template( static::TPL );
	}

	protected function register_controls() {
		$tpl = $this->template();
		$this->start_controls_section( 'content', [ 'label' => 'Content' ] );
		foreach ( $tpl['slots'] ?? [] as $slot ) {
			$key = $slot['k'];
			if ( 's' === $slot['type'] ) {
				$long = strlen( $slot['default'] ) > 60;
				$this->add_control( $key, [
					'label'       => $slot['label'],
					'type'        => $long ? Controls_Manager::TEXTAREA : Controls_Manager::TEXT,
					'default'     => $slot['default'],
					'label_block' => true,
					'rows'        => $long ? max( 3, (int) ceil( strlen( $slot['default'] ) / 60 ) ) : null,
				] );
			} elseif ( 'u' === $slot['type'] ) {
				$this->add_control( $key, [
					'label'       => $slot['label'],
					'type'        => Controls_Manager::TEXT,
					'default'     => $slot['default'],
					'label_block' => true,
					'description' => 'Link address, e.g. /contact/ or https://…',
				] );
			} elseif ( 'i' === $slot['type'] ) {
				$this->add_control( $key, [
					'label'   => $slot['label'],
					'type'    => Controls_Manager::MEDIA,
					'default' => [ 'url' => whizzit_expand_assets( $slot['default']['src'] ?? '' ), 'id' => '' ],
				] );
				// The design's own image markup (srcset, sizes), used until a new image is chosen.
				$this->add_control( $key . '_html', [
					'type'    => Controls_Manager::HIDDEN,
					'default' => $slot['default']['html'] ?? '',
				] );
			}
		}
		$this->end_controls_section();
	}

	protected function render() {
		echo whizzit_render_section( $this->template(), $this->get_settings_for_display() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped per field inside.
	}
}
