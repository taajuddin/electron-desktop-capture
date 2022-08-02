module.exports = function(options, callback) {

  var childProcess = require('child_process')
  var path = require('path')

  var args = ['savescreenshot', options.temp]
  var spawnOptions = {}

  if (options.multi) {
    args = ['savescreenshotfull', options.temp]
  }

  if (options.env) {
    spawnOptions.env = options.env
  }

  var nircmd = childProcess.execFile(path.join(__dirname, 'bin', 'nircmd.exe'), args, spawnOptions)

  nircmd.on('close', function(code) {
    if (code !== 0) {
      return callback('nircmd failed', null)
    }

    return callback(null, options) // callback with options, in case options added
  })
}