const fs = require('fs');
const path = require('path');
const newman = require('newman');
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

// Define file paths
const collectionSourcePath =
  'C:/Users/Shehroz Durrani/.gemini/antigravity-ide/brain/9a8b143d-5a26-46ae-9b5b-455ca92e58e4/.system_generated/steps/2055/output.txt';
const scratchDir = path.join(__dirname);

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

// 1. Read and parse the Postman collection payload
const rawCollectionData = JSON.parse(fs.readFileSync(collectionSourcePath, 'utf8'));
const collectionObject = rawCollectionData.collection;

// Helper to convert request url objects into simple raw strings and clean up body escaping
function convertUrlsToStrings(items) {
  if (!items) return;
  items.forEach((item) => {
    if (item.request) {
      if (item.request.url && typeof item.request.url === 'object') {
        item.request.url = item.request.url.raw;
      }
      if (item.request.body && item.request.body.raw) {
        let rawBody = item.request.body.raw;
        // Unescape double-escaped newlines and quotes
        try {
          rawBody = rawBody.replace(/\\n/g, '\n').replace(/\\"/g, '"');
        } catch (e) {
          // Ignored
        }
        item.request.body.raw = rawBody;
      }
    }
    if (item.item) {
      convertUrlsToStrings(item.item);
    }
  });
}
convertUrlsToStrings(collectionObject.item);

// 1b. Inject report test requests into the empty "Reports" folder
const reportsFolder = collectionObject.item.find((f) => f.name === 'Reports');
if (reportsFolder) {
  reportsFolder.item = [
    {
      name: 'File Report - Positive',
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              order_id: '550e8400-e29b-41d4-a716-446655440099',
              reported_user_id: 'ca9a80ff-0b83-4dca-975d-6c10c20808d9',
              reported_role: 'expert',
              category: 'fake_proof',
              evidence_notes: 'QA test - proof photos appear to be downloaded from Google Images.',
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } },
        },
        url: '{{baseUrl}}/api/reports',
      },
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              "pm.test('Status code is 201', function () {",
              '    pm.response.to.have.status(201);',
              '});',
              "pm.test('Response indicates report submitted', function () {",
              '    const jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.true;',
              "    pm.expect(jsonData.message).to.include('submitted');",
              '});',
              "pm.test('Response data has report fields', function () {",
              '    const jsonData = pm.response.json();',
              "    pm.expect(jsonData.data).to.have.property('id');",
              "    pm.expect(jsonData.data.status).to.eql('open');",
              "    pm.expect(jsonData.data.category).to.eql('fake_proof');",
              '});',
            ],
          },
        },
      ],
    },
    {
      name: 'File Report - Negative (Invalid Order UUID)',
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              order_id: 'not-a-uuid',
              reported_user_id: 'ca9a80ff-0b83-4dca-975d-6c10c20808d9',
              reported_role: 'expert',
              category: 'fraud',
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } },
        },
        url: '{{baseUrl}}/api/reports',
      },
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              "pm.test('Status code is 400', function () {",
              '    pm.response.to.have.status(400);',
              '});',
              "pm.test('Validation error on order_id', function () {",
              '    const jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.false;',
              "    pm.expect(jsonData.errors[0].field).to.eql('order_id');",
              '});',
            ],
          },
        },
      ],
    },
    {
      name: 'File Report - Negative (Invalid Role)',
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              order_id: '550e8400-e29b-41d4-a716-446655440099',
              reported_user_id: 'ca9a80ff-0b83-4dca-975d-6c10c20808d9',
              reported_role: 'admin',
              category: 'fraud',
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } },
        },
        url: '{{baseUrl}}/api/reports',
      },
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              "pm.test('Status code is 400', function () {",
              '    pm.response.to.have.status(400);',
              '});',
              "pm.test('Validation error on reported_role', function () {",
              '    const jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.false;',
              "    pm.expect(jsonData.errors[0].field).to.eql('reported_role');",
              '});',
            ],
          },
        },
      ],
    },
    {
      name: 'File Report - Negative (Invalid Category)',
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              order_id: '550e8400-e29b-41d4-a716-446655440099',
              reported_user_id: 'ca9a80ff-0b83-4dca-975d-6c10c20808d9',
              reported_role: 'expert',
              category: 'spam',
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } },
        },
        url: '{{baseUrl}}/api/reports',
      },
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              "pm.test('Status code is 400', function () {",
              '    pm.response.to.have.status(400);',
              '});',
              "pm.test('Validation error on category', function () {",
              '    const jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.false;',
              "    pm.expect(jsonData.errors[0].field).to.eql('category');",
              '});',
            ],
          },
        },
      ],
    },
    {
      name: 'File Report - Negative (Non-existent Order)',
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              order_id: '00000000-0000-0000-0000-000000000000',
              reported_user_id: 'ca9a80ff-0b83-4dca-975d-6c10c20808d9',
              reported_role: 'expert',
              category: 'fraud',
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } },
        },
        url: '{{baseUrl}}/api/reports',
      },
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              "pm.test('Status code is 404', function () {",
              '    pm.response.to.have.status(404);',
              '});',
              "pm.test('Response says order not found', function () {",
              '    const jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.false;',
              "    pm.expect(jsonData.message).to.include('order not found');",
              '});',
            ],
          },
        },
      ],
    },
    {
      name: 'File Report - Negative (Unauthorized)',
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              order_id: '550e8400-e29b-41d4-a716-446655440099',
              reported_user_id: 'ca9a80ff-0b83-4dca-975d-6c10c20808d9',
              reported_role: 'expert',
              category: 'fraud',
            },
            null,
            2
          ),
          options: { raw: { language: 'json' } },
        },
        url: '{{baseUrl}}/api/reports',
      },
      event: [
        {
          listen: 'test',
          script: {
            type: 'text/javascript',
            exec: [
              "pm.test('Status code is 401', function () {",
              '    pm.response.to.have.status(401);',
              '});',
              "pm.test('Response indicates unauthorized', function () {",
              '    const jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.be.false;',
              '});',
            ],
          },
        },
      ],
    },
  ];
  console.log(`Injected ${reportsFolder.item.length} report test requests into Reports folder.`);
}

