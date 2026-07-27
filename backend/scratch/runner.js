const fs = require('fs');
const path = require('path');
const newman = require('newman');
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

const scratchDir = path.join(__dirname);

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

// Read base collection
const collectionFilePath = path.join(scratchDir, 'collection.json');
let collectionObject = JSON.parse(fs.readFileSync(collectionFilePath, 'utf8'));

// Helper to convert request url objects into simple raw strings
function convertUrlsToStrings(items) {
  if (!items) return;
  items.forEach((item) => {
    if (item.request) {
      if (item.request.url && typeof item.request.url === 'object') {
        item.request.url = item.request.url.raw;
      }
      if (item.request.body && item.request.body.raw) {
        let rawBody = item.request.body.raw;
        try {
          rawBody = rawBody.replace(/\\n/g, '\n').replace(/\\"/g, '"');
        } catch (e) {
          // ignore parsing error
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

// Helper function to inject / update requests in a folder
function setFolderRequests(folderName, requestsArray) {
  const folder = collectionObject.item.find((f) => f.name === folderName);
  if (folder) {
    folder.item = requestsArray;
    console.log(`Injected ${requestsArray.length} test requests into ${folderName} folder.`);
  }
}

// 1. Orders
setFolderRequests('Orders', [
  {
    name: 'Get Buyer Orders - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/buyers/{{buyerId}}/orders',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns list of orders', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data).to.be.an('array'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Get Buyer Orders - Negative (Unauthorized)',
    request: {
      method: 'GET',
      url: '{{baseUrl}}/api/buyers/{{buyerId}}/orders',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 401', function () { pm.response.to.have.status(401); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Get Order by ID - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns order details', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data.id).to.eql('550e8400-e29b-41d4-a716-446655440099'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Get Order by ID - Negative (Not Found)',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/00000000-0000-0000-0000-000000000000',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 404', function () { pm.response.to.have.status(404); });",
          ],
        },
      },
    ],
  },
]);

// 2. Payments
setFolderRequests('Payments', [
  {
    name: 'Fund Escrow - Positive',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({ gateway_reference: 'PAY-ESCROW-REF-100' }),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440088/payment',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Escrow funded successfully', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.message).to.include('funded'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Fund Escrow - Negative (Missing Gateway Ref)',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({}),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440088/payment',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 400', function () { pm.response.to.have.status(400); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Get Payment - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099/payment',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns payment data', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data.order_id).to.eql('550e8400-e29b-41d4-a716-446655440099'); });",
          ],
        },
      },
    ],
  },
]);

// 3. Milestones
setFolderRequests('Milestones', [
  {
    name: 'Get Order Milestones - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099/milestones',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns milestone array', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data).to.be.an('array'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Get Order Milestones - Negative (Unauthorized)',
    request: {
      method: 'GET',
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099/milestones',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 401', function () { pm.response.to.have.status(401); });",
          ],
        },
      },
    ],
  },
]);

// 4. Proof
setFolderRequests('Proof', [
  {
    name: 'Get Proof - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440077/proof',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns proof details', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data.approval_status).to.eql('pending'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Approve Proof - Positive',
    request: {
      method: 'POST',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440077/proof/880e8400-e29b-41d4-a716-446655440001/approve',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Proof approved message', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.message).to.include('approved'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Reject Proof - Positive',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({
          rejection_reason: 'Images are incomplete and blurry. Please resubmit clear photos.',
        }),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440066/proof/880e8400-e29b-41d4-a716-446655440002/reject',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Proof rejected message', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.message).to.include('rejected'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Reject Proof - Negative (Reason Too Short)',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({ rejection_reason: 'bad' }),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440066/proof/880e8400-e29b-41d4-a716-446655440002/reject',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 400', function () { pm.response.to.have.status(400); });",
          ],
        },
      },
    ],
  },
]);

