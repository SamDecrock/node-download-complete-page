var httpreq = require('httpreq');
var pagedownloader = require('./pagedownloader');


var pageurl = 'https://github.com/';

httpreq.get(pageurl, function (err, res){
	if(err) return console.log(err);


	pagedownloader.download(
		{
			directory: __dirname + '/gittest',
		 	content: res.body,
		 	baseurl: pageurl
		},
		function (err, res){
			console.log("done");
		}
	);

});
