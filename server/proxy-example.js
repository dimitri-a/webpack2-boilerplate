import express from 'express';
import bodyParser from 'body-parser';
import apiRouter from './api-router';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', apiRouter);

// Server handle
let handle = null;

const apiServer = {

  get app() { return app; },

  get handle() { return handle; },

  start: () => {
    if (handle === null) {
      handle = app.listen(8010, 'localhost', (err) => {
        if (err) {
          console.error(err); // eslint-disable-line no-console
          process.exit(1);
        }
        else {
          console.log('API server stared @ http://localhost:8010'); // eslint-disable-line no-console
          app.emit('apiStarted');
        }
      });
    }
  },

  stop: (done = () => {}) => {
    if (handle) {
      handle.close(done);
      handle = null;
      console.log('API Server stopped'); // eslint-disable-line no-console
    }
  },
};

export default apiServer;

