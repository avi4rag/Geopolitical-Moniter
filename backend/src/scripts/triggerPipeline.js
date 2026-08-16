import 'dotenv/config';
import http from 'http';

const req = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/admin/pipeline/run',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('Pipeline run trigger response:', body);
    });
  }
);

req.on('error', (err) => {
  console.log('Local server not running on 3000 (that is fine during CLI scripts)');
});

req.write(JSON.stringify({ extractBatchSize: 5, impactBatchSize: 20 }));
req.end();
