/**
 * Scrapes university logos from topuniversities.com, and attempts to get higher-resolution images, if any.
 * Saves all images in a local folder.
 *
 * @author   Irvin Lim
 * @website  https://irvinlim.com/
 * @license  MIT
 */

// Credits to http://www.hacksparrow.com/using-node-js-to-download-files.html

/*********************
    CONFIGURE HERE
 *********************/

// Include trailing slash!
var DOWNLOAD_DIR = './images/';

// Specify a particular offset to start from (inclusive).
var START_OFFSET = 0;

// Timeout in milliseconds (ms) between batches.
var TIMEOUT = 60 * 1000;

// Number of files to download per batch.
var DOWNLOAD_BATCH_SIZE = 50;



// Dependencies
var fs = require('fs');
var url = require('url');
var http = require('http');
var exec = require('child_process').exec;

// Read input file
var json = require('./input.json');

// Counter
var counter = 0;


// Parse JSON and save images
var child = exec('mkdir -p ' + DOWNLOAD_DIR, function(err, stdout, stderr) {
  var downloadQueue = [];

  json.forEach(uni => {
    // Skip if there is no logo
    if (!uni.logo)
      return true;

    // Parse the HTML <a> tag to a URL
    var logoUrl = uni.logo.substr(10);
    logoUrl = logoUrl.substr(0, logoUrl.indexOf("\""));

    var mediumUrl = logoUrl.replace('_small', '_medium');
    var largeUrl = logoUrl.replace('_small', '_large');
    var smallUrl2 = logoUrl.replace('/default/files', '/default/files/profiles/logos');
    var mediumUrl2 = smallUrl2.replace('_small', '_medium');
    var largeUrl2 = smallUrl2.replace('_small', '_large');

    // Attempt to get higher resolution images, and saves the highest one first.
    var logoUrls = [ largeUrl, largeUrl2, mediumUrl, mediumUrl2, logoUrl ];

    // Push to download queue
    downloadQueue.push({ logoUrls, title: convertToSlug(uni.title) });
  });

  // Split the queue into 50 files per minute
  var timeoutFn = () => {
    var files = downloadQueue.splice(0, DOWNLOAD_BATCH_SIZE);

    files.forEach(file => {
      if (counter >= START_OFFSET) 
        downloadFile(file.logoUrls, file.title, counter);

      counter++;
    });

    // Set a timeout of 60 seconds for the next batch of downloads.
    var timeout = TIMEOUT;

    // If no downloads were run, call next batch immediately.
    if (counter <= START_OFFSET)
      timeout = 1;

    // Call the next batch of downloads at the specified timeout.
    if (downloadQueue.length)
      setTimeout(timeoutFn, timeout);
  };

  // Let the download begin!
  timeoutFn();
});


// Utility
function downloadFile(fileUrls, fileTitle, index) {
  var fileFound = false;

  fileUrls.forEach(fileUrl => {
    // Set filename
    var fileName = fileTitle + '.' + getExt(fileUrl);
    var file = fs.createWriteStream(DOWNLOAD_DIR + fileName);

    http.get({
      host: url.parse(fileUrl).host,
      port: 80,
      path: url.parse(fileUrl).pathname,
      headers: {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}
    }, function(res) {
      // Return if did not receive HTTP 200
      if (res.statusCode !== 200) 
        return;

      // Save file only if previously file not found.
      if (!fileFound) {
        var wget = "wget --header='User-Agent: Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11' --header='Referer: http://www.topuniversities.com/' --header='Accept-Encoding: compress, gzip' -O " + DOWNLOAD_DIR + fileName + ' ' + fileUrl;

        var child = exec(wget, function(err, stdout, stderr) {
          if (err) 
            throw err;

          console.log(index + ': ' + fileUrl + ' saved as ' + fileName);
        });
      }

      // Set flag to prevent saving of smaller resolution files.
      fileFound = true;
    });

  });
}

function getExt(filePath) {
  return filePath && filePath.split('.').slice(-1).pop();
}

function convertToSlug(Text) {
  return Text.toLowerCase().replace(/[^\w ]+/g,'').split(' ').filter(s => s.length).join('-');
}