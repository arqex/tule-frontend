'use strict';

var config = require('config');

module.exports = {
	init: function(hooks){

		config.frontend = {
			path: config.path.plugins + '/tule-frontend/',
			rUrl: config.tule.baseUrl + 'r/frontend/'
		};

		hooks.addFilter('settings:get:routes:static', function(routes){
			routes.push({url: 'frontend', path: 'tule-frontend/r'});
			return routes;
		});
		/*
		hooks.addFilter('settings:get:routes:server', function(routes){
			//The splice is necessary to add the route before the default one.
			routes.splice(-1, 0,
				{route: 'post::/frontend/parseUrl', controller: '/frontend/controllers/feederController::parseUrl'}
			);
			return routes;
		});
		*/

		hooks.addFilter('settings:get:routes:client', function(routes){
			//The splice is necessary to add the route before the default one.
			routes.splice(-1, 0,
				{route: 'frontend', controller:  config.frontend.rUrl + 'controllers/settingsController.js'}
			);
			return routes;
		});

		hooks.addFilter('settings:get:navigation:items', function(items){
			items.frontend = [
				{text: 'Front End Settings', url: '/frontend'}
			];
			return items;
		});

		//Add the frontend controller
		var frontendController = require( config.frontend.path + 'controllers/frontendController' );
		hooks.addFilter( 'controller:main', function(){
			return frontendController.entry;
		});

		hooks.on( 'settings:ready', function(){
			var settings = require(config.path.modules + '/settings/settingsManager'),
				options
			;

			frontendController.init( settings );

			hooks.addFilter( 'settings:get:baseUrl', function( baseUrl ){
				if( typeof options != 'undefined' )
					return options.tuleUrl || baseUrl;

				return settings.get( 'frontend' )
					.then( function( frontendOptions ){
						options = frontendOptions;
						return options.tuleUrl || baseUrl;
					})
				;
			});

			hooks.addFilter( 'settings:get:assetsUrl', function( assetsUrl ){
				if( typeof options != 'undefined' )
					return options.assetsUrl || assetsUrl;

				return settings.get( 'frontend' )
					.then( function( frontendOptions ){
						options = frontendOptions;
						return options.assetsUrl || assetsUrl;
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