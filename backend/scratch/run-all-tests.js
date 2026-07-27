const app = require('../src/app');

const PORT = 5000;
const server = app.listen(PORT, async () => {
  console.log(`Backend test server running on port ${PORT}`);

  try {
    // Require and execute runner
    require('./runner.js');
  } catch (error) {
    console.error('Execution error:', error);
    server.close();
    process.exit(1);
  }
});
