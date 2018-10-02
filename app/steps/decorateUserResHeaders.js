'use strict';

function isResGzipped(res) {
  return res.headers['content-encoding'] === 'gzip';
}

function zipOrUnzip(method) {
  return function(rspData, res) {
    return (isResGzipped(res) && rspData.length) ? zlib[method](rspData) : rspData;
  };
}

var maybeUnzipResponse = zipOrUnzip('gunzipSync');
var maybeZipResponse = zipOrUnzip('gzipSync');



function decorateUserResHeaders(container) {
  var resolverFn = container.options.userResHeaderDecorator;
  var headers = container.user.res._headers;

  var proxyResData = maybeUnzipResponse(container.proxy.resData, container.proxy.res);
  
  if (!resolverFn) {
    return Promise.resolve(container);
  }

  return Promise
    .resolve(resolverFn(headers, container.user.req, container.user.res, container.proxy.req, container.proxy.res,proxyResData))
    .then(function(headers) {
      return new Promise(function(resolve) {
        container.user.res.set(headers);
        resolve(container);
      });
    });
}

module.exports = decorateUserResHeaders;
