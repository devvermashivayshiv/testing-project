const N8N_WEBHOOK_URL = 'https://devtesting.app.n8n.cloud/webhook/blogging-automation'; // Replace with your actual production URL
const userId = process.argv[2] || 'REPLACE_WITH_USER_ID';

async function triggerWorkflow() {
  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await res.text();
  console.log('n8n response:', data);
}

triggerWorkflow(); 