'use strict';
var HeaderStream = require('./');
var test = require('tape');
var crypto = require('crypto');
function createSlices(number, buf) {
  if (number === 1) {
    return [buf];
  }
  var len = buf.length;
  var overHang = len % number;
  var minSize = (len - overHang) / number;
  var out = new Array(number);
  out[number - 1] = buf.slice(-(minSize + overHang));
  var i = -1;
  while (++i < (number - 1)) {
    out[i] = buf.slice(minSize * i, minSize * (i + 1));
  }
  return out;
}
function run(headSize, tailSize, chunks) {
  test('run with head size ' + headSize + ' and tail size ' + tailSize + ' with ' + chunks + ' chunks', function (t) {
    t.plan(3);
    var head = crypto.randomBytes(headSize);
    var tail = crypto.randomBytes(tailSize);
    var both = Buffer.concat([head, tail]);
    var slices = createSlices(chunks, both);
    var out = new Buffer('');
    var stream = new HeaderStream(headSize, function (err, resp) {
      t.error(err, 'no error');
      t.equals(resp.toString('base64'), head.toString('base64'), 'correct head');
    }).on('data', function (d) {
      out = Buffer.concat([out, d]);
    }).on('end', function () {
      t.equals(out.toString('base64'), tail.toString('base64'), 'correct tail');
    });
    pushChunks(0);
    function pushChunks(index) {
      if (index >= slices.length) {
        return stream.end();
      }
      stream.write(slices[index], function () {
        process.nextTick(function () {
          pushChunks(index + 1);
        });
      });
    }
  });
}
var chunks = 2;
var headSize, tailSize;
while (chunks <= 20) {
  headSize = -2;
  while (headSize <= 20) {
    headSize += 2;
    tailSize = -2;
    while (tailSize <= 20) {
      tailSize += 2;
      run(1 << headSize, 1 << tailSize, chunks);
    }
  }
  chunks += 2;
}
