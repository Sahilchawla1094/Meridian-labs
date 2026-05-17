const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Ensure the leads table exists (runs on cold start)
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id          BIGINT PRIMARY KEY,
      date        TEXT,
      name        TEXT,
      email       TEXT,
      phone       TEXT    DEFAULT '',
      brief       TEXT,
      status      TEXT    DEFAULT 'New',
      notes       TEXT    DEFAULT '',
      source      TEXT    DEFAULT 'contact-form',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  // Add phone column if table already existed without it
  await sql`
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT ''
  `;
}

module.exports = async function handler(req, res) {
  // CORS — allow the site itself to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await ensureTable();

    // ── GET — return all leads newest first ───────────────────────
    if (req.method === 'GET') {
      const rows = await sql`SELECT id, date, name, email, phone, brief, status, notes, source FROM leads ORDER BY created_at DESC`;
      return res.json(rows);
    }

    // ── POST — mutate ─────────────────────────────────────────────
    if (req.method === 'POST') {
      const { action, ...data } = req.body;

      if (action === 'add') {
        await sql`
          INSERT INTO leads (id, date, name, email, phone, brief, status, notes, source)
          VALUES (
            ${data.id},   ${data.date},  ${data.name},  ${data.email},
            ${data.phone || ''}, ${data.brief}, ${data.status || 'New'},
            ${data.notes || ''}, ${data.source || 'contact-form'}
          )
          ON CONFLICT (id) DO NOTHING
        `;
        return res.json({ success: true });
      }

      if (action === 'update') {
        const { id, status, notes, name, email, brief, source } = data;
        // Full edit (from modal) — update all provided fields
        if (name !== undefined) {
          const { phone } = data;
          await sql`
            UPDATE leads
            SET name   = ${name},
                email  = ${email},
                phone  = ${phone || ''},
                brief  = ${brief},
                source = ${source},
                status = ${status},
                notes  = ${notes}
            WHERE id = ${id}
          `;
        } else if (status !== undefined && notes !== undefined) {
          await sql`UPDATE leads SET status=${status}, notes=${notes} WHERE id=${id}`;
        } else if (status !== undefined) {
          await sql`UPDATE leads SET status=${status} WHERE id=${id}`;
        } else if (notes !== undefined) {
          await sql`UPDATE leads SET notes=${notes} WHERE id=${id}`;
        }
        return res.json({ success: true });
      }

      if (action === 'delete') {
        await sql`DELETE FROM leads WHERE id=${data.id}`;
        return res.json({ success: true });
      }

      if (action === 'clear') {
        await sql`DELETE FROM leads`;
        return res.json({ success: true });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[leads API]', err);
    return res.status(500).json({ error: err.message });
  }
};
