<?php
/**
 * The site's forms: callback, contact and the article enquiry box.
 *
 * Every form posts its fields to POST /wp-json/whizzit/v1/submit (the same
 * contract the old /api/submit.php had: FormData in, JSON out). Each
 * submission is:
 *  - dropped if the hidden "botcheck" box is ticked (only bots fill it in);
 *  - rate limited per visitor;
 *  - checked with Google reCAPTCHA v2 using the secret key (Settings → WhizzIT,
 *    or WHIZZIT_RECAPTCHA_SECRET in wp-config.php / inc/secrets.php);
 *  - saved under Form entries in wp-admin, so no enquiry is ever lost;
 *  - emailed to the address in Settings → WhizzIT (info@whizzit.co.uk), with
 *    Reply-To set to the person who filled it in.
 *
 * Mail goes through wp_mail(), so an SMTP plugin (e.g. WP Mail SMTP signed in
 * as info@whizzit.co.uk) takes over delivery without any change here. If an
 * email fails, the entry is kept, marked "Email failed", and the mail error is
 * shown to administrators in wp-admin.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

const WHIZZIT_FORM_NAMES = [
	'callback' => 'Callback request',
	'contact'  => 'Contact form',
	'inline'   => 'Article enquiry',
];

/** The reCAPTCHA secret: Settings → WhizzIT first, then the constant. */
function whizzit_recaptcha_secret() {
	$saved = trim( (string) ( ( (array) get_option( 'whizzit_settings', [] ) )['recaptcha_secret'] ?? '' ) );
	if ( '' !== $saved ) {
		return $saved;
	}
	return defined( 'WHIZZIT_RECAPTCHA_SECRET' ) ? trim( (string) WHIZZIT_RECAPTCHA_SECRET ) : '';
}

/* ---------- Form entries (wp-admin) ---------- */
add_action( 'init', function () {
	register_post_type( 'whizzit_entry', [
		'labels'          => [
			'name'          => 'Form entries',
			'singular_name' => 'Form entry',
			'menu_name'     => 'Form entries',
			'all_items'     => 'All entries',
			'edit_item'     => 'Form entry',
			'search_items'  => 'Search entries',
			'not_found'     => 'No form entries yet.',
		],
		'public'          => false,
		'show_ui'         => true,
		'show_in_menu'    => true,
		'show_in_rest'    => false,
		'menu_icon'       => 'dashicons-email-alt',
		'menu_position'   => 26,
		'supports'        => [ 'title' ],
		'capability_type' => 'post',
		'capabilities'    => [ 'create_posts' => 'do_not_allow' ],
		'map_meta_cap'    => true,
	] );
} );

const WHIZZIT_ENTRY_STATUS = [
	'sent'   => 'Emailed',
	'failed' => 'Email failed',
	'spam'   => 'Blocked as spam',
];

add_filter( 'manage_whizzit_entry_posts_columns', function () {
	return [
		'cb'             => '<input type="checkbox">',
		'title'          => 'From',
		'whizzit_form'   => 'Form',
		'whizzit_email'  => 'Email',
		'whizzit_status' => 'Status',
		'date'           => 'Received',
	];
} );

add_action( 'manage_whizzit_entry_posts_custom_column', function ( $column, $post_id ) {
	$fields = (array) get_post_meta( $post_id, '_whizzit_fields', true );
	if ( 'whizzit_form' === $column ) {
		echo esc_html( WHIZZIT_FORM_NAMES[ get_post_meta( $post_id, '_whizzit_form', true ) ] ?? 'Form' );
	} elseif ( 'whizzit_email' === $column ) {
		echo esc_html( $fields['email'] ?? '' );
	} elseif ( 'whizzit_status' === $column ) {
		$status = (string) get_post_meta( $post_id, '_whizzit_status', true );
		echo esc_html( WHIZZIT_ENTRY_STATUS[ $status ] ?? $status );
	}
}, 10, 2 );

