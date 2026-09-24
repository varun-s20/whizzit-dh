<?php
/**
 * Settings → WhizzIT: the phone number, email address and the remote-support and
 * booking links, changed in one place for the whole site.
 *
 * The design prints the current number and address as text. Wherever they
 * appear — header, footer, menus, forms, and every page section — they are
 * swapped for the saved values as the page is drawn, so nothing needs re-editing.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

const WHIZZIT_SETTINGS = [
	'phone'   => [ 'Phone number', '020 4634 2518', 'As it should read, e.g. 020 4634 2518.' ],
	'email'   => [ 'Email address', 'info@whizzit.co.uk', 'Where people are told to write.' ],
	'remote'  => [ 'Remote support link', '/contact/', 'The "Remote support" link at the top of every page: your remote-support portal or download page.' ],
	'booking' => [ 'Booking link', '/contact/', 'The "Book a consultation" button in the header and the mobile menu, e.g. a Calendly or Microsoft Bookings page.' ],
];

function whizzit_setting( $key ) {
	$saved = (array) get_option( 'whizzit_settings', [] );
	$value = trim( (string) ( $saved[ $key ] ?? '' ) );
	return '' !== $value ? $value : WHIZZIT_SETTINGS[ $key ][1];
}

/** Puts the saved phone, email and links into generated markup. */
function whizzit_apply_settings( $html ) {
	static $map = null;
	if ( null === $map ) {
		$phone = whizzit_setting( 'phone' );
		$email = whizzit_setting( 'email' );
		$map   = [
			'href="#remote-support"' => 'href="' . esc_url( whizzit_setting( 'remote' ) ) . '"',
			'href="#booking"'        => 'href="' . esc_url( whizzit_setting( 'booking' ) ) . '"',
		];
		if ( WHIZZIT_SETTINGS['phone'][1] !== $phone ) {
			$map['tel:02046342518'] = 'tel:' . preg_replace( '/[^\d+]/', '', $phone );
			$map['020 4634 2518']   = esc_html( $phone );
		}
		if ( WHIZZIT_SETTINGS['email'][1] !== $email ) {
			$map['info@whizzit.co.uk'] = esc_html( $email );
		}
	}
	return strtr( (string) $html, $map );
}

add_filter( 'elementor/widget/render_content', 'whizzit_apply_settings', 20 );
add_filter( 'the_content', 'whizzit_apply_settings', 20 );

add_action( 'admin_menu', function () {
	add_options_page( 'WhizzIT settings', 'WhizzIT', 'manage_options', 'whizzit-settings', 'whizzit_settings_screen' );
} );

add_action( 'admin_init', function () {
	register_setting( 'whizzit_settings', 'whizzit_settings', [
		'type'              => 'array',
		'sanitize_callback' => function ( $input ) {
			$input = (array) $input;
			return [
				'phone'   => sanitize_text_field( $input['phone'] ?? '' ),
				'email'   => sanitize_email( $input['email'] ?? '' ),
				'remote'  => esc_url_raw( $input['remote'] ?? '' ),
				'booking' => esc_url_raw( $input['booking'] ?? '' ),
			];
		},
	] );
} );

function whizzit_settings_screen() {
	$saved = (array) get_option( 'whizzit_settings', [] );
	?>
	<div class="wrap">
		<h1>WhizzIT settings</h1>
		<p>Used across the whole site. Leave a field empty to use the value shown.</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'whizzit_settings' ); ?>
			<table class="form-table" role="presentation">
				<?php foreach ( WHIZZIT_SETTINGS as $key => [ $label, $default, $help ] ) : ?>
					<tr>
						<th scope="row"><label for="whizzit-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
						<td>
							<input class="regular-text" id="whizzit-<?php echo esc_attr( $key ); ?>" name="whizzit_settings[<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( $saved[ $key ] ?? '' ); ?>" placeholder="<?php echo esc_attr( $default ); ?>">
							<p class="description"><?php echo esc_html( $help ); ?></p>
						</td>
					</tr>
				<?php endforeach; ?>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
