const newman = require('newman');

// Run a simple fetch
fetch('http://127.0.0.1:5000/health')
  .then((r) => r.json())
  .then((data) => {
    console.log('Fetch success:', data);

    // Now run a minimal newman run in memory
    newman
      .run({
        collection: {
          info: {
            name: 'Test',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
          },
          item: [
            {
              name: 'Health',
              request: {
                url: 'http://127.0.0.1:5000/health',
                method: 'GET',
              },
            },
          ],
        },
        reporters: 'cli',
      })
      .on('request', function (err, args) {
        if (err) {
          console.error('Newman Request Error:', err);
        } else {
          console.log('Newman Request Done:', args.response.code, args.response.status);
        }
      })
      .on('done', function (err, summary) {
        console.log('Newman finished. Failures:', summary.run.failures.length);
      });
  })
  .catch((err) => {
    console.error('Fetch error:', err);
  });
