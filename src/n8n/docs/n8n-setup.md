# n8n Integration Setup Guide

## 1. Recommended Folder Structure

```
src/
  n8n/
    workflows/                # All exported n8n workflow JSON files
      blogging-automation.json
      ... (future workflows)
    docs/
      n8n-setup.md           # This setup guide
    scripts/                  # (Optional) Local test scripts for n8n integration
      test-n8n-webhook.ts
```

- **workflows/**: All n8n workflow JSON exports (version control, backup, sharing)
- **docs/**: Setup, integration, and best practices
- **scripts/**: (Optional) Local scripts to test n8n webhooks

---

## 2. Exporting/Importing Workflows

- **Export:**
  1. Open your workflow in n8n UI
  2. Click the three-dot menu (top right)
  3. Click "Export"
  4. Save the `.json` file in `src/n8n/workflows/`

- **Import:**
  1. In n8n UI, click "Import"
  2. Select the JSON file from `src/n8n/workflows/`

---

## 3. Triggering n8n Workflow from Next.js

- Use n8n's Webhook node as the workflow trigger.
- Example Webhook URL: `https://n8n.yourdomain.com/webhook/blogging-automation`
- In your Next.js backend, trigger the workflow by POSTing to this URL:

```js
await fetch('https://n8n.yourdomain.com/webhook/blogging-automation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'USER_ID' })
});
```
- Only send `userId` in the body. n8n will fetch all other details from the database.

---

## 4. n8n Fetching User Data from Postgres

- In your n8n workflow, after the Webhook node:
  1. Add a PostgreSQL node.
  2. Use the incoming `userId` from the webhook body as a parameter.
  3. Query user, onboarding, plan, and subscription details as needed:

```sql
SELECT * FROM "User" WHERE id = {{$json["userId"]}};
SELECT * FROM "Onboarding" WHERE "userId" = {{$json["userId"]}};
SELECT * FROM "UserSubscription" WHERE "userId" = {{$json["userId"]}} AND "endDate" > NOW();
-- etc.
```
- Use the output of these queries in your workflow for all automation steps.

---

## 5. Best Practices
- Always export and version control your workflows.
- Use environment variables for DB/API credentials in n8n.
- Keep workflow JSONs up to date with production.
- Document any custom webhook endpoints or approval flows in this folder.

---

**This structure and process will keep your n8n integration clean, maintainable, and scalable!** 