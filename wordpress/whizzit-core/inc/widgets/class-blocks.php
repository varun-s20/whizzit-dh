<?php
/**
 * The structured page blocks as Elementor widgets: statement, prose with
 * checklists, numbered cards, tabs and accordion. Markup matches _build/blocks.mjs
 * exactly, so the design's CSS and JS apply unchanged.
 *
 * Headings, labels and list items are plain text; body copy, tab panels and
 * answers are rich text.
 *
 * @package WhizzIT
 */

namespace WhizzIT\Widgets;

use Elementor\Controls_Manager;
use Elementor\Repeater;
use Elementor\Widget_Base;

defined( 'ABSPATH' ) || exit;

abstract class Block extends Widget_Base {

	const SLUG  = '';
	const TITLE = '';
	const ICON  = 'eicon-text';

	public function get_name() {
		return 'whizzit-' . static::SLUG;
	}

	public function get_title() {
		return 'WhizzIT · ' . static::TITLE;
	}

	public function get_icon() {
		return static::ICON;
	}

	public function get_categories() {
		return [ 'whizzit' ];
	}

	public function get_keywords() {
		return [ 'whizzit', static::SLUG ];
	}

	/** Heading id: stable per widget, so aria-labelledby and anchors hold. */
	protected function heading_id() {
		return 'b-' . $this->get_id();
	}

	protected function head_controls( $body = true ) {
		$this->start_controls_section( 'head', [ 'label' => 'Heading' ] );
		$this->add_control( 'eyebrow', [ 'label' => 'Label above heading', 'type' => Controls_Manager::TEXT, 'label_block' => true ] );
		$this->add_control( 'title', [ 'label' => 'Heading', 'type' => Controls_Manager::TEXTAREA, 'rows' => 2, 'default' => 'Section heading' ] );
		$this->add_control( 'lead', [ 'label' => 'Intro line', 'type' => Controls_Manager::TEXTAREA, 'rows' => 3 ] );
		if ( $body ) {
			$this->add_control( 'body', [ 'label' => 'Body text', 'type' => Controls_Manager::WYSIWYG ] );
		}
		$this->end_controls_section();
	}

	/** Checklist cards; one list is one card, two or more sit side by side. */
	protected function list_controls( $label = 'Checklists' ) {
		$rep = new Repeater();
		$rep->add_control( 'title', [ 'label' => 'Card title', 'type' => Controls_Manager::TEXT, 'default' => "What's included", 'label_block' => true ] );
		$rep->add_control( 'items', [ 'label' => 'Items (one per line)', 'type' => Controls_Manager::TEXTAREA, 'rows' => 6 ] );
		$this->start_controls_section( 'lists_section', [ 'label' => $label ] );
		$this->add_control( 'lists', [ 'label' => $label, 'type' => Controls_Manager::REPEATER, 'fields' => $rep->get_controls(), 'title_field' => '{{{ title }}}', 'default' => [] ] );
		$this->end_controls_section();
	}

	protected function head( array $s, $center = false ) {
		$out = '<div class="' . ( $center ? 'center-head' : 'block-head' ) . '">';
		if ( '' !== trim( (string) $s['eyebrow'] ) ) {
			$out .= '<p class="eyebrow">' . esc_html( $s['eyebrow'] ) . '</p>';
		}
		$out .= '<h2 class="grad-head" id="' . esc_attr( $this->heading_id() ) . '">' . esc_html( $s['title'] ) . '</h2>';
		if ( '' !== trim( (string) $s['lead'] ) ) {
			$out .= '<p>' . esc_html( $s['lead'] ) . '</p>';
		}
		return $out . '</div>';
	}

	protected function body( array $s, $class ) {
		$html = trim( (string) ( $s['body'] ?? '' ) );
		return '' === $html ? '' : '<div class="' . $class . '">' . wp_kses_post( $html ) . '</div>';
	}