add_action( 'add_meta_boxes_whizzit_entry', function () {
	remove_meta_box( 'submitdiv', 'whizzit_entry', 'side' );
	add_meta_box( 'whizzit_entry_details', 'Enquiry', function ( $post ) {
		$fields = (array) get_post_meta( $post->ID, '_whizzit_fields', true );
		$rows   = [
			'Form'     => WHIZZIT_FORM_NAMES[ get_post_meta( $post->ID, '_whizzit_form', true ) ] ?? '',
			'Name'     => $fields['name'] ?? '',
			'Email'    => $fields['email'] ?? '',
			'Phone'    => $fields['phone'] ?? '',
			'Company'  => $fields['company'] ?? '',
			'Message'  => $fields['message'] ?? '',
			'Page'     => get_post_meta( $post->ID, '_whizzit_page', true ),
			'Received' => get_the_date( 'j M Y, H:i', $post ),
			'Status'   => WHIZZIT_ENTRY_STATUS[ get_post_meta( $post->ID, '_whizzit_status', true ) ] ?? '',
			'Note'     => get_post_meta( $post->ID, '_whizzit_note', true ),
		];
		echo '<table class="widefat striped"><tbody>';
		foreach ( $rows as $label => $value ) {
			if ( '' === (string) $value ) {
				continue;
			}
			echo '<tr><th style="width:120px">' . esc_html( $label ) . '</th><td>' . nl2br( esc_html( (string) $value ) ) . '</td></tr>';
		}
		echo '</tbody></table>';
		if ( ! empty( $fields['email'] ) ) {
			echo '<p><a class="button button-primary" href="' . esc_url( 'mailto:' . $fields['email'] ) . '">Reply by email</a></p>';
		}
	}, 'whizzit_entry', 'normal', 'high' );
} );

/* ---------- The endpoint ---------- */
add_action( 'rest_api_init', function () {
	register_rest_route( 'whizzit/v1', '/submit', [
		'methods'             => 'POST',
		'callback'            => 'whizzit_handle_submission',
		'permission_callback' => '__return_true',
	] );
} );

function whizzit_form_reply( $success, $status = 200, $error = '' ) {
	$body = [ 'success' => $success ];
	if ( $error ) {
		$body['error'] = $error;
	}
	return new WP_REST_Response( $body, $status );
}

function whizzit_handle_submission( WP_REST_Request $request ) {
	// Only bots tick the hidden box: thank them and drop it.
	if ( '' !== (string) $request->get_param( 'botcheck' ) ) {
		return whizzit_form_reply( true );
	}

	$form   = sanitize_key( (string) $request->get_param( 'form_name' ) );
	$form   = isset( WHIZZIT_FORM_NAMES[ $form ] ) ? $form : 'contact';
	$fields = [
		'name'    => mb_substr( sanitize_text_field( (string) $request->get_param( 'name' ) ), 0, 120 ),
		'email'   => sanitize_email( (string) $request->get_param( 'email' ) ),
		'phone'   => mb_substr( sanitize_text_field( (string) $request->get_param( 'phone' ) ), 0, 40 ),
		'company' => mb_substr( sanitize_text_field( (string) $request->get_param( 'company' ) ), 0, 120 ),
		'message' => mb_substr( sanitize_textarea_field( (string) $request->get_param( 'message' ) ), 0, 5000 ),
	];
	if ( '' === $fields['name'] || ! is_email( $fields['email'] ) ) {
		return whizzit_form_reply( false, 400, 'invalid' );
	}

	// At most six sends per visitor in ten minutes.
	$ip   = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ?? '' ) );
	$key  = 'whizzit_rl_' . md5( $ip );
	$sent = (int) get_transient( $key );
	if ( $sent >= 6 ) {
		return whizzit_form_reply( false, 429, 'rate_limited' );
	}
	set_transient( $key, $sent + 1, 10 * MINUTE_IN_SECONDS );

	$page = esc_url_raw( (string) $request->get_header( 'referer' ) );

	// reCAPTCHA. A missing or rejected token is spam: kept under Form entries
	// (marked "Blocked as spam", not emailed) so nothing is lost, and the
	// visitor is asked to tick the box again. If Google itself cannot be
	// reached, the enquiry goes through rather than losing a lead.
	$secret = whizzit_recaptcha_secret();
	$note   = '';
	if ( '' === $secret ) {
		$note = 'Not checked by reCAPTCHA: no secret key is set (Settings → WhizzIT).';
	} else {
		$token = (string) $request->get_param( 'g-recaptcha-response' );
		if ( '' === $token ) {
			whizzit_save_entry( $form, $fields, $page, $ip, 'spam', 'No reCAPTCHA token was sent.' );
			return whizzit_form_reply( false, 400, 'captcha' );
		}
		$check = wp_remote_post( 'https://www.google.com/recaptcha/api/siteverify', [
			'timeout' => 8,
			'body'    => [ 'secret' => $secret, 'response' => $token, 'remoteip' => $ip ],
		] );
		if ( is_wp_error( $check ) ) {
			$note = 'reCAPTCHA could not be checked (' . $check->get_error_message() . '), so it was let through.';
		} else {
			$result = json_decode( (string) wp_remote_retrieve_body( $check ), true );
			if ( empty( $result['success'] ) ) {
				$codes = implode( ', ', (array) ( $result['error-codes'] ?? [] ) );
				whizzit_save_entry( $form, $fields, $page, $ip, 'spam', 'reCAPTCHA rejected it' . ( $codes ? " ({$codes})" : '' ) . '.' );
				// A wrong secret key is a setup problem, not spam: tell the admins.
				if ( str_contains( $codes, 'invalid-input-secret' ) ) {
					update_option( 'whizzit_forms_last_error', [ 'time' => time(), 'message' => 'Google rejected the reCAPTCHA secret key (invalid-input-secret). Check it in Settings → WhizzIT.' ], false );
				}
				return whizzit_form_reply( false, 400, 'captcha' );
			}
		}
	}

	$entry = whizzit_save_entry( $form, $fields, $page, $ip, 'sent', $note );
	$error = whizzit_send_entry_email( $form, $fields, $page );
	if ( $error ) {
		update_post_meta( $entry, '_whizzit_status', 'failed' );
		update_post_meta( $entry, '_whizzit_note', trim( $note . ' Email failed: ' . $error ) );
		update_option( 'whizzit_forms_last_error', [ 'time' => time(), 'message' => $error ], false );
	} else {
		delete_option( 'whizzit_forms_last_error' );
	}
	// The visitor's enquiry is safely stored either way.
	return whizzit_form_reply( true );
}

