'use strict';

var config =  require('config'),
	logger = require('winston'),
	Path = require('path'),
	settings, db
;

var FrontendApp = function(){

};

FrontendApp.prototype = {

	themeStaticUrl: '/theme',

	init: function( hooksObject ) {
		settings = config.require('settings');
		db = config.require('qdb');

		this.theme = {};

		this.hooks = hooksObject;

		this.refreshTheme();
	},

	route: function( req, res ) {
		var theme = this.getCurrentTheme();

		if( this.checkStaticUrl( req, res ) )
			return;

		theme.route( req, res );
	},

	checkStaticUrl: function( req, res ){
		var staticPath = this.theme.staticPath;
		if( !staticPath )
			return false;

		if( req.url.slice(0, this.themeStaticUrl.length) == this.themeStaticUrl ) {
			res.sendfile( Path.join( staticPath, req.url.slice( this.themeStaticUrl.length ) ), function(err){
				if(err)
					res.send(404);
			});
			return true;
		}
		return false;
	},

	getCurrentTheme: function(){
		this.refreshTheme();
		return this.theme.controller;
	},

	refreshTheme: function() {
		var me = this;

		return settings.get('frontend')
			.then( function( feOptions ){
				var theme = DefaultTheme,
					themeName = feOptions.theme
				;

				try {
					if( themeName ) {
						theme = require( Path.join( config.frontend.themesPath, themeName, themeName ) );

						if( themeName != me.currentTheme ) {
							me.theme.controller = theme;
							me.theme.name = themeName;
							if( theme.staticUrl )
								me.theme.staticPath = Path.join( config.frontend.themesPath, themeName, theme.staticUrl);
							else
								me.theme.staticPath = '';

							if( me.theme.init )
								me.theme.init( me.hooks );
						}
					}
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
