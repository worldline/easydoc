var launchServer = require('../lib/easydoc');
var request = require('request');
var path = require('path');
var fixtures = path.join(__dirname, 'fixtures');
var expect = require('chai').expect;
var _ = require('underscore');

var defaultOptions = {
	port:8080, 
	host:'localhost', 
	root:path.join(fixtures, 'simple'),
	title: "testTitle"
};

var url = 'http://'+defaultOptions.host+':'+defaultOptions.port;
var app = null;

// For environnement dependant variables
process.env.NODE_ENV = 'test';

describe('server tests', function(){

  describe('given an example server', function() {

    // Starts a server
    before(function(done){
      app = launchServer(_.extend(defaultOptions, {
        onStart: done,
        variables: {
          custom: 'hou yeah'
        }
      }));
    });

    // Gracefully close server
    after(function(done){
      app.close();
      done()
    });

    it('should index be accessible', function(done){
      // when requesting the url
      request.get(url, function(err, resp, body) {
        expect(err).to.not.exist;
        expect(resp.statusCode).to.equal(200);
        // check title replacement
        expect(body).to.include('<title>Welcome</title>');
        // check all pages detection
        expect(body).to.include('<li class="active"><a href="index.md">Welcome</a></li>');
        expect(body).to.include('<li><a href="another.md">another</a></li>');
        expect(body).to.include('<li><a href="file.md">file</a></li>');
        // meta replacement
        expect(body).to.include('Yes !');
        // check meta removal
        expect(body).not.to.include('title:');
        // check order
        expect(body.indexOf('index.md')).to.be.below(body.indexOf('another.md'), 'Welcome not above another');
        expect(body.indexOf('another.md')).to.be.below(body.indexOf('file.md'), 'another not above file');
        done();
      });
    });

    it('should platform dependent page be accessible', function(done){
      // when requesting the url
      request.get(url+'/file.md', function(err, resp, body) {
        expect(err).to.not.exist;
        expect(resp.statusCode).to.equal(200);
        // check that page is served
        expect(body).to.include('<h1>a platform dependent file</h1>');
        expect(body).to.include('hou yeah');
        done();
      });
    });

    it('should search return results', function(done){
      // when requesting the url
      request.post(url+'/search', {form:{searched:'test'}}, function(err, resp, body) {
        expect(err).to.not.exist;
        expect(resp.statusCode).to.equal(200);
        expect(body).to.not.include('No results found');
        expect(body).to.include('With another &lt;b&gt;test&lt;/b&gt;ing case');
        expect(body).to.include('# simple &lt;b&gt;test&lt;/b&gt;');
        done();
      });
    });

  });

  describe('given an empty content', function() {

    // Starts a server
    before(function(done){
      defaultOptions.root = path.join(fixtures, 'empty');
      app = launchServer(_.extend(defaultOptions, {onStart: done}));
    });

    // Gracefully close server
    after(function(done){
      app.close();
      done()
    });

    it('should an error be reported', function(done){
      // when requesting the url
      request.get(url, function(err, resp, body) {
        expect(err).to.not.exist;
        expect(resp.statusCode).to.equal(404);
        done();
      });
    });
  });

})

