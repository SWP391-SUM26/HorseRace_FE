import fs from 'fs';
const doc = JSON.parse(fs.readFileSync('swagger2.json', 'utf8'));

const spectatorPath = doc.paths['/api/v1/auth/register/spectator'];
if (spectatorPath) {
  const schemaRef = spectatorPath.post.requestBody.content['application/json'].schema.$ref;
  const schemaName = schemaRef.split('/').pop();
  console.log("Spectator Request Fields:", Object.keys(doc.components.schemas[schemaName].properties));
} else {
  console.log('Path /api/v1/auth/register/spectator not found!');
  // Let's find any register paths
  console.log(Object.keys(doc.paths).filter(p => p.includes('register')));
}
