const http = require('http');

function testServer(port = 5173) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      console.log(`✅ Server responding on port ${port}`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Server NOT responding on port ${port}`);
      console.log(`Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ Timeout - Server not responding on port ${port}`);
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('Testing server connectivity...');
  
  const ports = [5173, 3000, 5174];
  
  for (const port of ports) {
    console.log(`\nTesting port ${port}...`);
    const isResponding = await testServer(port);
    
    if (isResponding) {
      console.log(`🎉 SUCCESS: Server is running on http://localhost:${port}/`);
      process.exit(0);
    }
  }
  
  console.log('\n❌ FAILED: No server found on any tested ports');
  console.log('The development server is likely not running properly.');
  process.exit(1);
}

main();