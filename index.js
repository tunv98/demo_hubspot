
require('dotenv').config({path: '.env'});

const authenController = require('./controllers/authen')
const formController = require('./controllers/form')
const _ = require('lodash');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');


const PORT = process.env.PORT;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
}));

app.use(bodyParser.json({
  limit: '50mb',
  extended: true,
}));



app.use(authenController.checkEnv);

app.get('/', authenController._process);

app.use('/oauth', authenController.processOauthen)

app.use('/oauth-callback', authenController.processOauthenCallback)

app.get('/login', (req, res) => {
  tokenStore = {};
  res.redirect('/');
});

app.get('/refresh', authenController.processRefresh);

app.get('/create-form', formController.createNewForm);

app.get('/get-form', formController.getForms);

app.get('/error', (req, res) => {
  res.render('error', {error: req.query.msg});
});

app.use((error, req, res, next) => {
  res.render('error', {error: error.message});
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
