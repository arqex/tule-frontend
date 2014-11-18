'use strict';

var config = require('config'),
	qdb = config.require('qdb')
;

var BcnTheme = function(){};

BcnTheme.prototype = {
	route: function( req, res ){
		res.send('Welcome to the blank theme');
	}
};

module.exports = new BcnTheme();