/*
Copyright (c) 2013 Sam Decrock <sam.decrock@gmail.com>

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var fs = require('fs');
var url = require('url');
var path = require('path');
var httpreq = require('httpreq');
var async = require('async');
var Step = require('step');

/**
 * (url, [content,] directory [, callback])
 */
exports.download = function(arg1, arg2, arg3, arg4){
	if( arguments.length == 2 ){
		// (url, directory)
		downloadWithoutContentProvided(arg1, arg2, null);
	}

	if( arguments.length == 3 ){
		if(typeof(arg3)==="function"){
			// (url, directory, callback)
			downloadWithoutContentProvided(arg1, arg2, arg3);
		}else{
			// (url, content, directory)
			downloadWithContentProvided(arg1, arg2, arg3, null);
		}
	}

	if( arguments.length == 4 ){
		// (url, content, directory, callback)
		downloadWithContentProvided(arg1, arg2, arg3, arg4)
	}
}

function downloadWithoutContentProvided(url, directory, callback){
	httpreq.get(url, function (err, res){
		if(err && callback && typeof callback === "function") return callback(err);

		download({
			baseurl: url,
			content: res.body,
			directory: directory
		}, callback);
	});
}

function downloadWithContentProvided(url, content, directory, callback){
	download({
		baseurl: url,
		content: content,
		directory: directory
	}, callback);
}



function download(o, callback){
	var directory = path.normalize(o.directory);
	var newContent;

	var returnObject = {
		index: "",
		files: {
			relative: [],
			absolute: []
		}
	};

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

			// prepare the new content:
			newContent = o.content;

			// get all tags with a src attribute:
			var tags = o.content.match(/<.+?src=[\"'].+?[\"'].+?>/g);

			// get all tags with a css file
			var tags2 = o.content.match(/<.+?href=[\"'].+?\.css[\"'].+?>/g);

			tags = tags.concat(tags2);
			// console.log("tags", tags);

			if(!tags || !tags.length) return this(); // there are no tags: go to the next Step function

			async.forEach(tags, function (tag, eachDone){
				// get the content from src=""/href="":
				var src = tag.match(/src=[\"'](.+?)[\"']/) ? tag.match(/src=[\"'](.+?)[\"']/)[1] : tag.match(/href=[\"'](.+?\.css)[\"']/)[1];
				// get the absolute url
				var absoluteUrl = url.resolve(o.baseurl, src);

				// create a local version of that file
				// use the epoch time to create a unique filename
				var localSrc = (new Date()).getTime() + "." + path.basename(absoluteUrl).replace(/\?.*$/, "");

				// local destination for that file:
				var localSrcPath = path.resolve(directory, localSrc);

				// download it:
				httpreq.get(absoluteUrl, {binary: true}, function (err, res){
					if(err) return eachDone(err);

					fs.writeFile(localSrcPath, res.body, function (err) {
						if(err) return eachDone(err);

						// replace it, creating a new tag:
						var newTag = tag.replace(src, localSrc);

						// replace that tag in the content:
						newContent = newContent.replace(tag, newTag);

						// store file in returnobject:
						returnObject.files.relative.push(localSrc);
						returnObject.files.absolute.push(localSrcPath);

						eachDone(null);
					});
				});
			}, this);
		},

		function (err){
			if(err) throw err;

			var indexfile = path.resolve(directory,'index.html')

			returnObject.index = indexfile;

			fs.writeFile(indexfile, newContent, this);
		},

		function (err){
			if(callback && typeof callback === "function"){
				if(err)
					callback(err);
				else
					callback(null, returnObject);

			}
		}

	);
}
