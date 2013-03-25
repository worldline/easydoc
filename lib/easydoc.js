var express = require('express');
var fs = require('fs');
var http = require('http');
var util = require('util');
var md = require("node-markdown").Markdown;
var pathUtils = require('path');
var mu = require('mu2');
var os = require('os');
var exec = require('child_process').exec;
var _ = require('underscore');

module.exports = function (options) {

	var env = process.env.NODE_ENV || 'dev';

	var ext = /\.m(ar)?k?d(own)?$/;

	var assets = pathUtils.join(options.root, '_assets');

	// initialise option variables
	options.variables = options.variables || {}

	// synchronously checks the page template existences and exit if not present.
	var pageTemplate = pathUtils.join(assets, 'page.tpl');
	var searchTemplate = pathUtils.join(assets, 'search.tpl');

	fs.exists(pageTemplate, function(exists) {
		if(!exists) {
			console.error('No page.tpl template found inside the root folder. Please provide one');
			process.exit(1);
		}
		fs.exists(searchTemplate, function(exists) {
			if(!exists) {
				console.error('No search.tpl template found inside the root folder. Please provide one');
				process.exit(1);
			}
		});
	});

	// watch changes inside root folder to update summary.
	fs.watch(options.root, function(event) {
		if (event === 'change') {
			makeSummary();
		}
	});

	// Summary of available pages, ordered by rank.
	// For each page, contains an object with attirbutes:
	// - path [String] relative path to file, used for url matching
	// - title [String] friendly title for this page
	// - subtitle [String] an optionnal page subtitle
	var summary = [];

	// Displays an HTTP error response. If an error is provided, the error is 
	// displayed with a 500 error code, otherwise it's a empty 404 error.
	// 
	// @param res [Object] Http response
	// @param err [String] Error message. Facultative.
	function errorPage(res, err) {
		if (err) {
			res.send(err, {'Content-Type': 'text/plain'}, 500);
		} else {
			res.send(404);
		}
	}

	// List the different file inside the root folder and compute an ordered summary
	// (stored in summary variable)
	//
	// @param callback [Function] A completion callback function invoked with arguments.
	// @option callback err [String] an error string or null if no error occured
	function makeSummary(callback) {
		callback = callback || function() {};

		// read folder's content
		fs.readdir(options.root, function(err, files) {
			if (err) {
				// cannot read the folder. Exit.
				return callback(err, []);
			}

			// sort files by natural order
			summary = _.chain(files).without('_assets').map(function(file) {
				// get file metadatas inside the file
				fs.readFile(pathUtils.join(options.root, file), function (err, content) {
					analyzed--;
					if (!err) {
						content = content.toString().trim();
						// metas are here !
						if (/^---\r?\n(.*\r?\n)+---\r?\n/.test(content)) {
							// directly modify the summary object
							var meta = _.find(summary, function(val) {return val.path === file;});
							// a meta per line
							var lines = content.substring(3, content.indexOf('---', 3)).split('\n');
							for (var i=0, length = lines.length; i < length; i++) {
								var sep = lines[i].indexOf(':');
								if(sep === -1) {
									continue;
								}
								// first key, then value
								meta[lines[i].substring(0,sep).trim()] = lines[i].substring(sep+1).trim()
							}
							// parse rank if necessary
							meta.rank = parseInt(meta.rank);
						}
					}
					if (analyzed === 0) {
						// sort summary and end.
						summary = _.sortBy(summary, 'rank');
						callback();
					}
				});

				return  {
					path: file,
					// get a friendly name
					// for now, use the file name as title. Later it can be overriden by metas.
					title: file.replace(/\..*$/, '').replace(/^.*__/,''),
					rank: 0
				}
			}).value();
			
			var analyzed = summary.length;
			if (analyzed === 0) {
				callback();
			}
		});
	}

	// Performs a local-drive search by executing an os-specific command.
	// Uses grep on linux, and findstr on windaube.
	// 
	// @param callback [Function] A callback function that will received following arguments:
	// @option callback err [String] an error if somthing goes wrong, null otherwise
	// @option callback results [Array] an array (that may be empty) containing object with the following properties
	// - path [String] file path, relative to root folder.
	// - hits [Array] array of search occurence (strings). 
	function search(searched, callback) {
		var root = pathUtils.resolve(options.root);
		// search command is platform dependant: use grep on linux, and findstr on windaube.
		var command = os.platform() === 'win32' ? 
			'findstr /spin /c:"'+searched+'" '+ pathUtils.join(root, '*.*') :
			'grep -rin "'+searched+'" '+root;

		// exec the command line.
		exec(command, function (err, stdout, stderr) {
			if (err) {
				// a 1 error code means no results.
				if (err.code === 1) {
					err = null;
				}
				return callback(err, []);
			}
			// each line an occurence.
			var lines = stdout.toString().split(root);
		  // remove files that are not markdown.
		  lines = _.filter(lines, function(val) {
		  	return val.trim().length > 0;
		  });
	    // regroups by files
	    var grouped = {};
	    for(var i = 0; i < lines.length; i++) {
	    	var numStart = lines[i].indexOf(':');
	    	var numEnd = lines[i].indexOf(':', numStart+1);
	    	
	    	// remove leading \
	    	var fileName = lines[i].substring(1, numStart);
	    	// ignore assets files
	    	if (/^_assets/.test(fileName)) {
	    		continue
	    	}
	    	if (!(fileName in grouped)) {
	    		grouped[fileName] = [];
	    	}
	    	grouped[fileName].push({hit:lines[i].substring(numEnd+1).replace(new RegExp(searched, 'gi'), '<b>$&</b>')});
	    }
	    // sort by relevance
	    var files = [];
	    for(var key in grouped) {
	    	files.push({
	    		path: key, 
	    		hits: grouped[key]
	    	});
	    }
	    callback(null, files.sort(function(a, b) {
	    	return b.hits.length - a.hits.length;
	    }));
	  });
	}

	// Read on the hard-drive the requested file,.
	// If it's a markdown file, interpret it, and insert it into a mustache template.
	// Otherwise, return the existing static file.
	// 
	// The hole thing is returned into the http response.
	// 
	// The template is only once compiled unless the --no-cache argument is specified
	//
	// @param path [String] relative path to the displayed page
	// @param res [Object] the HTTP response used to display the page.
	function displayPage(path, res) {
			
		function process(path, res) {
			// check the extension
			if (pathUtils.extname(path).match(ext)) {
				// in dev mode, clear cache immediately.
				if (!options.cache) {
					mu.clearCache(pageTemplate);
					mu.clearCache(path);
				}

				// make path relative to use it as file key
				var key = path.replace(options.root+pathUtils.sep, '');
				var idx = summary.indexOf(_.find(summary, function(val) { return val.path === key; }));
				var content = [];

				// for markdown, firest interpret as mustache 
				var values = _.extend({}, summary[idx], options.variables)
				mu.compileAndRender(path, values).on('error', function(err) {
					// cannot read the file. Exit.
					console.error('Cannot read file '+path+': '+err);
					return errorPage(res, err);
				}).on('data', function(chunck) {
					content[content.length] = chunck.toString();
				}).on('end', function() {
					// Transform markdown to html, after removing metas
					content = content.join('');
					if (/^---\r?\n(.*\r?\n)+---\r?\n/.test(content)) {
						content = content.substring(content.indexOf('---', 3));
					}
					// send response to client, after rendering the asset content into the template.
					util.pump(mu.compileAndRender(pageTemplate, _.extend(values, {
						content: md(content),
						pages: _.map(summary, function(val, i) {
							val.current = function() {
								return i === idx;
							};
							return val;
						})
					})), res)
				});
			} else {
				// serve static content with a stream reader.
				var stream = fs.createReadStream(path);
				stream.pipe(res);
			}
		}

		fs.exists(path, function(exists) {
			if(!exists) {
				// if page does not exists, try to get an env specific page.
        var envpath = path.replace(new RegExp(pathUtils.basename(path)+'$'), env+'.$&');
        console.log(envpath)
        fs.exists(envpath, function(exists) {
          if (!exists) {
            console.error(path+' does not exists !');
            return errorPage(res);
          }
          return process(envpath, res);
        });
      } else {
        return process(path, res);
      }
    });
	}

	// the http server that will serve static content.
	var app = express();

	app.configure(function(){
		app.use(express.methodOverride());
		app.use(express.bodyParser());
	});

	// try to display the index.md page.
	app.get('/', function(req, res) {
		if (summary.length === 0) {
			return errorPage(res);
		}
		displayPage(pathUtils.join(options.root, summary[0].path), res);
	});

	// displays the page corresponding to the url path.
	app.get('/*', function(req, res){
		// check the file path existence.
		displayPage(pathUtils.join(options.root, decodeURIComponent(req.url)), res);
	});

	// performs the search on files.
	// the searched query is contained in the "searched" body parameter.
	app.post('/search', function(req, res){
		var searched = req.param('searched');
		// do not search blank or empty strings.
		if (!searched || searched.trim().length === 0) {
			return res.redirect('/');
		}
		
		// performs a search on files.
		search(searched, function(err, results) {
			if (err) {
				console.error('Cannot perform search of '+ searched +': '+err);
				return errorPage(res, err);
			}
			// in dev mode, clear cache immediately.
			if (!options.cache) {
				mu.clearCache(searchTemplate);
			}
			// return http response
			util.pump(mu.compileAndRender(searchTemplate, {
				title: options.title,
				results: _.map(results, function(result) {
					return _.extend({numHits: result.hits.length}, result, _.find(summary, function(val) {return val.path === result.path}));
				}),
				searched: searched,
				singleResult: results.length === 1,
				noResult: results.length === 0,
				numResults: results.length,
				pages: summary
			}), res);
		});
	});

	var server = http.createServer(app);

	// first summary creation.
	makeSummary(function(err) {
		if (err) {
			return console.error('Failed to create pages summary: '+err);
		}
		server.listen(options.port, options.host, function(err) {
			if (err) {
				return console.error('Cannot start server on '+options.host+':'+options.port+':\n'+err);
			}
			if (!options.cache) {
				console.warn('<WARN> No template cache: do not use in production !!');
			}
			console.info('Server started on '+options.host+':'+options.port+' to serve root folder "'+options.root+'"');
			if (options.onStart instanceof Function) {
				options.onStart();
			}
		});
	});

	return server;
};