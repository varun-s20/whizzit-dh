<?php
/**
 * The Google rating and review count, kept current.
 *
 * The design prints the figures inside <span data-g="rating"> and
 * <span data-g="count"> (G_RATING / G_COUNT in _build/site.mjs). Once a day
 * this asks Google's Places API (New) for the business's current rating and
 * review count and swaps them in as pages are drawn. If Google can't be
 * reached, the last figures it gave stay on the page; until the first
 * successful check, the figures in the design stay.
 *
 * Needs a Google Places API key (Settings → WhizzIT). The business listing is
 * found by name the first time; the match is shown on the settings screen, and
 * a Place ID can be entered there if it picked the wrong one. One request a
 * day sits well inside Google's free monthly allowance.
 *
 * @package WhizzIT
 */

defined( 'ABSPATH' ) || exit;

// What the design prints: the swap only changes the page when Google differs.
const WHIZZIT_GOOGLE_PRINTED = [ 'rating' => '5.0', 'count' => 16 ];
// How the listing is found when no Place ID is set.
const WHIZZIT_GOOGLE_SEARCH = 'WhizzIT IT support';

function whizzit_google_reviews() {
	$saved = get_option( 'whizzit_google_reviews' );
	return is_array( $saved ) ? $saved : [];
}

/** Reads Google's error message out of a failed request, or '' if it worked. */
function whizzit_google_error( $response ) {
	if ( is_wp_error( $response ) ) {
		return $response->get_error_message();
	}
	$code = (int) wp_remote_retrieve_response_code( $response );
	if ( 200 === $code ) {
		return '';
	}
	$body = json_decode( (string) wp_remote_retrieve_body( $response ), true );
	return "Google replied {$code}: " . ( $body['error']['message'] ?? 'no details' );
}

/** Asks Google for the current figures; keeps the last good ones on failure. */
function whizzit_google_reviews_refresh() {
	$state            = whizzit_google_reviews();
	$state['checked'] = time();
	$fail             = function ( $message ) use ( &$state ) {
		$state['error'] = $message;
		update_option( 'whizzit_google_reviews', $state, false );
		return $state;
	};

	$key = whizzit_setting( 'places_key' );
	if ( '' === $key ) {
		return $fail( 'No Google Places API key is set.' );
	}

	$place = whizzit_setting( 'place_id' );
	if ( '' === $place ) {
		$place = (string) ( $state['found_id'] ?? '' );
	}
	if ( '' === $place ) {
		$search = wp_remote_post( 'https://places.googleapis.com/v1/places:searchText', [
			'timeout' => 10,
			'headers' => [
				'Content-Type'     => 'application/json',
				'X-Goog-Api-Key'   => $key,
				'X-Goog-FieldMask' => 'places.id',
			],
			'body'    => wp_json_encode( [ 'textQuery' => WHIZZIT_GOOGLE_SEARCH, 'regionCode' => 'GB' ] ),
		] );
		$error = whizzit_google_error( $search );
		if ( $error ) {
			return $fail( $error );
		}
		$found = json_decode( (string) wp_remote_retrieve_body( $search ), true );
		$place = (string) ( $found['places'][0]['id'] ?? '' );
		if ( '' === $place ) {
			return $fail( 'Google found no listing for "' . WHIZZIT_GOOGLE_SEARCH . '". Enter the Place ID in Settings → WhizzIT.' );
		}
		$state['found_id'] = $place;
	}

	$details = wp_remote_get( 'https://places.googleapis.com/v1/places/' . rawurlencode( $place ), [
		'timeout' => 10,
		'headers' => [
			'X-Goog-Api-Key'   => $key,
			'X-Goog-FieldMask' => 'displayName,formattedAddress,rating,userRatingCount',
		],
	] );
	$error = whizzit_google_error( $details );
	if ( $error ) {
		return $fail( $error );
	}
	$data = json_decode( (string) wp_remote_retrieve_body( $details ), true );
	if ( ! isset( $data['rating'], $data['userRatingCount'] ) ) {
		return $fail( 'Google has no rating for this listing. Check the listing shown below is the right one.' );
	}

	$before             = [ $state['rating'] ?? null, $state['count'] ?? null ];
	$state['rating']    = number_format( (float) $data['rating'], 1 );
	$state['count']     = (int) $data['userRatingCount'];
	$state['place_id']  = $place;
	$state['listing']   = trim( ( $data['displayName']['text'] ?? '' ) . ', ' . ( $data['formattedAddress'] ?? '' ), ', ' );
	$state['updated']   = time();
	$state['error']     = '';
	update_option( 'whizzit_google_reviews', $state, false );

	// New figures: clear the page cache so they show straight away.
	if ( [ $state['rating'], $state['count'] ] !== $before ) {
		do_action( 'litespeed_purge_all' );
	}
	return $state;
}

