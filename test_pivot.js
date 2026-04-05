const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data || {}));
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log("1. Triggering Emergency...");
  await post('/api/emergency', { type: 'Accident', impact: 40 });
  
  console.log("2. Accepting Dispatch (AMB-01)...");
  await post('/api/accept-dispatch', { ambulanceId: 'AMB-01' });

  // Wait for it to enter IN_TRANSIT (it needs to reach patient first)
  // Let's poll until ambulance phase is IN_TRANSIT. It might take 10-15 seconds.
  console.log("3. Waiting for IN_TRANSIT phase...");
  let inTransit = false;
  let status;
  for(let i=0; i<30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    status = await get('/api/status');
    const amb = status.ambulances.find(a => a.id === status.dispatchedAmbulanceId);
    if (amb && amb.phase === 'IN_TRANSIT') {
      inTransit = true;
      break;
    }
  }

  if(!inTransit) {
    console.log("Failed to reach IN_TRANSIT");
    return;
  }
  
  console.log("4. In Transit! Current Hospital:", status.hospital.name);
  let oldHospId = status.hospital.id;

  console.log("5. Saturating hospital beds to 0...");
  await post('/api/test-saturate');

  console.log("6. Waiting up to 35 seconds for AI Pivot (Simulation engine checks every 30s)...");
  let pivoted = false;
  for(let i=0; i<35; i++) {
    await new Promise(r => setTimeout(r, 1000));
    status = await get('/api/status');
    if (status.hospital && status.hospital.id !== oldHospId) {
       console.log(`✅ SUCCESS! Pivoted to ${status.hospital.name}`);
       pivoted = true;
       break;
    }
  }

  if(!pivoted) {
    console.log("❌ Failed to pivot within timeout.");
  }
}

run().catch(console.error);
