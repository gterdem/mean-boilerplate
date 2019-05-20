const { spawn } = require('child_process');
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const gutil = require('gulp-util');
const path = require('path');
const fs = require('fs');
const { config } = require('./config');

const consoleLog = data => gutil.log(data.toString().trim());

const toWatch = ['./src', './swagger'];

if (fs.existsSync(config.swaggerDirPath)) {
  toWatch.push(config.swaggerDirPath)
}

// gulp.task('server', () => nodemon({
//   script: './bin/www',
//   watch: toWatch,
//   ext: 'js yaml',
//   ignore: ['build/**'],
//   env: {
//     DEBUG: 'server:server',
//     NODE_PATH: path.resolve(__dirname, 'server'),
//     NODE_ENV: 'development',
//   },
// }));
// start our server and listen for changes
gulp.task('server', function () {
  // configure nodemon
  nodemon({
    // the script to run the app
    script: './bin/www',
    // this listens to changes in any of these files/routes and restarts the application
    watch: toWatch,
    ext: 'js yaml',
    ignore: ['build/**'],
    env: {
      DEBUG: 'server:server',
      NODE_PATH: path.resolve(__dirname, 'server'),
      NODE_ENV: 'development',
    },
    // Below i'm using es6 arrow functions but you can remove the arrow and have it a normal .on('restart', function() { // then place your stuff in here }
  }).on('restart', () => {
    gulp.src('./bin/www')
      // I've added notify, which displays a message on restart. Was more for me to test so you can remove this
      .pipe(notify('Running the start tasks and stuff'));
  });
});


gulp.task('mongo', gulp.series((callback) => {
  const dbProcess = spawn('mongod');
  dbProcess.stderr.on('data', consoleLog);
  dbProcess.on('close', (code) => {
    consoleLog(`Database was stopped with code ${code}`);
    callback();
  });
}));

// Database tasks
gulp.task('start-mongo', runCommand('docker run --rm --name mongo-dev -p 27017:27017 mongo'));
gulp.task('start-mongo-viewer', runCommand('docker run --rm --name mongo-express-dev --link mongo-dev:mongo -p 8081:8081 mongo-express'));

gulp.task('run:dev', gulp.series('mongo', 'server'));
