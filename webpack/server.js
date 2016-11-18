const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const logger = require('./logger');
const argv = require('./array-to-key-value').arrayToKeyValue(process.argv.slice(2));
const isDev = process.env.NODE_ENV !== 'production' && !argv['env.prod'];

const config = require('./webpack.config.babel');
const publicPath = config.output.publicPath || '/';
const outputPath = config.output.path || path.resolve(process.cwd(), 'build');

const app = express();

// Middleware for handling JSON, Raw, Text and URL encoded form data
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Sample REST API
// Note: Router must be defined before the "catch all" app.get('*', (req, res)
const router = express.Router();

router.get('/', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json( { api: '/api', ping: '/api/ping' } );
});

router.get('/ping', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json( {ping: 'pong!'} );
});

app.use('/api', router);
//

if(isDev) {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    filename: config.output.filename,
    publicPath: publicPath,
    contentBase: config.context,
    silent: true,
    stats: 'errors-only',
  }));

  app.use(webpackHotMiddleware(compiler));

  //app.get(publicPath, (req, res) => {
  app.get('*', (req, res) => {
    fs.readFile(path.resolve(outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.send(file.toString());
      }
    });
  });
}
else {
  const compression = require('compression');

  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique
  // and other good practices on official Express.js docs http://mxs.is/googmy
  app.use(compression());

  app.use(publicPath, express.static(outputPath));

  //app.get(publicPath, (req, res) => res.sendFile(path.resolve(outputPath, 'index.html')));
  app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.resolve(outputPath, 'index.html'))
  });
}

// get the intended port number, use port 3000 if not provided
const port = process.env.PORT || argv.port || 3000;
const host = 'localhost';
app.listen(port, host, (err) => {
  if(err) {
    logger.error(err.message);
  }
  else {
    logger.serverStarted(port);
  }
});
