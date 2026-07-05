const fs = require('fs');

const filePath =
  'C:/Users/Shehroz Durrani/.gemini/antigravity-ide/brain/9a8b143d-5a26-46ae-9b5b-455ca92e58e4/.system_generated/steps/1274/output.txt';
const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const collection = raw.collection || raw;

console.log('Root items count:', collection.item.length);
collection.item.forEach((item, index) => {
  console.log(`Item ${index}:`, item.name, 'has sub-items:', item.item ? item.item.length : 0);
});
