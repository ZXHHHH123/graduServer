module.exports = errorHandle = (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        error: err.originalError ? err.originalError.message : err.message,
        msg: 'token过期，请重新登录'
      };
    } else {
      throw err;
    }
  });
}
