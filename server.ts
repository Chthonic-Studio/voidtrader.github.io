/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory cache for Warframe Market API calls
const serverCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60s TTL

function getCached(key: string) {
  const item = serverCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  serverCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
}

// Proxy for Warframe Market v2 orders
app.get('/api/wf-market/orders/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const cacheKey = `orders_${slug}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const upstreamUrl = `https://api.warframe.market/v2/orders/item/${encodeURIComponent(slug)}`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'VoidTrader/1.0 (warframe-trade-app)',
        'Accept': 'application/json',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Upstream error: ${upstreamRes.status}` });
    }

    const data = await upstreamRes.json();
    setCache(cacheKey, data);
    res.json(data);
  } catch (err: any) {
    console.error('Warframe market proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch upstream orders', message: err.message });
  }
});

// Proxy for Warframe Market v1 statistics (48h and 90d closed transactions)
app.get('/api/wf-market/statistics/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const cacheKey = `stats_${slug}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const upstreamUrl = `https://api.warframe.market/v1/items/${encodeURIComponent(slug)}/statistics`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'VoidTrader/1.0 (warframe-trade-app)',
        'Platform': 'pc',
        'Language': 'en',
        'Accept': 'application/json',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Upstream stats error: ${upstreamRes.status}` });
    }

    const data = await upstreamRes.json();
    setCache(cacheKey, data);
    res.json(data);
  } catch (err: any) {
    console.error('Warframe market stats proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch upstream statistics', message: err.message });
  }
});

// Proxy for Warframe Market v2 item details
app.get('/api/wf-market/items/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const cacheKey = `item_${slug}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const upstreamUrl = `https://api.warframe.market/v2/items/${encodeURIComponent(slug)}`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'VoidTrader/1.0 (warframe-trade-app)',
        'Accept': 'application/json',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Upstream item error: ${upstreamRes.status}` });
    }

    const data = await upstreamRes.json();
    setCache(cacheKey, data);
    res.json(data);
  } catch (err: any) {
    console.error('Warframe market item proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch upstream item detail', message: err.message });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoidTrader server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