/** Puts the latest figures into generated markup (called by whizzit_apply_settings). */
function whizzit_apply_google_reviews( $html ) {
	$g = whizzit_google_reviews();
	if ( empty( $g['rating'] ) || empty( $g['count'] ) ) {
		return $html;
	}
	$html = preg_replace( '#(<span data-g="count">)\d+(</span>)#', '${1}' . (int) $g['count'] . '${2}', (string) $html );
	$html = preg_replace( '#(<span data-g="rating">)[\d.]+(</span>)#', '${1}' . esc_html( $g['rating'] ) . '${2}', $html );
	if ( WHIZZIT_GOOGLE_PRINTED['rating'] !== $g['rating'] ) {
		$html = str_replace( 'Rated ' . WHIZZIT_GOOGLE_PRINTED['rating'] . ' out of 5', 'Rated ' . $g['rating'] . ' out of 5', $html );
	}
	return $html;
}

/* ---------- When to check ---------- */
add_action( 'init', function () {
	if ( ! wp_next_scheduled( 'whizzit_google_reviews_refresh' ) ) {
		wp_schedule_event( time() + 5 * MINUTE_IN_SECONDS, 'daily', 'whizzit_google_reviews_refresh' );
	}
} );
add_action( 'whizzit_google_reviews_refresh', 'whizzit_google_reviews_refresh' );

// Straight away when the key or the Place ID is saved.
add_action( 'update_option_whizzit_settings', function ( $old, $new ) {
	$old = (array) $old;
	$new = (array) $new;
	if ( ( $old['places_key'] ?? '' ) !== ( $new['places_key'] ?? '' ) || ( $old['place_id'] ?? '' ) !== ( $new['place_id'] ?? '' ) ) {
		$state = whizzit_google_reviews();
		unset( $state['found_id'] );
		update_option( 'whizzit_google_reviews', $state, false );
		whizzit_google_reviews_refresh();
	}
}, 10, 2 );
add_action( 'add_option_whizzit_settings', function () {
	whizzit_google_reviews_refresh();
} );

// The "Check now" link on the settings screen.
add_action( 'admin_post_whizzit_google_refresh', function () {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Not allowed.' );
	}
	check_admin_referer( 'whizzit_google_refresh' );
	whizzit_google_reviews_refresh();
	wp_safe_redirect( admin_url( 'options-general.php?page=whizzit-settings' ) );
	exit;
} );

/* ---------- Status on Settings → WhizzIT ---------- */
add_action( 'whizzit_settings_after', function () {
	$g     = whizzit_google_reviews();
	$check = wp_nonce_url( admin_url( 'admin-post.php?action=whizzit_google_refresh' ), 'whizzit_google_refresh' );
	echo '<h2>Google reviews</h2><p>';
	if ( ! empty( $g['updated'] ) ) {
		echo 'Showing <strong>' . esc_html( $g['rating'] ) . ' from ' . (int) $g['count'] . ' Google reviews</strong>, last updated ' . esc_html( wp_date( 'j M Y, H:i', (int) $g['updated'] ) ) . '.';
		if ( ! empty( $g['listing'] ) ) {
			echo '<br>Listing: ' . esc_html( $g['listing'] ) . ' <code>' . esc_html( $g['place_id'] ?? '' ) . '</code>';
		}
	} else {
		echo 'Showing the figures in the design (' . esc_html( WHIZZIT_GOOGLE_PRINTED['rating'] ) . ' from ' . (int) WHIZZIT_GOOGLE_PRINTED['count'] . ' reviews) until Google has been checked.';
	}
	echo '</p>';
	if ( ! empty( $g['error'] ) ) {
		echo '<div class="notice notice-error inline"><p>Last check (' . esc_html( wp_date( 'j M Y, H:i', (int) ( $g['checked'] ?? time() ) ) ) . ') failed: <code>' . esc_html( $g['error'] ) . '</code></p></div>';
	}
	echo '<p><a class="button" href="' . esc_url( $check ) . '">Check now</a></p>';
} );