// Write cleaned collection to temporary JSON file
const collectionFilePath = path.join(scratchDir, 'collection.json');
fs.writeFileSync(collectionFilePath, JSON.stringify(collectionObject, null, 2), 'utf8');

// 2. Define environment structure (Load existing if present to preserve variables)
const environmentFilePath = path.join(scratchDir, 'environment.json');
let environmentObject;

if (fs.existsSync(environmentFilePath)) {
  try {
    environmentObject = JSON.parse(fs.readFileSync(environmentFilePath, 'utf8'));
    console.log('Loaded existing environment variables.');
  } catch (err) {
    console.error('Failed to parse existing environment.json, rebuilding...');
  }
}

if (!environmentObject) {
  environmentObject = {
    id: '167985b8-2455-411b-b55b-58ec3ecc21d0',
    name: 'Local Expert-Connect Env',
    values: [
      { key: 'baseUrl', value: 'http://127.0.0.1:5000', type: 'text', enabled: true },
      { key: 'jwtToken', value: '', type: 'text', enabled: true },
      { key: 'buyerId', value: '', type: 'text', enabled: true },
      { key: 'expertId', value: '', type: 'text', enabled: true },
      { key: 'requestId', value: '', type: 'text', enabled: true },
      { key: 'offerId', value: '', type: 'text', enabled: true },
      { key: 'reviewId', value: '', type: 'text', enabled: true },
      { key: 'cityId', value: '3b687684-1287-434c-870a-5c5b414a67cc', type: 'text', enabled: true },
      {
        key: 'categoryId',
        value: '393a36a3-5ef8-4290-be33-85766506ecd6',
        type: 'text',
        enabled: true,
      },
    ],
  };
}

// Ensure baseUrl is set to local loopback
const baseUrlVar = environmentObject.values.find((v) => v.key === 'baseUrl');
if (baseUrlVar) {
  baseUrlVar.value = 'http://127.0.0.1:5000';
}

fs.writeFileSync(environmentFilePath, JSON.stringify(environmentObject, null, 2), 'utf8');

