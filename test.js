var screenshot = require('./module')

screenshot('screenshot.jpg', {buffered: true}, function(error, complete) {
  if (error)
    console.log('Screenshot failed', error)
  else
    console.log('Screenshot succeeded', complete)
})