function whizzit_save_entry( $form, $fields, $page, $ip, $status, $note = '' ) {
	$id = wp_insert_post( [
		'post_type'   => 'whizzit_entry',
		'post_status' => 'publish',
		'post_title'  => $fields['name'] . ( $fields['company'] ? ' (' . $fields['company'] . ')' : '' ),
	] );
	if ( ! $id || is_wp_error( $id ) ) {
		return 0;
	}
	update_post_meta( $id, '_whizzit_form', $form );
	update_post_meta( $id, '_whizzit_fields', $fields );
	update_post_meta( $id, '_whizzit_page', $page );
	update_post_meta( $id, '_whizzit_ip', $ip );
	update_post_meta( $id, '_whizzit_status', $status );
	if ( $note ) {
		update_post_meta( $id, '_whizzit_note', $note );
	}
	return $id;
}

/** Sends the enquiry; returns '' on success or the mail error. */
function whizzit_send_entry_email( $form, $fields, $page ) {
	$to = whizzit_setting( 'form_to' );
	if ( ! is_email( $to ) ) {
		return "The \"Send form submissions to\" address ({$to}) is not a valid email address.";
	}
	$label = WHIZZIT_FORM_NAMES[ $form ];
	$lines = [
		"New {$label} from the website",
		'',
		'Name: ' . $fields['name'],
		'Email: ' . $fields['email'],
	];
	if ( $fields['phone'] ) {
		$lines[] = 'Phone: ' . $fields['phone'];
	}
	if ( $fields['company'] ) {
		$lines[] = 'Company: ' . $fields['company'];
	}
	if ( $fields['message'] ) {
		$lines[] = '';
		$lines[] = 'Message:';
		$lines[] = $fields['message'];
	}
	$lines[] = '';
	if ( $page ) {
		$lines[] = 'Sent from: ' . $page;
	}
	$lines[] = 'Received: ' . wp_date( 'j M Y, H:i' );
	$lines[] = 'All entries: ' . admin_url( 'edit.php?post_type=whizzit_entry' );

	$failure = '';
	$catch   = function ( $error ) use ( &$failure ) {
		$failure = $error->get_error_message();
	};
	add_action( 'wp_mail_failed', $catch );
	$ok = wp_mail(
		$to,
		"Website enquiry: {$label} from {$fields['name']}",
		implode( "\n", $lines ),
		[ 'Reply-To: ' . str_replace( [ '"', "\r", "\n" ], '', $fields['name'] ) . ' <' . $fields['email'] . '>' ]
	);
	remove_action( 'wp_mail_failed', $catch );
	if ( $ok ) {
		return '';
	}
	return $failure ?: 'wp_mail() returned false (the server did not accept the message).';
}

/* ---------- Housekeeping ----------
   Bots that skip reCAPTCHA leave "Blocked as spam" entries; those are cleared
   after 30 days. Real enquiries are never removed automatically. */
