const fs = require('fs');
const path = require('path');

const swagger = fs.readFileSync('swagger_endpoints.txt', 'utf-8').split('\n').filter(Boolean);
const srcDir = 'src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);
let feApis = new Set();
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  // Simple regex to extract strings starting with /api/v1/
  const matches = content.match(/\/api\/v1\/[A-Za-z0-9\-\_\/]+/g);
  if (matches) matches.forEach(m => feApis.add(m));
});

const missing = swagger.filter(s => {
  const ep = s.split(' ')[1];
  // Remove path parameters like {id} for substring matching
  const epBase = ep.replace(/\/\{.*?\}/g, '');
  return !Array.from(feApis).some(f => f.includes(epBase));
});

fs.writeFileSync('missing_apis.txt', missing.join('\n'));
console.log('Missing API count:', missing.length);
