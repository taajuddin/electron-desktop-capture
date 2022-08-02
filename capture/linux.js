module.exports = function(options, callback) {

  var childProcess = require('child_process')
  var path = require('path')

  var args = [options.temp]
  var spawnOptions = {}

  if (options.multi) {
    args = ['-m', options.temp]
  }

  if (options.env) {
    spawnOptions.env = options.env
  }

  var scrot = childProcess.execFile(path.join(__dirname, 'bin', process.arch !== 'arm' ? 'scrot' : 'arm', 'scrot'), args, spawnOptions)
  scrot.on('close', function(code) {
    if (code !== 0) {
      return callback('scrot failed', null)
    }

    return callback(null, options) // callback with options, in case options added
  })
}