// import package
import express from 'express';
import passport from 'passport';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http'
import https from 'https'
import bodyParser from 'body-parser';
import config from './config';
import dbConnection from './config/dbConnection';
import './config/cron';
import adminApi from './routes/admin.route';
import userApi from './routes/user.route';
import p2p from './routes/P2P-routes/p2proutes';
import p2pAdmin from './routes/P2P-routes/P2PAdminroutes';
import { createSocketIO } from './config/socketIO';
const { swaggerUi, swaggerSpec } = require('./config/swagger.services');

const helmet = require('helmet');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const app = express();

app.use(morgan("dev"));

app.use(cors());

var ip = require('ip');

var fs = require('fs');

var myip = ip.address();

app.set('trust proxy', true)

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(helmet());

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        // scriptSrc: ["'self'", "https://apis.google.com"],
        // objectSrc: ["'none'"],
    },
}));

app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
}));

app.use(helmet.frameguard({ action: 'deny' }));

app.use(helmet.hidePoweredBy());

app.use(helmet.noSniff());

app.use(helmet.xssFilter());

app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));

app.use(bodyParser.urlencoded({
  limit: 5242880, extended: true 
}));

app.use(bodyParser.json());

app.use(passport.initialize());

require("./config/passport").adminAuth(passport);

app.use(express.static(__dirname + '/public'));

app.use('/adminApi', adminApi);

app.use('/api', userApi);

app.use('/p2papi' , p2p);

app.use('/p2papiadmin' , p2pAdmin);

app.get('/testAPI', (req, res) => {
  return res.send("Successfully Testing")
})

if (myip == '139.162.66.242') {
  const options = {
    key: fs.readFileSync('/var/www/sslkeys/aurexchange_com.key'),
    cert: fs.readFileSync('/var/www/sslkeys/aurexchange_com.csr')
  };
  var server = https.createServer(options, app);
}
else {
  var server = http.createServer(app);
}

server.on("error", (err) => {
  console.log("Error opening server" , err)
})

app.get('/', function (req, res) {
  res.json({ status: true });
});
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

createSocketIO(server);

dbConnection((done) => {
  if (done) {
    server = server.listen(config.PORT, function () {
      console.log('\x1b[34m%s\x1b[0m', `server is running on port ${config.PORT}`);
    });
  }
})

