var _ = require('lodash')
, format = require('util').format
, debug = require('../../util/debug')('player')

var Player = module.exports = function(videos) {
    this.$el = $('<video></video>')
    this.el = this.$el[0]
    this.current = null
    this.videos = videos || {}
    this.queue = []
    this.$el.on('ended', _.bind(this.onEnded, this))
    this.$el.on('loadedmetadata', _.bind(this.onLoadedMetadata, this))
    this.$el.on('canplay', _.bind(this.el.play, this.el))
    this.$window = $(window)
    this.$window.on('resize', _.bind(this.resize, this))
}

function createSourceElement(source) {
    var remaps = { 'ogv': 'ogg' }
    , url = _.isString(source) ? source : source.url
    , extension = url.match(/\.([^\.\/]+)$/i)[1]
    , type = source.type || 'video/' + (remaps[extension] || extension || 'mp4')

    return $(format('<source type="%s" src="%s"></source>', type, url))
}

Player.prototype.play = function(name) {
    var video = this.videos[name]
    if (!video) throw new Error('no video ' + name)
    this.$el.find('source').remove()
    this.$el.append(_.map(video.sources, createSourceElement))
    this.el.loop = video.loop || null
    this.el.play()
    this.el.load()
    this.current = name
    debug('loading/playing %s with sources %s', name, video.sources)
    return this
}

Player.prototype.enqueue = function(name) {
    if (!this.current) return this.play(name)
    this.queue.push(name)
    return this
}

Player.prototype.onEnded = function() {
    var next = this.queue.shift()
    if (next) this.play(next)
    else this.current = null
}

Player.prototype.fullscreen = function(val) {
    if (typeof val == 'undefined') return this.isFullscreen
    this.isFullscreen = val
    this.resize()
    return this
}

Player.prototype.resize = function() {
    if (!this.isFullscreen) {
        return this.$el.css({
            height: '',
            width: '',
            top: '',
            left: '',
            position: ''
        })
    }

    var vWidth = this.el.videoWidth
    , vHeight = this.el.videoHeight

    if (!vWidth || !vHeight) return debug('vWidth/vHeight unknown')

    var vRatio = vWidth / vHeight
    , wWidth = this.$window.width()
    , wHeight = this.$window.height()
    , wRatio = wWidth / wHeight
    , width
    , height
    , video = this.videos[this.current]
    , isGreedy = !!video.greedy

    if (wRatio > vRatio == isGreedy) {
        width = wWidth
        height = width / vRatio
    } else {
        height = wHeight
        width = height * vRatio
    }

    this.$el.css({
        width: width,
        height: height,
        top: 0,
        left: 0,
        position: 'fixed'
    })
}

Player.prototype.onLoadedMetadata = function() {
    this.resize()
}
