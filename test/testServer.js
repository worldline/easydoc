var launchServer = require('../lib/easydoc');
var request = require('request');
var path = require('path');
var fixtures = path.join(__dirname, 'fixtures');
var should = require('should');
var _ = require('underscore');

var defaultOptions = {
	port:8080, 
	host:'localhost', 
	root:path.join(fixtures, 'simple')
};

var url = 'http://'+defaultOptions.host+':'+defaultOptions.port
var app = null;

// Starts a server
before(function(done){
	app = launchServer(_.extend(defaultOptions, {onStart: function(){
			done();
  	}
	}));
});

describe('server tests', function(){

  it('should index be accessible', function(done){
  	// when requesting the url
  	request.get(url, function(err, resp, body) {
  		should.not.exist(err);
  		resp.statusCode.should.equal(200);
  		done();
  	});
  });

  it('should search return results', function(done){
  	// when requesting the url
  	request.post(url+'/search', {form:{searched:'test'}}, function(err, resp, body) {
  		should.not.exist(err);
  		resp.statusCode.should.equal(200);
  		body.indexOf('No results found').should.eql(-1)
  		body.indexOf('With another testing case').should.not.eql(-1)
  		body.indexOf('# simple test').should.not.eql(-1)
  		done();
  	});
  });
})

// Gracefully close server
after(function(done){
	app.on('close', function() {
		done();
	});
	app.close();
});