var config = require('config'),
	Q = require('q'),
	settings, tuleController
;


var frontendController = function( req, res ) {
	res.send( 'Frontend!!!' );
};

module.exports = {
	init: function( settingsReady ) {
		tuleController = require( config.path.controllers + '/main').tule;
		settings = settingsReady;
	},

	entry: function( req, res ) {
		Q.all([
				settings.get('baseUrl'),
				settings.get('apiUrl')
			])
			.spread(function(tuleUrl, apiUrl) {

				if( tuleUrl.length > 1 && tuleUrl[tuleUrl.length - 1] == '/') {
					tuleUrl = tuleUrl.slice(0, tuleUrl.length - 1);
				}

				if( apiUrl.length > 1 && apiUrl[apiUrl.length - 1] == '/') {
					apiUrl = apiUrl.slice(0, apiUrl.length - 1);
				}

				if( req.url.slice( 0, tuleUrl.length ) == tuleUrl || req.url.slice( 0, apiUrl.length ) == apiUrl )
					return tuleController( req, res );

				frontendController( req, res );
			})
		;
	},

	frontend: frontendController
};


