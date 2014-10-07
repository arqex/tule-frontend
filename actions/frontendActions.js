var config = require('config'),
	Q = require('q'),
	frontend = require( config.frontend.path + 'frontend'),
	fs = require('fs'),
	settings, tuleController
;


var frontendController = function( req, res ) {
	frontend.route( req, res );
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

				// Protected routes are tule and api ones
				if( req.url.slice( 0, tuleUrl.length ) == tuleUrl || req.url.slice( 0, apiUrl.length ) == apiUrl )
					return tuleController( req, res );

				frontendController( req, res );
			})
		;
	},

	frontend: frontendController,

	getThemes: function( req, res ){
		var themesPath = config.frontend.themesPath;
		fs.readdir( themesPath, function( err, files ){
			if(err) {
				console.log( err.stack );
				res.send(400, "Unexpected error reading themes dir");
			}

			var result = Q(1),
				themes = []
			;

			files.forEach( function( f ){
				result = result.then( Q.nfcall(fs.stat.bind(fs), themesPath + f))
					.then( function(stat){
						if( stat.isDirectory() )
							themes.push( f );
					})
				;
			});

			result
				.then( function(){
					return res.json({themes: themes});
				})
				.catch( function( err ){
					console.log( err.stack );
					res.send(400, "Unexpected error reading themes dir");
				})
			;
		});
	}
};


