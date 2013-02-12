var pagedownloader = require('./pagedownloader');




// providing only the url:
pagedownloader.download("https://github.com/", __dirname + '/github1', function (err, res){
	if(err) return console.log(err.stack);

	console.log(res);
});

// without callback
pagedownloader.download("https://github.com/", __dirname + '/github2');






// providing the content:
pagedownloader.download("https://www.google.com/", '<html><img src="images/srpr/logo3w.png" /></html>',  __dirname + '/google1', function (err, res){
	if(err) return console.log(err);

	console.log(res);
});

// without callback:
pagedownloader.download("https://www.google.com/", '<html><img src="images/srpr/logo3w.png" /></html>',  __dirname + '/google2');
