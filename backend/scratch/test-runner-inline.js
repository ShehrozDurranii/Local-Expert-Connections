const fs = require('fs');
const path = require('path');
const newman = require('newman');

const collectionPath =
  'C:/Users/Shehroz Durrani/.gemini/antigravity-ide/brain/9a8b143d-5a26-46ae-9b5b-455ca92e58e4/.system_generated/steps/1012/output.txt';
const environmentPath = path.join(__dirname, 'environment.json');

console.log('Loading files...');
const raw = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
const collection = raw.collection || raw;
const environment = JSON.parse(fs.readFileSync(environmentPath, 'utf8'));

// Print environment variables loaded
console.log(
  'Environment baseUrl:',
  environment.values.find((v) => v.key === 'baseUrl')
);

const logPath = path.join(__dirname, 'test_output.log');
const logStream = fs.createWriteStream(logPath, { flags: 'w' });
function log(msg) {
  logStream.write(msg + '\n');
  console.log(msg);
}

newman
  .run({
    collection: collection,
    environment: environment,
    reporters: 'cli',
  })
  .on('request', function (err, args) {
    if (err) {
      log('Request error: ' + err.toString());
    } else {
      log(
        'Request success: ' +
          args.request.method +
          ' ' +
          args.request.url.toString() +
          ' ' +
          args.response.code
      );
      if (args.request.body) {
        log('Request Body Raw: ' + args.request.body.raw);
      }
      const bodyStr = args.response.stream.toString();
      const titleMatch = bodyStr.match(/<title>([\s\S]*?)<\/title>/i);
      const preMatch = bodyStr.match(/<pre>([\s\S]*?)<\/pre>/i);
      log('Response Title: ' + (titleMatch ? titleMatch[1].trim() : 'No Title'));
      if (preMatch) log('Response Stack: ' + preMatch[1].trim());
      else log('Snippet of Body: ' + bodyStr.slice(0, 200));
    }
  })
  .on('done', function (err, summary) {
    log('Done! Failures: ' + summary.run.failures.length);
    logStream.end();
  });
