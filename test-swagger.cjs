const fs = require('fs');
const doc = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
const path = doc.paths['/api/v1/auth/register/spectator'];
if (!path) {
  console.log('Endpoint not found');
} else {
  const schemaRef = path.post.requestBody.content['application/json'].schema.$ref;
  const schemaName = schemaRef.split('/').pop();
  console.log(doc.components.schemas[schemaName].properties);
}
