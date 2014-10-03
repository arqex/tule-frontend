var deps = [
	'jquery', 'underscore', 'backbone', 'services',

	'baseView',
	'pageController',

	'alerts',
	'events',

	'text!../templates.html',
	'css!../frontend.css'
];

define(deps, function($,_,Backbone, Services, BaseView, PageController, Alerts, Events, tplSource) {
	'use strict';

	var templates = BaseView.prototype.extractTemplates(tplSource);

	var SettingsController = BaseView.extend({
		className: 'fe-settings',
		tpl: templates.settings,
		events: {
			'click .js-save': 'onSaveSettings'
		},

		defaultOptions: {
			tuleUrl: '/',
			frontendUrl: '/website/',
			assetsUrl: '/r'
		},

		initialize: function() {
		},

		render: function() {
			var me = this;

			this.getSettings()
				.then(function( options ){
					me.$el.html( me.tpl(options) );
				})
			;

			return this;
		},

		getSettings: function() {
			var me = this,
				deferred = $.Deferred()
			;

			if( this.options )
				deferred.resolve( this.options );
			else {
				this.settings.get( 'frontend' )
					.then( function( options ){
						me.options = options ?
							_.extend({}, me.defaultOptions, options.value) :
							me.defaultOptions
						;

						deferred.resolve( me.options );
					})
					.fail( function(){
						deferred.resolve( me.defaultOptions );
					})
				;
			}

			return deferred.promise();
		},

		onSaveSettings: function( e ){
			e.preventDefault();

			this.settings.save( 'frontend', this.getInputs() )
				.then( function(){
					Alerts.add({
						message: 'The settings were saved.'
					});

					Alerts.add({
						message: 'You will need to restart the application to make the new settings work.',
						level: 'warn',
						autoclose: 0
					});
				})
				.fail( function(){
					Alerts.add({
						message: 'There was an error saving the settings',
						level: 'error'
					});
				})
			;
		}
	});

	return PageController.extend({
		title: 'Frontend Settings',
		contentView: SettingsController
	});

});