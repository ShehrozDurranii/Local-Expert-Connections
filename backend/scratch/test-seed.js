const db = require('../src/config/database');

async function testSeed() {
  const buyerId = '95b48f04-fc13-4563-96a0-2d01c6d8b9d3';

  const testRequestId = '550e8400-e29b-41d4-a716-446655440022';
  const testRequestIdDecline = '550e8400-e29b-41d4-a716-446655440025';
  const testOfferIdAccept = '110e8400-e29b-41d4-a716-446655440033';
  const testOfferIdOther = '110e8400-e29b-41d4-a716-446655440044';
  const testOfferIdDecline = '110e8400-e29b-41d4-a716-446655440055';

  const testRequestIdOrder = '550e8400-e29b-41d4-a716-446655440090';
  const testOfferIdOrder = '110e8400-e29b-41d4-a716-446655440099';

  const o1 = '550e8400-e29b-41d4-a716-446655440099';
  const o2 = '550e8400-e29b-41d4-a716-446655440088';
  const o3 = '550e8400-e29b-41d4-a716-446655440077';
  const o4 = '550e8400-e29b-41d4-a716-446655440066';
  const o5 = '550e8400-e29b-41d4-a716-446655440055';

  const m1 = '770e8400-e29b-41d4-a716-446655440001';
  const m3 = '770e8400-e29b-41d4-a716-446655440003';
  const m4 = '770e8400-e29b-41d4-a716-446655440004';
  const p3 = '880e8400-e29b-41d4-a716-446655440001';
  const p4 = '880e8400-e29b-41d4-a716-446655440002';

  const exp = 'ca9a80ff-0b83-4dca-975d-6c10c20808d9';
  const testCityId = '3b687684-1287-434c-870a-5c5b414a67cc';
  const testCategoryId = '393a36a3-5ef8-4290-be33-85766506ecd6';

  try {
    // 1. Cleanup
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
    await db.query('DELETE FROM orders WHERE offer_id IN (?, ?, ?, ?) OR id IN (?, ?, ?, ?, ?)', [
      testOfferIdAccept,
      testOfferIdOther,
      testOfferIdDecline,
      testOfferIdOrder,
      o1,
      o2,
      o3,
      o4,
      o5,
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

    // 2. Seed requests
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

    // 3. Seed offers
    await db.query(
      "INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) VALUES (?, ?, ?, 45000.00, '3 days', 'Offer accept.', 'pending')",
      [testOfferIdAccept, testRequestId, exp]
    );
    await db.query(
      "INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) VALUES (?, ?, ?, 48000.00, '4 days', 'Offer other.', 'pending')",
      [testOfferIdOther, testRequestId, exp]
    );
    await db.query(
      "INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) VALUES (?, ?, ?, 48000.00, '4 days', 'Offer decline.', 'pending')",
      [testOfferIdDecline, testRequestIdDecline, exp]
    );
    await db.query(
      "INSERT INTO offer (id, request_id, expert_id, price, eta, scope_notes, status) VALUES (?, ?, ?, 45000.00, '3 days', 'Offer for order flow.', 'accepted')",
      [testOfferIdOrder, testRequestIdOrder, exp]
    );

    // 4. Seed orders
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

    // 5. Seed payments
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

    // 6. Seed milestones
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

    // 7. Seed proofs
    await db.query(
      "INSERT INTO proof (id, order_id, milestone_id, notes, approval_status) VALUES (?, ?, ?, 'Work finished.', 'pending')",
      [p3, o3, m3]
    );
    await db.query(
      "INSERT INTO proof (id, order_id, milestone_id, notes, approval_status) VALUES (?, ?, ?, 'Draft finished.', 'pending')",
      [p4, o4, m4]
    );

    console.log('Complete decoupled test seed executed successfully!');
  } catch (err) {
    console.error('ERROR SEEDING:', err);
  }
  process.exit(0);
}
testSeed();