	protected function check_card( array $list ) {
		$items = array_filter( array_map( 'trim', preg_split( '/\R/', (string) $list['items'] ) ) );
		$lis   = implode( '', array_map( fn( $i ) => '<li>' . esc_html( $i ) . '</li>', $items ) );
		return '<aside class="check-card"><h3>' . esc_html( $list['title'] ) . '</h3><ul role="list">' . $lis . '</ul></aside>';
	}

	protected function check_cards( array $lists ) {
		if ( count( $lists ) > 1 ) {
			return '<div class="check-grid">' . implode( '', array_map( [ $this, 'check_card' ], $lists ) ) . '</div>';
		}
		return $lists ? $this->check_card( $lists[0] ) : '';
	}

	protected function open( $extra = '' ) {
		return '<section class="section block' . $extra . '" aria-labelledby="' . esc_attr( $this->heading_id() ) . '">';
	}
}

final class Statement extends Block {
	const SLUG  = 'statement';
	const TITLE = 'Statement';
	const ICON  = 'eicon-text-area';

	protected function register_controls() {
		$this->head_controls();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		echo $this->open( ' block--statement' ) . '<div class="container statement-wide">' . $this->head( $s, true ) . $this->body( $s, 'prose-cols' ) . '</div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped per field.
	}
}

final class ProseLists extends Block {
	const SLUG  = 'prose-lists';
	const TITLE = 'Text with checklist';
	const ICON  = 'eicon-bullet-list';

	protected function register_controls() {
		$this->head_controls();
		$this->list_controls();
		$this->start_controls_section( 'options', [ 'label' => 'Options' ] );
		$this->add_control( 'repeated', [
			'label'        => 'Checklist repeats the heading',
			'description'  => 'Shows the label above the heading as "What we cover" when empty, and leaves the intro line out.',
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
		] );
		$this->end_controls_section();
	}

	protected function render() {
		$s = $this->get_settings_for_display();
		if ( 'yes' === $s['repeated'] ) {
			$head = '<p class="eyebrow">' . esc_html( '' !== trim( (string) $s['eyebrow'] ) ? $s['eyebrow'] : 'What we cover' ) . '</p><h2 class="grad-head" id="' . esc_attr( $this->heading_id() ) . '">' . esc_html( $s['title'] ) . '</h2>';
		} else {
			$head = $this->head( $s );
		}
		echo $this->open() . '<div class="container block-split"><div>' . $head . $this->body( $s, 'block-prose' ) . '</div>' . $this->check_cards( $s['lists'] ?: [] ) . '</div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped per field.
	}
}

final class Cards extends Block {
	const SLUG  = 'cards';
	const TITLE = 'Numbered cards';
	const ICON  = 'eicon-gallery-grid';

	protected function register_controls() {
		$this->head_controls();
		$rep = new Repeater();
		$rep->add_control( 'title', [ 'label' => 'Title', 'type' => Controls_Manager::TEXT, 'label_block' => true ] );
		$rep->add_control( 'text', [ 'label' => 'Text', 'type' => Controls_Manager::TEXTAREA, 'rows' => 4 ] );
		$this->start_controls_section( 'cards_section', [ 'label' => 'Cards' ] );
		$this->add_control( 'cards', [ 'label' => 'Cards', 'type' => Controls_Manager::REPEATER, 'fields' => $rep->get_controls(), 'title_field' => '{{{ title }}}', 'default' => [] ] );
		$this->end_controls_section();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$cards = $s['cards'] ?: [];
		$grid  = '';
		foreach ( array_values( $cards ) as $n => $c ) {
			$grid .= sprintf( '<article class="detail-card"><span class="detail-card__num">%02d</span><h3>%s</h3><p>%s</p></article>', $n + 1, esc_html( $c['title'] ), esc_html( $c['text'] ) );
		}
		echo $this->open() . '<div class="container">' . $this->head( $s, true ) . $this->body( $s, 'block-prose block-prose--wide' ) . '<div class="detail-grid detail-grid--' . (int) min( max( count( $cards ), 1 ), 3 ) . '">' . $grid . '</div></div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped per field.
	}
}

