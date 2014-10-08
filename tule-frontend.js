'use strict';

var config = require('config'),
	frontend = require('./frontend')
;

module.exports = {
	init: function(hooks){
		var DIR = '/tule-frontend/';
		config.frontend = {
			path: config.path.plugins + DIR,
			themesPath: config.path.plugins + DIR + 'themes/',
			rUrl: config.tule.baseUrl + 'r/frontend/'
		};

		hooks.addFilter('settings:get:routes:static', function(routes){
			routes.push({url: 'frontend', path: 'tule-frontend/r'});
			return routes;
		});


		hooks.addFilter('settings:get:routes:server', function(routes){
			//The splice is necessary to add the route before the default one.
			routes.splice(-1, 0,
				{route: 'get::/frontend/getThemes', controller: '/tule-frontend/actions/frontendActions::getThemes'}
			);
			return routes;
		});

		hooks.addFilter('settings:get:routes:client', function(routes){
			//The splice is necessary to add the route before the default one.
			routes.splice(-1, 0,
				{route: 'frontend', controller:  config.frontend.rUrl + 'controllers/settingsController.js'}
			);
			return routes;
		});

		hooks.addFilter('settings:get:navigation:items', function(items){
			items.frontend = [
				{text: 'Front End Settings', url: 'frontend'}
			];
			return items;
		});

		//Add the frontend controller
		var frontendController = require( config.frontend.path + 'actions/frontendActions' );
		hooks.addFilter( 'controller:main', function(){
			return frontendController.entry;
		});

		hooks.on( 'settings:ready', function(){
			var settings = require(config.path.modules + '/settings/settingsManager'),
				options
			;

			frontend.init();
			frontendController.init( settings );

			hooks.addFilter( 'settings:get:baseUrl', function( baseUrl ){
				if( typeof options != 'undefined' )
					return options.tuleUrl || baseUrl;

				return settings.get( 'frontend' )
					.then( function( frontendOptions ){
						options = frontendOptions;
						var url = options.tuleUrl || baseUrl;

						// Remove trailing slash
						if(url[url.length -1] == '/')
							url = url.slice(0, url.length -1);
						return url;
					})
				;
			});

			hooks.addFilter( 'settings:get:assetsUrl', function( assetsUrl ){
				if( typeof options != 'undefined' )
					return options.assetsUrl || assetsUrl;

				return settings.get( 'frontend' )
					.then( function( frontendOptions ){
						options = frontendOptions;
						var url = options.assetsUrl || assetsUrl;

						// Remove trailing slash
						if(url[url.length -1] == '/')
							url = url.slice(0, url.length -1);
						return url;
					})
				;
			});

		});

		/*
		hooks.addFilter('settings:get:frontend:observers', function( observers ){
			observers.push('../frontend/frontendObserver');
			return observers;
		});
		*/
	}
};