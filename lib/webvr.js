/**
 * @author mrdoob / http://mrdoob.com
 * Based on @tojiro's vr-samples-utils.js
 */

var WEBVR = {

	isLatestAvailable: function () {

		console.warn( 'WEBVR: isLatestAvailable() is being deprecated. Use .isAvailable() instead.' );
		return this.isAvailable();

	},

	isAvailable: function () {

		return navigator.getVRDisplays !== undefined;

	},

	getVRDisplay: function ( onDisplay ) {

		if ( 'getVRDisplays' in navigator ) {

			navigator.getVRDisplays()
				.then( function ( displays ) {
					onDisplay( displays[ 0 ] );
				} );

		}

	},

	getMessage: function () {

		var message;

		if ( navigator.getVRDisplays ) {

			navigator.getVRDisplays().then( function ( displays ) {

				if ( displays.length === 0 ) message = 'WebVR supported, but no VRDisplays found.';

			} );

		} else {

			message = 'Your browser does not support WebVR. See <a href="http://webvr.info">webvr.info</a> for assistance.';

		}

		if ( message !== undefined ) {

			var container = document.createElement( 'div' );
			container.style.position = 'absolute';
			container.style.left = '0';
			container.style.top = '0';
			container.style.right = '0';
			container.style.zIndex = '999';
			container.align = 'center';

			var error = document.createElement( 'div' );
			error.style.fontFamily = 'sans-serif';
			error.style.fontSize = '16px';
			error.style.fontStyle = 'normal';
			error.style.lineHeight = '26px';
			error.style.backgroundColor = '#fff';
			error.style.color = '#000';
			error.style.padding = '10px 20px';
			error.style.margin = '50px';
			error.style.display = 'inline-block';
			error.innerHTML = message;
			container.appendChild( error );

			return container;

		}

	},

	getButton: function ( display, canvas ) {

		var button = document.createElement( 'button' );
		button.className = 'vr';

		if ( display ) {

			button.textContent = 'ENTER VR';
			button.onclick = function () {

				display.isPresenting ? display.exitPresent() : display.requestPresent( [ { source: canvas } ] );

			};

			window.addEventListener( 'vrdisplaypresentchange', function () {

				button.textContent = display.isPresenting ? 'EXIT VR' : 'ENTER VR';

			}, false );

		} else {

			button.textContent = 'NO VR DISPLAY';

		}

		return button;

	}

};

module.exports = WEBVR;
