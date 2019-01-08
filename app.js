const Koa = require('koa')
const app = new Koa()
let path = require('path');
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
let session = require('koa-generic-session');
let redis = require('redis');
let redisStore = require('koa-redis');
let dev = require('./config/development');
let routes = require('./routes/index');
let client = redis.createClient({
    port:dev.redis_port,
    host:dev.redis_url
})
client.info(function(err,response){
    if(!err){
        console.log("redis ok👽");
    }else {
        console.log(JSON.stringify(err))
    }
});


//允许跨域
let cors = require('koa2-cors');

// error handler
onerror(app)

let corsOptions = {
    origin: '*',
    credentials: true,
    maxAge: '1728000'
    //这一项是为了跨域专门设置的
};
app.use(cors(corsOptions));

app.keys = ['some secret hurr'];
//app.use(session(CONFIG, app));
app.use(session({
    store: redisStore({
        client: client,
    })
}, app));

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

routes.get('/', async(ctx, next) => {
    // await ctx.render("index",{
    //     title:"test page"
    // })
    console.error("!!!!!!!!!!!!!!!!!!!!")
});
// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

// routes
app.use(routes.routes());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
