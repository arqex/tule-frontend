'use strict';

var config =  require('config'),
	logger = require('winston'),
	settings, db
;

var FrontendApp = function(){

};

FrontendApp.prototype = {

	init: function() {
		settings = config.require('settings');
		db = config.require('qdb');
	},

	route: function( req, res ) {
		this.getCurrentTheme().then( function( theme ){
			theme.route( req, res );
		});
	},

	getCurrentTheme: function() {
		return settings.get('fe-currentTheme')
			.then( function( themeName ){
				var theme = DefaultTheme;



				try {
					if( themeName )
						theme = require( config.frontend.themesPath + themeName );
				}
				catch( e ) {
					logger.error( e.stack );
				}

				return theme;
			})
			.catch( function( err ){
				logger.error( err.stack );
			})
		;
	}

};

var DefaultTheme = {
	route: function( req, res ) {
		res.send( 'Frontend: ' + req.url );
	}
};


module.exports = new FrontendApp();
