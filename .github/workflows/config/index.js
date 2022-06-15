const fs = require('fs');
const path = require('path');
const jsonPath = path.resolve(process.argv[2]);
const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const outputName = 'deployment-matrix';

console.log(json);
console.log(`::set-output name=${outputName}::${JSON.stringify(json)}`);