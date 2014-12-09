'use strict';

var config = require('config'),
	frontend = require('./frontend'),
	logger = require('winston'),
	express = require('express')
;

var settings, db;

module.exports = {
	init: function(hooks){
		var DIR = '/tule-frontend/';

		//load config file
		config.load('frontend');

		if( !config.frontend ) {
			config.frontend = {
				path: config.path.plugins + DIR,
				themesPath: config.path.app + '/themes/',
				rUrl: config.tule.baseUrl + 'r/frontend/',
				pageCollection: 'pages'
			};
		}

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
			var options;

			// Initialize db variables
			settings = config.require( 'settings' );
			db = config.require( 'qdb' );

			frontend.init( hooks );
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

			// Check pages are installed
			checkPageCollection();

		});

		// Enable gzip
		try {
			hooks.addFilter( 'middleware', -20, function( handlers ){
				handlers.unshift( {name: 'gzip', handler: express.compress()} );
				return handlers;
			});
		}
		catch( e ){
			logger.error( e.stack );
		}
	}
};


var checkPageCollection = function() {
	var collectionName = 'collection_' + config.frontend.pageCollection;


	settings.get( collectionName )
		.then( function( collectionSetting ){
			if( collectionSetting ) {

				// Collection exists, all ok
				return;
			}

			// Page collection creation
			var settingsDb = config.require( 'db' ).getInstance('settings');

			settingsDb.collection( config.tule.settingsCollection ).save(
				{
					name: collectionName,
					collectionName: config.frontend.pageCollection,
					propertyDefinitions:[
						{key: 'title', label: 'Title', datatype: {id: 'string'}},
						{key: 'slug', label: 'Slug', datatype: {id: 'string'}},
						{key: 'content', label: 'Content', datatype: {id: 'html'}},
						{key: 'mood', label: 'Mood', datatype: {id: 'select', options: {
							selectOptions: [
								{ value: 'happy', label: 'Happy' },
								{ value: 'smile', label: 'Smile' },
								{ value: 'surprise', label: 'Surprise' },
								{ value: 'doubt', label: 'Doubt' },
								{ value: 'suspicious', label: 'Suspicious' },
								{ value: 'mad', label: 'Mad' }
							]
						}}},
						{key: 'published', label: 'Published', datatype: {id: 'bool'}}
					],
					headerFields: [ 'title' ],
					mandatoryProperties: [ 'title', 'slug', 'content', 'mood', 'published' ],
					customProperties: false
				},
				function( err ){
					if( err )
						logger.error( new Error('Could not create the page collection settings.') );
					else
						logger.debug( 'Page collection settings created.' );
				}
			);
		})
	;

	// Creates users collection if it doesn't exist
	db().createCollection( config.frontend.pageCollection )
		.then( function(){
			logger.debug( 'Page collection created' );
		})
	;
};