// Seeding function for suspended buyer testing
async function setupSuspendedUser() {
  const suspendedBuyerId = '11111111-2222-3333-4444-555555555555';
  console.log('Seeding suspended buyer account in DB...');
  try {
    const passwordHash = await bcrypt.hash('SecurePass123!', 10);
    // Delete first to avoid duplicates
    await db.query('DELETE FROM buyer_profile WHERE buyer_id = ?', [suspendedBuyerId]);
    await db.query('DELETE FROM buyer WHERE id = ?', [suspendedBuyerId]);

    // Insert buyer
    await db.query(
      "INSERT INTO buyer (id, email, phone, password_hash, status) VALUES (?, ?, ?, ?, 'suspended')",
      [suspendedBuyerId, 'suspended.buyer@mail.com', '+923000000000', passwordHash]
    );
    // Insert profile
    await db.query('INSERT INTO buyer_profile (buyer_id, name) VALUES (?, ?)', [
      suspendedBuyerId,
      'Suspended QA Buyer',
    ]);
    console.log('Suspended buyer seeded successfully.');
  } catch (err) {
    console.error('Failed to seed suspended buyer account:', err);
  }
}

// Seed a test order owned by the given buyer so POST /api/reports can reference it
async function setupTestOrder(buyerId) {
  if (!buyerId) {
    console.log('No buyerId provided, skipping order seeding.');
    return;
  }
  const testOrderId = '550e8400-e29b-41d4-a716-446655440099';
  const testExpertId = 'ca9a80ff-0b83-4dca-975d-6c10c20808d9';
  const testOfferId = '1bca6273-930f-4914-bc77-2b0546c20b27';
  console.log(`Seeding test order ${testOrderId} for buyer ${buyerId}...`);
  try {
    // Clean up any prior test data
    await db.query('DELETE FROM report WHERE order_id = ?', [testOrderId]);
    await db.query('DELETE FROM orders WHERE id = ?', [testOrderId]);

    await db.query(
      "INSERT INTO orders (id, buyer_id, expert_id, offer_id, state) VALUES (?, ?, ?, ?, 'in_progress')",
      [testOrderId, buyerId, testExpertId, testOfferId]
    );
    console.log('Test order seeded successfully.');
  } catch (err) {
    console.error('Failed to seed test order:', err);
  }
}

// Seed a test request and offers owned by the given buyer so Offers module can verify them
async function setupTestOffers(buyerId) {
  if (!buyerId) {
    console.log('No buyerId provided, skipping offer seeding.');
    return;
  }
  const testRequestId = '550e8400-e29b-41d4-a716-446655440022';
  const testRequestIdDecline = '550e8400-e29b-41d4-a716-446655440025';

  const testOfferIdAccept = '110e8400-e29b-41d4-a716-446655440033';
  const testOfferIdOther = '110e8400-e29b-41d4-a716-446655440044';
  const testOfferIdDecline = '110e8400-e29b-41d4-a716-446655440055';

  const testExpertId = 'ca9a80ff-0b83-4dca-975d-6c10c20808d9';
  const testCityId = '3b687684-1287-434c-870a-5c5b414a67cc';
  const testCategoryId = '393a36a3-5ef8-4290-be33-85766506ecd6';

  console.log(`Seeding test request & offers for buyer ${buyerId}...`);
  try {
    // Clean up order records that might reference these offers
    await db.query('DELETE FROM orders WHERE offer_id IN (?, ?, ?)', [
      testOfferIdAccept,
      testOfferIdOther,
      testOfferIdDecline,
    ]);

    // Clean up any prior test offers & requests
    await db.query('DELETE FROM offer WHERE request_id IN (?, ?)', [
      testRequestId,
      testRequestIdDecline,
    ]);
    await db.query('DELETE FROM request WHERE id IN (?, ?)', [testRequestId, testRequestIdDecline]);

    // Insert request 1 (Accept testing)
    await db.query(
      `INSERT INTO request (id, buyer_id, city_id, category_id, description, budget, timeline, status) 
       VALUES (?, ?, ?, ?, 'Seeded test request for expert offers verification.', 50000.00, '2026-12-31 23:59:59', 'submitted')`,
      [testRequestId, buyerId, testCityId, testCategoryId]
    );

    // Insert request 2 (Decline testing)
    await db.query(
      `INSERT INTO request (id, buyer_id, city_id, category_id, description, budget, timeline, status) 
       VALUES (?, ?, ?, ?, 'Seeded test request for expert offers decline verification.', 50000.00, '2026-12-31 23:59:59', 'submitted')`,
      [testRequestIdDecline, buyerId, testCityId, testCategoryId]
    );

    // Insert offers on request 1
    await db.query(
      `INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) 
       VALUES (?, ?, ?, 45000.00, '3 days', 'Seeded offer for acceptance test.', 'pending')`,
      [testOfferIdAccept, testRequestId, testExpertId]
    );

    await db.query(
      `INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) 
       VALUES (?, ?, ?, 48000.00, '4 days', 'Seeded other offer on request 1.', 'pending')`,
      [testOfferIdOther, testRequestId, testExpertId]
    );

    // Insert offer on request 2 (independent decline test)
    await db.query(
      `INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) 
       VALUES (?, ?, ?, 48000.00, '4 days', 'Seeded offer for decline test.', 'pending')`,
      [testOfferIdDecline, testRequestIdDecline, testExpertId]
    );

    console.log('Test request and offers seeded successfully.');
  } catch (err) {
    console.error('Failed to seed test request and offers:', err);
  }
}

