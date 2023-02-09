var http = require('http');
var express = require("express");
var body_parser = require('body-parser');
var cookieParser = require('cookie-parser');
const app = express();



app.use(body_parser.urlencoded({extended:true}));
app.use(body_parser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});


app.use(cookieParser());
app.use(express.static('./assets'));
app.use(express.static('./public'));
app.use(express.static('./out'));
app.use('/api',require('./routes/api'));

const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const serve = server.listen(PORT);