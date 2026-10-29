const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url || options.path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: options.headers || {},
    };

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data,
          cookies: res.headers['set-cookie'] || [],
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function extractCookie(cookieArray) {
  if (!cookieArray || cookieArray.length === 0) return '';
  for (const c of cookieArray) {
    if (c.startsWith('findit_token=')) {
      return c.split(';')[0];
    }
  }
  return '';
}

async function runTests() {
  console.log('🚀 Starting FindIt Comprehensive End-to-End Verification Suite\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Landing Page
    console.log('--- Test 1: Landing Page & Public Navigation ---');
    const homeRes = await request({ path: '/' });
    assert(homeRes.status === 200, 'Home page serves with HTTP 200');
    assert(
      typeof homeRes.data === 'string' && homeRes.data.includes('FindIt'),
      'Home page contains FindIt brand'
    );

    // 2. Categories
    console.log('\n--- Test 2: Category Taxonomy ---');
    const catRes = await request({ path: '/api/categories' });
    assert(catRes.status === 200, 'Categories endpoint returns 200');
    assert(catRes.data.categories?.length >= 8, `Found ${catRes.data.categories?.length} categories`);

    // 3. Listings Browse & Search
    console.log('\n--- Test 3: Browse & Search Functionality ---');
    const allListings = await request({ path: '/api/listings' });
    assert(allListings.status === 200, 'Listings endpoint returns 200');
    assert(allListings.data.items?.length > 0, `Catalog contains ${allListings.data.items?.length} items`);

    const searchRes = await request({ path: '/api/listings?q=Bellroy' });
    assert(searchRes.data.items?.length > 0, 'Search keyword "Bellroy" returns wallet');

    const lostOnly = await request({ path: '/api/listings?type=LOST' });
    const allLost = lostOnly.data.items?.every((i) => i.type === 'LOST');
    assert(allLost, 'Filter type=LOST returns strictly LOST items');

    const foundOnly = await request({ path: '/api/listings?type=FOUND' });
    const allFound = foundOnly.data.items?.every((i) => i.type === 'FOUND');
    assert(allFound, 'Filter type=FOUND returns strictly FOUND items');

    // 4. Privacy Protection: Verify No Leaked PII
    console.log('\n--- Test 4: Privacy & Anti-Scam Protection ---');
    const firstItem = allListings.data.items[0];
    const detailRes = await request({ path: `/api/listings/${firstItem.id}` });
    assert(detailRes.status === 200, 'Public listing detail page returns 200');
    assert(
      detailRes.data.item.user.email === null,
      'Public listing masks/hides raw email from unauthenticated visitors'
    );
    assert(
      detailRes.data.item.user.phone === null,
      'Public listing masks/hides raw phone from unauthenticated visitors'
    );

    // 5. Authentication: Login User & Admin
    console.log('\n--- Test 5: Authentication & Session Management ---');
    const loginFail = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'sarah@example.com', password: 'WrongPassword999' }
    );
    assert(loginFail.status === 401, 'Invalid password correctly rejected with HTTP 401');

    const userLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'sarah@example.com', password: 'UserPass123!' }
    );
    assert(userLogin.status === 200, 'Sarah user logged in successfully (HTTP 200)');
    const userCookie = extractCookie(userLogin.cookies);
    assert(userCookie.length > 0, 'findit_token session cookie received');

    // Auth Me check
    const meRes = await request({
      path: '/api/auth/me',
      headers: { Cookie: userCookie },
    });
    assert(meRes.data.user?.email === 'sarah@example.com', 'Session verified as Sarah Jenkins');

    // Admin Login
    const adminLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'admin@findit.org', password: 'AdminPass123!' }
    );
    assert(adminLogin.status === 200, 'Admin logged in successfully');
    const adminCookie = extractCookie(adminLogin.cookies);
    assert(adminLogin.data.user?.role === 'ADMIN', 'Admin user role is ADMIN');

    // 6. Report Submission Flow
    console.log('\n--- Test 6: Report an Item (Create, Persist, Validate) ---');
    const categoryId = catRes.data.categories[0].id;
    const newLostPayload = {
      type: 'LOST',
      title: 'Sony Alpha A7 IV Camera in Leather Holster',
      categoryId,
      description: 'Black full-frame mirrorless camera lost near Westlake light rail station entrance bench.',
      brand: 'Sony',
      dateLostFound: new Date().toISOString(),
      approxLocation: 'Westlake Light Rail Station bench',
      city: 'Downtown Seattle',
      preferredContactMethod: 'IN_APP',
      privacyPreference: 'STRICT_IN_APP',
      rewardAmount: '$150 Reward',
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
    };

    const submitRes = await request(
      { path: '/api/listings', method: 'POST', headers: { Cookie: userCookie } },
      newLostPayload
    );
    assert(submitRes.status === 200, 'New report submitted with HTTP 200');
    assert(
      submitRes.data.referenceId?.startsWith('FID-2026-'),
      `Generated unique reference ID: ${submitRes.data.referenceId}`
    );
    const createdItemId = submitRes.data.item.id;

    // Verify Item is Persistently Queryable
    const verifyItemRes = await request({ path: `/api/listings/${createdItemId}` });
    assert(verifyItemRes.data.item.title === newLostPayload.title, 'Newly submitted item persisted in SQLite database');

    // 7. Protected Contact Inquiry Flow
    console.log('\n--- Test 7: Safe In-App Contact Request & Messaging ---');
    // Marcus logs in to contact Sarah about her newly lost camera
    const marcusLogin = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: 'marcus@example.com', password: 'UserPass123!' }
    );
    const marcusCookie = extractCookie(marcusLogin.cookies);

    const contactRes = await request(
      { path: `/api/listings/${createdItemId}/contact`, method: 'POST', headers: { Cookie: marcusCookie } },
      {
        initialMessage: 'Hi Sarah, I believe security at Westlake Station has your Sony camera in safe custody.',
        verificationDetails: 'Has a 35mm f/1.4 lens attached with a brown leather strap.',
      }
    );
    assert(contactRes.status === 200, 'Protected contact inquiry dispatched without leaking raw personal info');

    // Sarah checks requests
    const sarahInbox = await request({
      path: '/api/contact-requests',
      headers: { Cookie: userCookie },
    });
    assert(sarahInbox.data.requests?.length > 0, 'Sarah received protected contact request thread');
    const thread = sarahInbox.data.requests.find((r) => r.itemId === createdItemId);
    assert(thread !== undefined, 'Thread found matching created item');

    // Sarah replies to thread
    const replyRes = await request(
      { path: '/api/contact-requests', method: 'POST', headers: { Cookie: userCookie } },
      {
        contactRequestId: thread.id,
        content: 'Thank you Marcus! Going to the station customer desk now.',
      }
    );
    assert(replyRes.status === 200, 'Interactive in-app message response posted');

    // 8. Complaints & Support Ticket Flow
    console.log('\n--- Test 8: Complaints & Support Ticket Resolution ---');
    const complaintPayload = {
      subject: 'Inquiry regarding transit lost-and-found handover integration',
      category: 'OTHER',
      description: 'Could you verify if King Street station transit kiosk is open on Sunday afternoon for item returns?',
      priority: 'LOW',
    };

    const compRes = await request(
      { path: '/api/complaints', method: 'POST', headers: { Cookie: userCookie } },
      complaintPayload
    );
    assert(compRes.status === 200, 'Complaint ticket filed successfully');
    assert(compRes.data.referenceId?.startsWith('CMP-2026-'), `Ticket Reference: ${compRes.data.referenceId}`);
    const complaintId = compRes.data.complaint.id;

    // Admin resolves complaint
    const adminCompResolve = await request(
      { path: `/api/complaints/${complaintId}`, method: 'PATCH', headers: { Cookie: adminCookie } },
      {
        status: 'RESOLVED',
        adminResponse: 'Yes, King Street Station customer service desk is staffed 24/7 for safe exchanges.',
      }
    );
    assert(adminCompResolve.status === 200, 'Admin resolved ticket with resolution note');
    assert(adminCompResolve.data.complaint.status === 'RESOLVED', 'Ticket status updated to RESOLVED');

    // 9. Match Suggestion Engine
    console.log('\n--- Test 9: Match Suggestion Engine ---');
    const matchesRes = await request({
      path: '/api/matches',
      headers: { Cookie: userCookie },
    });
    assert(matchesRes.status === 200, 'Matches endpoint returned HTTP 200');
    assert(Array.isArray(matchesRes.data.matches), 'Matches array returned');
    console.log(`  ℹ️  Identified ${matchesRes.data.matches.length} smart correlations for Sarah's reports.`);

    // 10. Role-Based Access Control (RBAC) & Admin Controls
    console.log('\n--- Test 10: Role-Based Access Control & Admin Safeguards ---');
    const userAdminAttempt = await request({
      path: '/api/admin/metrics',
      headers: { Cookie: userCookie },
    });
    assert(userAdminAttempt.status === 403, 'Normal user blocked from admin metrics (HTTP 403 Forbidden)');

    const adminMetricsRes = await request({
      path: '/api/admin/metrics',
      headers: { Cookie: adminCookie },
    });
    assert(adminMetricsRes.status === 200, 'Admin successfully accesses analytics metrics');
    assert(adminMetricsRes.data.metrics.totalReports > 0, `Total reports tracked: ${adminMetricsRes.data.metrics.totalReports}`);

    // Admin Moderation: Feature Item
    const featureRes = await request(
      { path: '/api/admin/moderation', method: 'POST', headers: { Cookie: adminCookie } },
      { itemId: createdItemId, isFeatured: true }
    );
    assert(featureRes.status === 200, 'Admin successfully featured listing');
    assert(featureRes.data.item.isFeatured === true, 'Listing marked as featured in database');

    console.log('\n======================================================');
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test run error:', err);
    process.exit(1);
  }
}

runTests();
