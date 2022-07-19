*Original fork from https://github.com/johnvmt/node-desktop-screenshot*

# node-desktop-screenshot #
Take a screenshot of the computer on which Node is running, using platform-specific external tools included with the package

Supports Windows (win32), OSX (darwin) and Linux platforms

Windows version uses nircmd (http://nircmd.nirsoft.net)
Linux version uses scrot

## Available Options ##

- buffered: return a Buffer insted of save a file.
- multi: enable snapshot of all present displays (display current).
- quality: JPEG quality (0 to 100).
- width: use in conjunction with height, or by itself to maintain aspect ratio.
- height: use in conjunction with width, or by itself to maintain aspect ratio.
- timestamp: use timestamp (true/false) to print datetime in screenshot. default true.
- caption: an string to print previous to timestamp.
- env: environment key/value variables to run the screenshot process.

## Returns ##
A promise (you can use a callback if you want)
if you set buffered:true you get a Buffer
if you save a file then you get the path

## Examples ##

### Full resolution ###
	var screenshot = require('desktop-screenshot');
	
    screenshot("screenshot.png", function(error, complete) {
        if(error)
            console.log("Screenshot failed", error);
        else
            console.log("Screenshot succeeded");
    });
    
### Resize to 400px wide, maintain aspect ratio ###

    var screenshot = require('desktop-screenshot');

    screenshot("screenshot.png", {width: 400}, function(error, complete) {
        if(error)
            console.log("Screenshot failed", error);
        else
            console.log("Screenshot succeeded");
    });
    
### Resize to 400x300, set JPG quality to 60% ###

    var screenshot = require('desktop-screenshot');

    screenshot("screenshot.jpg", {width: 400, height: 300, quality: 60}, function(error, complete) {
        if(error)
            console.log("Screenshot failed", error);
        else
            console.log("Screenshot succeeded");
    });
    
## TODOs ##
- Cropping
