node-download-complete-page
===========================

Node module to download a complete html webpage.

Downloads a complete a webpage, including all resources referenced by __src__ tags.

## Install

You can install __pagedownloader__ using the Node Package Manager (npm):

    npm install pagedownloader

## How to use

### pagedownloader.download(url, [content], directory, [callback]);

__Arguments__
 - url: The baseurl where the main page you want to download resides.
 - content: (optional) The content of page. If you pass it, that content is used. Otherwise, the __url__ parameter is used to get its content using a HTTP GET request.
 - directory: the directory on your local machine to store the page.
 - callback(err, res): (optional) A callback function which is called when the download is complete. __res__ contains the location of the downloaded files.

__Example__

```js
var pagedownloader = require('pagedownloader');

pagedownloader.download("https://github.com/", __dirname + '/github1', function (err, res){
    if(err) return console.log(err.stack);

    console.log(res);
});

// without callback
pagedownloader.download("https://github.com/", __dirname + '/github2');
```


__Example with the html content already provided__

```js
var pagedownloader = require('pagedownloader');

pagedownloader.download("https://www.google.com/", '<html><img src="images/srpr/logo3w.png" /></html>',  __dirname + '/google1', function (err, res){
    if(err) return console.log(err);

    console.log(res);
});

// without callback:
pagedownloader.download("https://www.google.com/", '<html><img src="images/srpr/logo3w.png" /></html>',  __dirname + '/google2');
```
