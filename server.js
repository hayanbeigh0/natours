const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

const app = require('./app');
const { createLocationSocketServer } = require('./controllers/locationController');

const port = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION . Shutting down...');
  console.log(err);
  process.exit(1);
});

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

createLocationSocketServer();

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION❗️. Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
