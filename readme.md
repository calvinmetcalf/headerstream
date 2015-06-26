headerstream
===

Grab the first n bytes out of a stream.

```js
npm install --save headerstream
```

call it with a size n and a callback, callback is called with first n bytes, of
stream, rest of date is simply passed through.  If there is an error emitted by
the stream the callback will be called with that instead of the header.

```js
var HeaderStream = require('headerstream');


var destStream = getDestStream();
var srcStream = getSrcStream();
var headerStream = new HeaderStream(16, function (err, header) {
  headerStream.pipe(getStreamBasedOnHeader(header)).pipe(destStream);
});
srcStream.pipe(headerStream);
```