// Helper: run Newman for specific folders or all folders
// foldersToRun: array of folder names, or null for all folders
function runNewman(foldersToRun) {
  return new Promise((resolve, reject) => {
    const options = {
      collection: collectionFilePath,
      environment: environmentFilePath,
      reporters: 'cli',
    };
    if (foldersToRun && foldersToRun.length > 0) {
      options.folder = foldersToRun;
    }

    const label = foldersToRun ? `folders: [${foldersToRun.join(', ')}]` : 'ALL folders';
    console.log(`\nRunning Newman for ${label}...`);

    newman
      .run(options)
      .on('request', function (error, args) {
        if (error) {
          console.error('Request error:', error);
        } else {
          console.log('Sending request:', args.request.method, args.request.url.toString());
        }
      })
      .on('done', function (err, summary) {
        if (err) {
          reject(err);
          return;
        }

        // Save updated environment values back
        const envValues = summary.environment.values.members.map((m) => ({
          key: m.key,
          value: m.value,
          type: m.type || 'text',
          enabled: m.enabled !== false,
        }));

        environmentObject.values = envValues;
        fs.writeFileSync(environmentFilePath, JSON.stringify(environmentObject, null, 2), 'utf8');

        const failures = summary.run.failures ? summary.run.failures.length : 0;
        console.log(`Newman run completed. Failures: ${failures}`);
        resolve({ failures, summary });
      });
  });
}

async function run() {
  await setupSuspendedUser();

  console.log('Waiting 2 seconds for server to be ready...');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Gather all folder names except "Offers" and "Reports"
  const allFolders = collectionObject.item
    .filter((f) => f.item && f.item.length > 0 && f.name !== 'Offers' && f.name !== 'Reports')
    .map((f) => f.name);

  console.log('Phase 1: Running all non-Offers/Reports folders:', allFolders);

  // Phase 1: Run everything except Offers and Reports
  const phase1Result = await runNewman(allFolders);

  // After Phase 1, environment has the fresh buyerId from registration
  const updatedEnv = JSON.parse(fs.readFileSync(environmentFilePath, 'utf8'));
  const buyerIdVar = updatedEnv.values.find((v) => v.key === 'buyerId');
  const freshBuyerId = buyerIdVar ? buyerIdVar.value : null;

  let totalFailures = phase1Result.failures;

  if (freshBuyerId) {
    console.log(`\n--- Phase 1 complete. Fresh buyerId: ${freshBuyerId} ---`);
    // Seed the test order and offers with the fresh buyerId
    await setupTestOrder(freshBuyerId);
    await setupTestOffers(freshBuyerId);

    // Phase 2: Run Offers and Reports folders
    console.log('\nPhase 2: Running Offers and Reports folders...');
    const phase2Result = await runNewman(['Offers', 'Reports']);
    totalFailures += phase2Result.failures;
  } else {
    console.log('\nWARNING: No buyerId found in environment after Phase 1, skipping Phase 2');
  }

  // Exit based on combined results
  if (totalFailures > 0) {
    console.log(`\n=== ${totalFailures} test(s) failed ===`);
    process.exit(1);
  } else {
    console.log('\n=== All tests passed ===');
    process.exit(0);
  }
}

run();