// 5. Messages
setFolderRequests('Messages', [
  {
    name: 'Get Order Messages - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099/messages',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns message list', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data).to.be.an('array'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Send Message - Positive',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({ content: 'Hello expert, when will the service be completed?' }),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099/messages',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 201', function () { pm.response.to.have.status(201); });",
            "pm.test('Returns sent message', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data.content).to.include('completed'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Send Message - Negative (Empty Content)',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({ content: '' }),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099/messages',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 400', function () { pm.response.to.have.status(400); });",
          ],
        },
      },
    ],
  },
]);

// 6. Attachments
setFolderRequests('Attachments', [
  {
    name: 'Get Order Attachments - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099/attachments',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns attachment list', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data).to.be.an('array'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Get Order Attachments - Negative (Unauthorized)',
    request: {
      method: 'GET',
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440099/attachments',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 401', function () { pm.response.to.have.status(401); });",
          ],
        },
      },
    ],
  },
]);

// 7. Reviews
setFolderRequests('Reviews', [
  {
    name: 'Submit Review - Positive',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({ rating: 5, comment: 'Outstanding service! Fast and professional.' }),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440055/review',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 201', function () { pm.response.to.have.status(201); });",
            "pm.test('Review submitted', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data.rating).to.eql(5); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Submit Review - Negative (Invalid Rating)',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer {{jwtToken}}' },
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({ rating: 10, comment: 'Invalid rating test' }),
        options: { raw: { language: 'json' } },
      },
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440055/review',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 400', function () { pm.response.to.have.status(400); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Get Order Review - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440055/review',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns review data', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data.rating).to.eql(5); });",
          ],
        },
      },
    ],
  },
]);

// 8. Reports Injection
setFolderRequests('Reports', [
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
            "pm.test('Status code is 201', function () { pm.response.to.have.status(201); });",
            "pm.test('Response indicates report submitted', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; });",
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
            "pm.test('Status code is 400', function () { pm.response.to.have.status(400); });",
          ],
        },
      },
    ],
  },
]);

// 9. Offers Injection
setFolderRequests('Offers', [
  {
    name: 'Get Offers - Positive',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/requests/550e8400-e29b-41d4-a716-446655440022/offers',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Returns list of offers', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; pm.expect(json.data).to.be.an('array'); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Get Offers - Negative (Not Found)',
    request: {
      method: 'GET',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/requests/00000000-0000-0000-0000-000000000000/offers',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 404', function () { pm.response.to.have.status(404); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Accept Offer - Positive',
    request: {
      method: 'POST',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/offers/110e8400-e29b-41d4-a716-446655440033/accept',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Offer accepted successfully', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; });",
          ],
        },
      },
    ],
  },
  {
    name: 'Accept Offer - Negative (Already Accepted)',
    request: {
      method: 'POST',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/offers/110e8400-e29b-41d4-a716-446655440033/accept',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 400', function () { pm.response.to.have.status(400); });",
          ],
        },
      },
    ],
  },
  {
    name: 'Decline Offer - Positive',
    request: {
      method: 'POST',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/offers/110e8400-e29b-41d4-a716-446655440055/decline',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
            "pm.test('Offer declined successfully', function () { const json = pm.response.json(); pm.expect(json.success).to.be.true; });",
          ],
        },
      },
    ],
  },
  {
    name: 'Decline Offer - Negative (Already Declined)',
    request: {
      method: 'POST',
      header: [{ key: 'Authorization', value: 'Bearer {{jwtToken}}' }],
      url: '{{baseUrl}}/api/offers/110e8400-e29b-41d4-a716-446655440055/decline',
    },
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('Status code is 400', function () { pm.response.to.have.status(400); });",
          ],
        },
      },
    ],
  },
]);

// Write collection back
fs.writeFileSync(
  path.join(scratchDir, 'collection.json'),
  JSON.stringify(collectionObject, null, 2),
  'utf8'
);

