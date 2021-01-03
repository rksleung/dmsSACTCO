const express = require('express');
const url = require('url');
//const proxy = require('http-proxy-middleware');
const app = express();

const ui5Origin = 'https://sapui5.hana.ondemand.com/1.44.31';
// const ui5Origin = 'https://openui5.hana.ondemand.com/1.44.31';
// const ui5Origin = 'https://[BACKEND_HOST]:[BACKEND_PORT]/sap/public/bc/ui5_ui5/1.44';

const backend = 'https://[BACKEND_HOST]:[BACKEND_PORT]';


// statically serve webapp folder, use test.html as index (as used in SAP Web IDE templates)
app.use(express.static('uimodule/webapp', { index: 'index.html' }));
/*
// proxy resources and test-resources from remote location
let proxyOptions = url.parse(ui5Origin + '/resources');
proxyOptions.cookieRewrite = true;
app.use('/resources', proxy(proxyOptions));

proxyOptions = url.parse(ui5Origin + '/test-resources');
proxyOptions.cookieRewrite = true;
app.use('/test-resources', proxy(proxyOptions));

// proxy backend
proxyOptions = url.parse(backend + '/sap');
proxyOptions.cookieRewrite = true;
app.use('/sap', proxy(proxyOptions));
*/
// start server
var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('Express server listening on port ' + port);
});