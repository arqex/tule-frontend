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
		if( req.url == '/favicon.ico' )
			return res.send(404);

		Q.all([
				settings.get('baseUrl'),
				settings.get('apiUrl'),
				settings.get('assetsUrl')
			])
			.then(function(tuleUrls) {
				var isTuleUrl = false;

				tuleUrls.forEach( function( url ){
					if( url.length > 1 && url.slice( -1 ) == '/')
						url = url.slice(0, url.length - 1);

					if( req.url.slice( 0, url.length) == url )
						isTuleUrl = true;
				});

				// Tule routes
				if( isTuleUrl )
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
				result = result.then( function(){
						return Q.nfcall(fs.stat.bind(fs), themesPath + f);
					})
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


