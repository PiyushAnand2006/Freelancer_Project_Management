const fs = require('fs');

let content = fs.readFileSync('src/db/entities.ts', 'utf-8');

content = content.replace(/@Column\(\{ name: '([^']+)' \}\)/g, "@Column({ name: '$1', type: 'int' })");
content = content.replace(/@Column\(\{ name: '([^']+)', nullable: true \}\)/g, "@Column({ name: '$1', type: 'int', nullable: true })");
content = content.replace(/@Column\(\{ name: '([^']+)', unique: true \}\)/g, "@Column({ name: '$1', type: 'int', unique: true })");

fs.writeFileSync('src/db/entities.ts', content);
console.log('Fixed types in entities.ts');