// Environment Setup
const environmentFilePath = path.join(scratchDir, 'environment.json');
let environmentObject = {
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
fs.writeFileSync(environmentFilePath, JSON.stringify(environmentObject, null, 2), 'utf8');

// DB Seeding Functions
async function setupSuspendedUser() {
  const suspendedBuyerId = '11111111-2222-3333-4444-555555555555';
  try {
    const passwordHash = await bcrypt.hash('SecurePass123!', 10);
    await db.query('DELETE FROM buyer_profile WHERE buyer_id = ?', [suspendedBuyerId]);
    await db.query('DELETE FROM buyer WHERE id = ?', [suspendedBuyerId]);
    await db.query(
      "INSERT INTO buyer (id, email, phone, password_hash, status) VALUES (?, ?, ?, ?, 'suspended')",
      [suspendedBuyerId, 'suspended.buyer@mail.com', '+923000000000', passwordHash]
    );
    await db.query('INSERT INTO buyer_profile (buyer_id, name) VALUES (?, ?)', [
      suspendedBuyerId,
      'Suspended QA Buyer',
    ]);
  } catch (err) {
    console.error('Failed suspended buyer seed:', err);
  }
}

async function setupTestOffers(buyerId) {
  if (!buyerId) return;
  const testRequestId = '550e8400-e29b-41d4-a716-446655440022';
  const testRequestIdDecline = '550e8400-e29b-41d4-a716-446655440025';
  const testOfferIdAccept = '110e8400-e29b-41d4-a716-446655440033';
  const testOfferIdOther = '110e8400-e29b-41d4-a716-446655440044';
  const testOfferIdDecline = '110e8400-e29b-41d4-a716-446655440055';

  const testRequestIdOrder = '550e8400-e29b-41d4-a716-446655440090';
  const testOfferIdOrder = '110e8400-e29b-41d4-a716-446655440099';

  const testExpertId = 'ca9a80ff-0b83-4dca-975d-6c10c20808d9';
  const testCityId = '3b687684-1287-434c-870a-5c5b414a67cc';
  const testCategoryId = '393a36a3-5ef8-4290-be33-85766506ecd6';

  try {
    await db.query(
      'DELETE FROM review WHERE order_id IN (SELECT id FROM orders WHERE offer_id IN (?, ?, ?, ?))',
      [testOfferIdAccept, testOfferIdOther, testOfferIdDecline, testOfferIdOrder]
    );
    await db.query(
      'DELETE FROM attachment WHERE order_id IN (SELECT id FROM orders WHERE offer_id IN (?, ?, ?, ?))',
      [testOfferIdAccept, testOfferIdOther, testOfferIdDecline, testOfferIdOrder]
    );
    await db.query(
      'DELETE FROM message WHERE order_id IN (SELECT id FROM orders WHERE offer_id IN (?, ?, ?, ?))',
      [testOfferIdAccept, testOfferIdOther, testOfferIdDecline, testOfferIdOrder]
    );
    await db.query(
      'DELETE FROM proof WHERE order_id IN (SELECT id FROM orders WHERE offer_id IN (?, ?, ?, ?))',
      [testOfferIdAccept, testOfferIdOther, testOfferIdDecline, testOfferIdOrder]
    );
    await db.query(
      'DELETE FROM milestone WHERE order_id IN (SELECT id FROM orders WHERE offer_id IN (?, ?, ?, ?))',
      [testOfferIdAccept, testOfferIdOther, testOfferIdDecline, testOfferIdOrder]
    );
    await db.query(
      'DELETE FROM payment WHERE order_id IN (SELECT id FROM orders WHERE offer_id IN (?, ?, ?, ?))',
      [testOfferIdAccept, testOfferIdOther, testOfferIdDecline, testOfferIdOrder]
    );
    await db.query(
      'DELETE FROM report WHERE order_id IN (SELECT id FROM orders WHERE offer_id IN (?, ?, ?, ?))',
      [testOfferIdAccept, testOfferIdOther, testOfferIdDecline, testOfferIdOrder]
    );

    await db.query('DELETE FROM orders WHERE offer_id IN (?, ?, ?, ?)', [
      testOfferIdAccept,
      testOfferIdOther,
      testOfferIdDecline,
      testOfferIdOrder,
    ]);
    await db.query('DELETE FROM offer WHERE request_id IN (?, ?, ?)', [
      testRequestId,
      testRequestIdDecline,
      testRequestIdOrder,
    ]);
    await db.query('DELETE FROM request WHERE id IN (?, ?, ?)', [
      testRequestId,
      testRequestIdDecline,
      testRequestIdOrder,
    ]);

    await db.query(
      "INSERT INTO request (id, buyer_id, city_id, category_id, description, budget, timeline, status) VALUES (?, ?, ?, ?, 'Accept offer request.', 50000.00, '2026-12-31 23:59:59', 'submitted')",
      [testRequestId, buyerId, testCityId, testCategoryId]
    );
    await db.query(
      "INSERT INTO request (id, buyer_id, city_id, category_id, description, budget, timeline, status) VALUES (?, ?, ?, ?, 'Decline offer request.', 50000.00, '2026-12-31 23:59:59', 'submitted')",
      [testRequestIdDecline, buyerId, testCityId, testCategoryId]
    );
    await db.query(
      "INSERT INTO request (id, buyer_id, city_id, category_id, description, budget, timeline, status) VALUES (?, ?, ?, ?, 'Order flow request.', 50000.00, '2026-12-31 23:59:59', 'accepted')",
      [testRequestIdOrder, buyerId, testCityId, testCategoryId]
    );

    await db.query(
      "INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) VALUES (?, ?, ?, 45000.00, '3 days', 'Offer accept.', 'pending')",
      [testOfferIdAccept, testRequestId, testExpertId]
    );
    await db.query(
      "INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) VALUES (?, ?, ?, 48000.00, '4 days', 'Offer other.', 'pending')",
      [testOfferIdOther, testRequestId, testExpertId]
    );
    await db.query(
      "INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) VALUES (?, ?, ?, 48000.00, '4 days', 'Offer decline.', 'pending')",
      [testOfferIdDecline, testRequestIdDecline, testExpertId]
    );
    await db.query(
      "INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) VALUES (?, ?, ?, 45000.00, '3 days', 'Offer for order flow.', 'accepted')",
      [testOfferIdOrder, testRequestIdOrder, testExpertId]
    );
  } catch (err) {
    console.error('Failed test offers seed:', err);
  }
}

async function setupTestOrderFlow(buyerId) {
  if (!buyerId) return;
  const testOfferIdOrder = '110e8400-e29b-41d4-a716-446655440099';

  const o1 = '550e8400-e29b-41d4-a716-446655440099'; // in_progress
  const o2 = '550e8400-e29b-41d4-a716-446655440088'; // accepted
  const o3 = '550e8400-e29b-41d4-a716-446655440077'; // proof_submitted (approve)
  const o4 = '550e8400-e29b-41d4-a716-446655440066'; // proof_submitted (reject)
  const o5 = '550e8400-e29b-41d4-a716-446655440055'; // completed

  const m1 = '770e8400-e29b-41d4-a716-446655440001';
  const m3 = '770e8400-e29b-41d4-a716-446655440003';
  const m4 = '770e8400-e29b-41d4-a716-446655440004';
  const p3 = '880e8400-e29b-41d4-a716-446655440001';
  const p4 = '880e8400-e29b-41d4-a716-446655440002';

  const exp = 'ca9a80ff-0b83-4dca-975d-6c10c20808d9';

  try {
    await db.query('DELETE FROM review WHERE order_id IN (?, ?, ?, ?, ?)', [o1, o2, o3, o4, o5]);
    await db.query('DELETE FROM attachment WHERE order_id IN (?, ?, ?, ?, ?)', [
      o1,
      o2,
      o3,
      o4,
      o5,
    ]);
    await db.query('DELETE FROM message WHERE order_id IN (?, ?, ?, ?, ?)', [o1, o2, o3, o4, o5]);
    await db.query('DELETE FROM proof WHERE order_id IN (?, ?, ?, ?, ?)', [o1, o2, o3, o4, o5]);
    await db.query('DELETE FROM milestone WHERE order_id IN (?, ?, ?, ?, ?)', [o1, o2, o3, o4, o5]);
    await db.query('DELETE FROM payment WHERE order_id IN (?, ?, ?, ?, ?)', [o1, o2, o3, o4, o5]);
    await db.query('DELETE FROM report WHERE order_id IN (?, ?, ?, ?, ?)', [o1, o2, o3, o4, o5]);
    await db.query('DELETE FROM orders WHERE id IN (?, ?, ?, ?, ?)', [o1, o2, o3, o4, o5]);

    // Insert orders
    await db.query(
      "INSERT INTO orders (id, buyer_id, expert_id, offer_id, state) VALUES (?, ?, ?, ?, 'in_progress')",
      [o1, buyerId, exp, testOfferIdOrder]
    );
    await db.query(
      "INSERT INTO orders (id, buyer_id, expert_id, offer_id, state) VALUES (?, ?, ?, ?, 'accepted')",
      [o2, buyerId, exp, testOfferIdOrder]
    );
    await db.query(
      "INSERT INTO orders (id, buyer_id, expert_id, offer_id, state) VALUES (?, ?, ?, ?, 'proof_submitted')",
      [o3, buyerId, exp, testOfferIdOrder]
    );
    await db.query(
      "INSERT INTO orders (id, buyer_id, expert_id, offer_id, state) VALUES (?, ?, ?, ?, 'proof_submitted')",
      [o4, buyerId, exp, testOfferIdOrder]
    );
    await db.query(
      "INSERT INTO orders (id, buyer_id, expert_id, offer_id, state) VALUES (?, ?, ?, ?, 'completed')",
      [o5, buyerId, exp, testOfferIdOrder]
    );

    // Payments
    await db.query(
      "INSERT INTO payment (id, order_id, base_amount, platform_fee, total_amount, escrow_status, gateway_reference) VALUES (UUID(), ?, 45000.00, 0.00, 45000.00, 'captured', 'PAY-REF-999')",
      [o1]
    );
    await db.query(
      "INSERT INTO payment (id, order_id, base_amount, platform_fee, total_amount, escrow_status, gateway_reference) VALUES (UUID(), ?, 45000.00, 0.00, 45000.00, 'captured', 'PAY-REF-777')",
      [o3]
    );
    await db.query(
      "INSERT INTO payment (id, order_id, base_amount, platform_fee, total_amount, escrow_status, gateway_reference) VALUES (UUID(), ?, 45000.00, 0.00, 45000.00, 'captured', 'PAY-REF-666')",
      [o4]
    );
    await db.query(
      "INSERT INTO payment (id, order_id, base_amount, platform_fee, total_amount, escrow_status, gateway_reference) VALUES (UUID(), ?, 45000.00, 0.00, 45000.00, 'released', 'PAY-REF-555')",
      [o5]
    );

    // Milestones
    await db.query(
      "INSERT INTO milestone (id, order_id, state, notes) VALUES (?, ?, 'in_progress', 'Service execution started.')",
      [m1, o1]
    );
    await db.query(
      "INSERT INTO milestone (id, order_id, state, notes) VALUES (?, ?, 'proof_submitted', 'Milestone ready for review.')",
      [m3, o3]
    );
    await db.query(
      "INSERT INTO milestone (id, order_id, state, notes) VALUES (?, ?, 'proof_submitted', 'Draft ready for review.')",
      [m4, o4]
    );

    // Proofs
    await db.query(
      "INSERT INTO proof (id, order_id, milestone_id, notes, approval_status) VALUES (?, ?, ?, 'Work finished.', 'pending')",
      [p3, o3, m3]
    );
    await db.query(
      "INSERT INTO proof (id, order_id, milestone_id, notes, approval_status) VALUES (?, ?, ?, 'Draft finished.', 'pending')",
      [p4, o4, m4]
    );

    // Messages
    await db.query(
      "INSERT INTO message (id, order_id, sender_id, sender_role, content) VALUES (?, ?, ?, 'buyer', 'Kickoff chat.')",
      [m1, o1, buyerId]
    );

    // Attachments
    await db.query(
      "INSERT INTO attachment (id, buyer_id, order_id, message_id, file_url, file_type, file_size_bytes, scan_status) VALUES (UUID(), ?, ?, ?, '/uploads/sample.png', 'image', 1024, 'clean')",
      [buyerId, o1, m1]
    );
  } catch (err) {
    console.error('Failed test order flow seed:', err);
  }
}

function runNewman(foldersToRun) {
  return new Promise((resolve, reject) => {
    const options = {
      collection: path.join(scratchDir, 'collection.json'),
      environment: path.join(scratchDir, 'environment.json'),
      reporters: 'cli',
    };
    if (foldersToRun && foldersToRun.length > 0) {
      options.folder = foldersToRun;
    }

    newman.run(options).on('done', function (err, summary) {
      if (err) {
        reject(err);
        return;
      }
      const envValues = summary.environment.values.members.map((m) => ({
        key: m.key,
        value: m.value,
        type: m.type || 'text',
        enabled: m.enabled !== false,
      }));
      environmentObject.values = envValues;
      fs.writeFileSync(
        path.join(scratchDir, 'environment.json'),
        JSON.stringify(environmentObject, null, 2),
        'utf8'
      );
      const failures = summary.run.failures ? summary.run.failures.length : 0;
      resolve({ failures, summary });
    });
  });
}

async function run() {
  await setupSuspendedUser();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Phase 1: Authentication, Buyer Profile, Buyer Request, Notifications, Saved Experts, Blocklist
  const phase1Folders = [
    'Authentication',
    'Buyer Profile',
    'Buyer Request',
    'Notifications',
    'Saved Experts',
    'Blocklist',
  ];
  console.log('--- Phase 1: Running core account folders ---');
  const phase1Result = await runNewman(phase1Folders);

  const updatedEnv = JSON.parse(fs.readFileSync(path.join(scratchDir, 'environment.json'), 'utf8'));
  const jwtTokenVar = updatedEnv.values.find((v) => v.key === 'jwtToken');
  const jwtToken = jwtTokenVar ? jwtTokenVar.value : null;
  let freshBuyerId = null;

  if (jwtToken) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(jwtToken);
      if (decoded && decoded.id) {
        freshBuyerId = decoded.id;
      }
    } catch (e) {
      // ignore decode error
    }
  }

  if (!freshBuyerId) {
    const buyerIdVar = updatedEnv.values.find((v) => v.key === 'buyerId');
    freshBuyerId = buyerIdVar ? buyerIdVar.value : null;
  } else {
    const buyerIdVar = updatedEnv.values.find((v) => v.key === 'buyerId');
    if (buyerIdVar) buyerIdVar.value = freshBuyerId;
    fs.writeFileSync(
      path.join(scratchDir, 'environment.json'),
      JSON.stringify(updatedEnv, null, 2),
      'utf8'
    );
  }

  let totalFailures = phase1Result.failures;

  if (freshBuyerId) {
    console.log('--- Phase 1 Complete. Fresh buyerId: ' + freshBuyerId + ' ---');
    await setupTestOffers(freshBuyerId);
    await setupTestOrderFlow(freshBuyerId);

    const phase2Folders = [
      'Offers',
      'Orders',
      'Payments',
      'Milestones',
      'Proof',
      'Messages',
      'Attachments',
      'Reviews',
      'Reports',
    ];
    console.log('--- Phase 2: Running transactional folders ---');
    const phase2Result = await runNewman(phase2Folders);
    totalFailures += phase2Result.failures;
  }

  console.log('\n=== TEST RUN COMPLETED. Total Failures: ' + totalFailures + ' ===');
  process.exit(totalFailures > 0 ? 1 : 0);
}

run();