add_action( 'init', function () {
	if ( ! wp_next_scheduled( 'whizzit_forms_cleanup' ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'whizzit_forms_cleanup' );
	}
} );

add_action( 'whizzit_forms_cleanup', function () {
	$old = get_posts( [
		'post_type'      => 'whizzit_entry',
		'post_status'    => 'any',
		'posts_per_page' => 200,
		'fields'         => 'ids',
		'meta_key'       => '_whizzit_status', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- daily, small table.
		'meta_value'     => 'spam', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- daily, small table.
		'date_query'     => [ [ 'before' => '30 days ago' ] ],
	] );
	foreach ( $old as $id ) {
		wp_delete_post( $id, true );
	}
} );

/* ---------- Telling the administrators ---------- */
add_action( 'admin_notices', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$entries  = admin_url( 'edit.php?post_type=whizzit_entry' );
	$settings = admin_url( 'options-general.php?page=whizzit-settings' );
	if ( '' === whizzit_recaptcha_secret() ) {
		echo '<div class="notice notice-warning"><p><strong>WhizzIT forms:</strong> no reCAPTCHA secret key is set, so enquiries are not checked for spam. Add it in <a href="' . esc_url( $settings ) . '">Settings → WhizzIT</a>.</p></div>';
	}
	$last = get_option( 'whizzit_forms_last_error' );
	if ( is_array( $last ) && ! empty( $last['message'] ) && time() - (int) $last['time'] < 14 * DAY_IN_SECONDS ) {
		echo '<div class="notice notice-error"><p><strong>WhizzIT forms:</strong> on ' . esc_html( wp_date( 'j M Y, H:i', (int) $last['time'] ) ) . ' an enquiry email could not be sent. The error was: <code>' . esc_html( $last['message'] ) . '</code>. The enquiry itself is saved in <a href="' . esc_url( $entries ) . '">Form entries</a>.</p></div>';
	}
} );

/* ---------- Settings → WhizzIT: "Send a test email" ----------
   Lets whoever sets up the mail connection (WP Mail SMTP) see at once whether
   an enquiry email will arrive, and the exact error when it will not. */
add_action( 'whizzit_settings_after', function () {
	$to    = whizzit_setting( 'form_to' );
	$test  = wp_nonce_url( admin_url( 'admin-post.php?action=whizzit_test_email' ), 'whizzit_test_email' );
	$last  = get_transient( 'whizzit_test_email_result' );
	echo '<h2>Form emails</h2>';
	echo '<p>Every enquiry from the website forms is emailed to <strong>' . esc_html( $to ) . '</strong> and kept under <a href="' . esc_url( admin_url( 'edit.php?post_type=whizzit_entry' ) ) . '">Form entries</a>.</p>';
	if ( is_array( $last ) ) {
		$when = esc_html( wp_date( 'j M Y, H:i', (int) $last['time'] ) );
		if ( '' === $last['error'] ) {
			echo '<div class="notice notice-success inline"><p>Test email sent at ' . $when . '. Check the ' . esc_html( $to ) . ' inbox (and junk).</p></div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $when is escaped above.
		} else {
			echo '<div class="notice notice-error inline"><p>Test email failed at ' . $when . '. The error was: <code>' . esc_html( $last['error'] ) . '</code></p></div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $when is escaped above.
		}
	}
	echo '<p><a class="button" href="' . esc_url( $test ) . '">Send a test email</a></p>';
} );

add_action( 'admin_post_whizzit_test_email', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'whizzit_test_email' );
	$user  = wp_get_current_user();
	$error = whizzit_send_entry_email(
		'contact',
		[
			'name'    => 'Test from Settings → WhizzIT',
			'email'   => is_email( $user->user_email ) ? $user->user_email : whizzit_setting( 'form_to' ),
			'phone'   => '',
			'company' => '',
			'message' => 'This is a test email from the WhizzIT website. If you can read it, enquiry emails are being delivered.',
		],
		home_url( '/' )
	);
	set_transient( 'whizzit_test_email_result', [ 'time' => time(), 'error' => $error ], HOUR_IN_SECONDS );
	if ( $error ) {
		update_option( 'whizzit_forms_last_error', [ 'time' => time(), 'message' => $error ], false );
	} else {
		delete_option( 'whizzit_forms_last_error' );
	}
	wp_safe_redirect( admin_url( 'options-general.php?page=whizzit-settings' ) );
	exit;
} );
