'use strict';

// 基础中间件

const _ = require('lodash');

// 返回数据或异常
// 成功:
// {
//   code: 0,
//   message: 'success',
//   data: {}/[{}]
// }
// 错误:
// {
//   code: 1,
//   message: 'reason'
// }
function reply(req, res, next) {
  function _reply(data) {
    if (typeof data.then === 'function') {
      _replyPromise(data);
    } else {
      _replyObj(data);
    }
  }

  function _replyPromise(promise) {
    promise.then((result) => {
      _replyObj(result);
    }).catch((err) => {
      _replyError(err);
    });
  }

  function _replyObj(data) {
    res.json({
      code: 0,
      message: 'success',
      data: data
    });
  }

  function _replyError(err) {
    err = err || {};

    // process joi error
    if (err.details && err.details.length) {
      err.message = _.reduce(err.details, (result, detail) => {
        return result + '; ' + detail.message;
      }, '');
    }

    res.json({
      code: err.code || 1,
      message: err.message || err || 'Unknown error'
    });
  }

  res.reply = _reply;
  res.replyError = _replyError;

  next();
}

// 404
function notFound(req, res) {
  res.status(404).end('Not found!');
}

// 通用错误处理
function error(err, req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({error: 'Inernal error!'});
  } else {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  }
}

module.exports = {
  reply: reply,
  notFound: notFound,
  error: error
};
