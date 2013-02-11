var fs = require('fs');
var url = require('url');
var path = require('path');
var httpreq = require('httpreq');
var cheerio = require('cheerio');
var async = require('async');
var Step = require('step');

exports.download = function(o, callback){

	var directory = path.normalize(o.directory);
	var $;

	Step(
		function (){
			// first create a directory to store all files in:
			fs.mkdir(directory, 0777, this);
		},

		function (err) {
			if(err){
				if(err.code != 'EEXIST')
					throw err;
			}
			// create a cheerio-object:
			$ = cheerio.load(o.content);

			// find all elements containing a src:
			var elements = $("[src]");


			async.forEach(elements, function (elem, eachDone){
				var realUrl = url.resolve(o.baseurl, $(elem).attr("src"));
				var localFilename = (new Date()).getTime() + "." + path.basename($(elem).attr("src"));
				var localPath = path.resolve(directory,localFilename);


				httpreq.get(realUrl, {binary: true}, function (err, res){
					if(err) return eachDone(err);

					fs.writeFile(localPath, res.body, function (err) {
						if(err) return eachDone(err);

						$(elem).attr('src', localFilename);

						eachDone(null);
					});
				});


			}, this);
		},

		function (err){
			if(err) throw err;

			fs.writeFile(path.resolve(directory,'index.html'), $.html(), this);
		},

		function (err){
			if(err) return callback(err);

			callback(null);
		}

	);
}