final class Tabs extends Block {
	const SLUG  = 'tabs';
	const TITLE = 'Text with tabs';
	const ICON  = 'eicon-tabs';

	protected function register_controls() {
		$this->head_controls();
		$this->list_controls( 'Checklists (optional)' );
		$rep = new Repeater();
		$rep->add_control( 'label', [ 'label' => 'Tab label', 'type' => Controls_Manager::TEXT, 'label_block' => true ] );
		$rep->add_control( 'html', [ 'label' => 'Tab text', 'type' => Controls_Manager::WYSIWYG ] );
		$this->start_controls_section( 'tabs_section', [ 'label' => 'Tabs' ] );
		$this->add_control( 'tabs', [ 'label' => 'Tabs', 'type' => Controls_Manager::REPEATER, 'fields' => $rep->get_controls(), 'title_field' => '{{{ label }}}', 'default' => [] ] );
		$this->end_controls_section();
	}

	protected function render() {
		$s    = $this->get_settings_for_display();
		$key  = 'w' . $this->get_id();
		$tabs = array_values( $s['tabs'] ?: [] );
		$list = '';
		$pans = '';
		foreach ( $tabs as $n => $t ) {
			$list .= sprintf( '<button class="tabs__tab" type="button" role="tab" id="tab-%1$s-%2$d" aria-controls="panel-%1$s-%2$d" aria-selected="%3$s">%4$s</button>', esc_attr( $key ), $n, 0 === $n ? 'true' : 'false', esc_html( $t['label'] ) );
			$pans .= sprintf( '<div class="tabs__panel" role="tabpanel" id="panel-%1$s-%2$d" aria-labelledby="tab-%1$s-%2$d" tabindex="0">%3$s</div>', esc_attr( $key ), $n, wp_kses_post( $t['html'] ) );
		}
		echo $this->open() . '<div class="container block-split"><div>' . $this->head( $s ) . $this->body( $s, 'block-prose' ) . $this->check_cards( $s['lists'] ?: [] ) . '</div>' // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped per field.
			. '<div class="tabs tabs--panel" data-tabs><div class="tabs__list pill-tabs" role="tablist" aria-label="' . esc_attr( $s['title'] ) . '">' . $list . '</div>' . $pans . '</div></div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped per field.
	}
}

final class Accordion extends Block {
	const SLUG  = 'accordion';
	const TITLE = 'Text with accordion';
	const ICON  = 'eicon-accordion';

	protected function register_controls() {
		$this->head_controls();
		$rep = new Repeater();
		$rep->add_control( 'q', [ 'label' => 'Title', 'type' => Controls_Manager::TEXT, 'label_block' => true ] );
		$rep->add_control( 'a', [ 'label' => 'Text', 'type' => Controls_Manager::WYSIWYG ] );
		$this->start_controls_section( 'items_section', [ 'label' => 'Items' ] );
		$this->add_control( 'items', [ 'label' => 'Items', 'type' => Controls_Manager::REPEATER, 'fields' => $rep->get_controls(), 'title_field' => '{{{ q }}}', 'default' => [] ] );
		$this->end_controls_section();
	}

	protected function render() {
		$s     = $this->get_settings_for_display();
		$items = '';
		foreach ( $s['items'] ?: [] as $f ) {
			$items .= '<details class="faq-item"><summary>' . esc_html( $f['q'] ) . '</summary><div class="faq-item__body">' . wp_kses_post( $f['a'] ) . '</div></details>';
		}
		echo $this->open() . '<div class="container block-split"><div>' . $this->head( $s ) . $this->body( $s, 'block-prose' ) . '</div><div class="faq-panel">' . $items . '</div></div></section>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped per field.
	}
}

return [ Statement::class, ProseLists::class, Cards::class, Tabs::class, Accordion::class ];
