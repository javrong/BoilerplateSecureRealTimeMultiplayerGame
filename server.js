require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

const helmet = require('helmet');

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.noSniff());
app.use(helmet.xssFilter({}));
app.use(nocache());

// Enabling header PHP-7.4.3
app.use(function (req, res, next) {
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
});

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'}));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Set Content-Security-Policy header
//app.use(
//  helmet({
//    contentSecurityPolicy: {
//      directives: {
//	"defaultSrc": ["'self'"],
//        "script-src": ["'self'", 'https://fonts.googleapis.com'],
//      },
//   },
//  }),
//);

// Set X-Content-Type-Options header
//app.use(
//  helmet({
//     xContentTypeOptions: true,
//   }),
//);

// Set X-XSS-Protection header
//app.use(
//  helmet({
//    xXssProtection: true,
//  }),
//);

// Set X-Frame-Options header
// Sets "X-Frame-Options: sameorigin"
//app.use(
//  helmet({
//    xFrameOptions: { action: "sameorigin" },
//  }),
//);

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
