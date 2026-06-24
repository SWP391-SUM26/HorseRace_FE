const http = require('http');
const fs = require('fs');

http.get('http://localhost:8080/v3/api-docs', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    const endpoints = [];
    for (const path in data.paths) {
      for (const method in data.paths[path]) {
        endpoints.push(`${method.toUpperCase()} ${path}`);
      }
    }
    fs.writeFileSync('swagger_endpoints.txt', endpoints.join('\n'));
    console.log(`Saved ${endpoints.length} endpoints to swagger_endpoints.txt`);
  });
}).on('error', err => {
  console.error(err);
});
