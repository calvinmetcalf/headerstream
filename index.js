'use strict';
var Transform = require('readable-stream').Transform;
var inherits = require('inherits');
var once = require('once');
module.exports = HeaderStream;

inherits(HeaderStream, Transform);

function HeaderStream (size, callback) {
  if (!(this instanceof HeaderStream)) {
    return new HeaderStream(size, callback);
  }
  if (typeof callback !== 'function') {
    throw new Error('callback is not optional');
  }

  Transform.call(this);
  this._size = Number(size);
  if (this._size !== this._size) {
    throw new TypeError('invalid size');
  }
  if (this._size < 1) {
    throw new TypeError('size must be a positive value, got ' + size);
  }
  this._callback = once(callback);
  this._cache = [];
  this._sofar = 0;
  this._passThroughMode = false;
  this.once('error', this._callback);
}
function passThroughMethod(chunk, _, next) {
  this.push(chunk);
  next();
}
HeaderStream.prototype._transform = function (chunk, _, next) {
  this._cache.push(chunk);
  this._sofar += chunk.length;
  if (this._sofar < this._size) {
    return next();
  }
  var data = Buffer.concat(this._cache, this._sofar);
  if (data.length > this._size) {
    this.push(data.slice(this._size));
    data = data.slice(0, this._size);
  }
  this._transform = passThroughMethod;
  this._passThroughMode = true;
  var callback = this._callback;
  callback(null, data);
  next();
};
HeaderStream.prototype._flush = function (done) {
  if (this._passThroughMode) {
    return done();
  }
  done(new Error('insuficient data'));
};
