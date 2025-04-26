// fs stands for file systems
// by using this module,we get access to functions for reading and writing data.
// Import required core modules
const fs = require('fs'); // File System module
const http = require('http'); // HTTP module
const url = require('url'); // URL module

//including a 3-party module
// slug is a url-friendly version of string.
const slugify = require('slugify');

// own modules
const replaceTemplate = require('./modules/replaceTemplate');

////////////////////////////
// Files

// Synchronous file reading and writing
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

// const textOut = `This is about Avocado ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File Written!');

// Asynchronous file reading
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('ERROR');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//                 console.log("Your File has been written");
//             });
//         });
//     });
// });
// console.log("Will Read File!");

///////////////////////////
// SERVER

// reading file synchronously blocks the executon of the code untill the operation is complete.
// here we are using synchronous file reading in your code because
// you are resading template files and json data before starting the server.

const tempOverview = fs.readFileSync( `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  console.log(req.url); // Logs the request URL

  // parsing a url
  const { query, pathname } = url.parse(req.url, true);

  // Overview Page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    // in js,map is used to iterate over an array and create a new array with the
    // results of applying a function to each element.

    // we loop over this dataobj array  which holds all of the products.
    // in each iteration,we will replace the placeholders with the tempCard in the curr product.
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    // res.end tells the server that the response is fully sent to the client.
    res.end(output);
  }
  // Product Page
  else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);
    // res.end('Hello from the server!');
  }
  // API
  else if (pathname === '/api') {
    fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data) => {
      const productData = JSON.parse(data);
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.end(data);
      //   console.log(productData);
    });
    //    ERR-HTTP_HEADERS_SENT error occurs when you try to send multiple responses for a single request.
  } else {
    // NOT FOUND
    // when the server sends the response,the content-type tells the browser what kind of data it is recieving,
    // if we do not use content-type the browser will not interpret the response correctly.
    res.writeHead(404, {
      'Content-Type': 'text/html',
      'my-own-header': 'Hello Duniya!',
    });
    res.end('<h1>404-Page not Found!</h1>');
  }
});

// Start server on localhost (127.0.0.1) and port 8000
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
