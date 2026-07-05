const newman = require('newman');

const payload = {
  name: 'QA Ahmed Khan',
  password: 'SecurePass123!',
  email: 'qa.buyer.' + Math.floor(Math.random() * 100000) + '@mail.com',
  phone: '+92' + Math.floor(1000000000 + Math.random() * 9000000000),
};

console.log('Sending payload via Fetch...');
fetch('http://127.0.0.1:5000/api/buyers/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then((r) => r.json())
  .then((data) => {
    console.log('Fetch Register success:', data);

    // Try to register another one via Newman
    const payload2 = {
      name: 'QA Ahmed Khan 2',
      password: 'SecurePass123!',
      email: 'qa.buyer.' + Math.floor(Math.random() * 100000) + '@mail.com',
      phone: '+92' + Math.floor(1000000000 + Math.random() * 9000000000),
    };

    console.log('Running Newman...');
    newman
      .run({
        collection: {
          info: {
            name: 'Test Register',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
          },
          item: [
            {
              name: 'Register',
              request: {
                url: 'http://127.0.0.1:5000/api/buyers/register',
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'application/json' }],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify(payload2),
                },
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
