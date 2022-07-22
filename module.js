'use strict'

var path = require('path')
var jimp = require('jimp')
var fs = require('fs')
var capture = require('./capture')
var tmp = require('tmp')
var font, fontwhite

var validext = ['jpg', 'jpeg', 'png', 'bmp']

jimp.loadFont(jimp.FONT_SANS_16_BLACK).then(function (_font) {
  font = _font
})
jimp.loadFont(jimp.FONT_SANS_16_WHITE).then(function (_font) {
  fontwhite = _font
})

function Screenshot() {

  var config = parseArgs(Array.prototype.slice.call(arguments))

  function parseArgs(args) {

    var config = {
      callback: null,
      options: {
        buffered: false,
        caption: '',
        extension: 'png',
        multi: false,
        noprocess: false,
        output: '',
        timestamp: true
      }
    }

    for (var index in args) {
      switch (typeof args[index]) {
      case 'string':
        // config.options.output = path.normalize(args[index])
        break
      case 'function':
        config.callback = args[index]
        break
      case 'object':
        config.options = Object.assign(config.options, args[index])
        break
      }
    }

    return config
  }

  function checkConfig(){
    if (!config.options.output) {
      throw new Error('there is not configured output')
    }

    config.options.extension = path.extname(config.options.output).toLowerCase().substring(1) || 'png'
    if (validext.indexOf(config.options.extension) === -1) {
      throw new Error('The library only support png, jpeg and bpm output formats')
    }

    if (config.options.width != null && typeof config.options.width !== 'number'){
      throw new Error('the width must be a number or nothing')
    }

    if (config.options.height != null && typeof config.options.height !== 'number'){
      throw new Error('the height must be a number or nothing')
    }

    if (config.options.quality != null && (typeof config.options.quality !== 'number' || config.options.quality < 0 || config.options.quality >100)){
      throw new Error('the quality must be a number beetween 0 to 100 or nothing')
    }

    if (!capture.hasOwnProperty(process.platform)){
      throw new  Error('Unsupported platform ' + process.platform)
    }

    //there is no modification
    if (!config.options.width
      && !config.options.height
      && !config.options.quality
      && !config.options.timestamp
      && !config.options.caption){
      config.options.noprocess = true
    }
  }

  function processImage(input, output, options, callback) {
    if (!input){
      return callback(new Error('No image to process.'))
    }

    new jimp(input, function (err, image) {

      if (err){
        return callback(err)
      }
      if (!image){
        return callback(new Error('No image received from jimp.'))
      }

      var resWidth, resHeight

      if (typeof options.width === 'number')
        resWidth = Math.floor(options.width)
      if (typeof options.height === 'number')
        resHeight = Math.floor(options.height)

      if (typeof resWidth === 'number' && typeof resHeight !== 'number') // resize to width, maintain aspect ratio
        resHeight = Math.floor(image.bitmap.height * (resWidth / image.bitmap.width))
      else if (typeof resHeight === 'number' && typeof resWidth !== 'number') // resize to height, maintain aspect ratio
        resWidth = Math.floor(image.bitmap.width * (resHeight / image.bitmap.height))

      try {
        if (options.width || options.height) {
          image.resize(resWidth, resHeight)
        }
        if (options.quality) {
          image.quality(Math.floor(options.quality)) // only works with JPEGs
        }


        if (options.timestamp || options.caption) {
          var caption = options.caption.toString()
          if (options.timestamp && options.caption) {
            caption += '\r\n - '
          }
          caption += options.timestamp ? new Date().toUTCString() : ''
          image.print(fontwhite, 11, 11, caption, image.bitmap.width - 20) //shadow
          image.print(font, 10, 10, caption, image.bitmap.width - 20)
        }

        /* USE THIS WITH NEXT JIMP VERSION >0.2.28
        if (options.timestamp) {
          image.print(font, 10, 10, {
            alignmentX: jimp.HORIZONTAL_ALIGN_RIGHT,
            alignmentY: jimp.VERTICAL_ALIGN_BOTTOM,
            text: new Date().toUTCString()
          })
        }
        */

        if (options.buffered){
          image.getBuffer(jimp.AUTO, function(error, buffer) {

            if (error) {
              return callback(error)
            }

            callback(null, buffer)
          })
        } else {
          image.write(output, function(err){
            if (err){
              return callback(err)
            }

            return callback(null, output)
          })
        }
      }
      catch (error) {
        callback(error)
      }
    })
  }

  return new Promise(function(resolve, reject) {

    checkConfig()

    tmp.file({ postfix: '.' + config.options.extension, discardDescriptor: true }, function _tempFileCreated(err, path, fd, cleanupCallback) {
      if (err) {
        return reject(err)
      }

      config.options.temp = path

      capture[process.platform](config.options, function(error, options) {
        // TODO add option for string, rather than file
        if (error){
          reject(error)
          return cleanupCallback()
        }

        if (options.noprocess) {
          return fs.readFile(config.options.temp, function (err, data) {
            if (err) {
              reject(err)
              return cleanupCallback()
            }
            if (!options.buffered) {
              return fs.writeFile(config.options.output, data, function (err) {
                if (err) {
                  reject(err)
                  return cleanupCallback()
                }

                resolve(config.options.output)
                return cleanupCallback()
              })
            }

            resolve(data)
            return cleanupCallback()
          })
        }

        try {
          processImage(options.temp, options.output, options, function(error, success) {
            if (error){
              reject(error)
              return cleanupCallback()
            }

            resolve(success)
            return cleanupCallback()
          })
        }
        catch (e) {
          reject(e)
          return cleanupCallback()
        }
      })
    })
  })
    .then(function(success){
      if (config.callback) {
        config.callback(null, success)
      }

      return success
    })
    .catch(function(e) {
      if (config.callback) {
        return config.callback(e)
      }

      throw e
    })
}

exports = module.exports = Screenshot