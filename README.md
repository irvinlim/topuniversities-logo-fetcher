# topuniversities.com University Logo Fetcher

This tool fetches university logos from [topuniversities.com](http://www.topuniversities.com), in the highest resolution possible that it can find. There are 230 universities listed with logos. The images will be saved locally.

## How it works

Based on a JSON file that is publicly available [here](http://www.topuniversities.com/sites/default/files/qs-custom-rankings/299926.txt), we are able to find URLs for some university logos available on their website. However, most of these logos are in small resolution (48x48), whilst the main site often has much higher resolution ones. Hence, by observing common patterns in the logo URLs, we can attempt to find higher resolution logos simply by changing the URL.

We perform a batch download for the logo images since they disable hotlinking to their server. The images can be hosted using your own service for your own projects.

## Configuration

Configure the constants located right at the top of `imagefetcher.json`. They should be self-explanatory.

## Limitations

We have to spoof HTTP headers to pretend to be making the `wget` call using a browser, in order to get the image file, as they seem to have disabled hotlinking. 

Also, the server probably limits the number of calls that can be made to the server, as I could only download 50 images per minute. Tweak the values accordingly for your own use.