/**
 * Weather routes.
 *
 * GET /api/weather          normalised forecast plus deterministic risk
 * GET /api/weather/search   place name to coordinates
 * GET /api/weather/reverse  high-precision coordinates to place name
 * GET /api/weather/detect   automatic IP-based location detection fallback
 *
 * The forecast and the risk assessment need no AI, so they are returned
 * separately from the advisory. That way the weather panel renders instantly and
 * still works when every AI provider is exhausted.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { fail } from '../lib/http.ts';
import { geocode, reverseGeocode, detectLocationByIp, getWeather, assessRisk } from '../services/weather.ts';

const weather = new Hono();

const coordsSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  label: z.string().max(120).optional(),
});

weather.get('/', async (c) => {
  const parsed = coordsSchema.safeParse({
    latitude: c.req.query('latitude'),
    longitude: c.req.query('longitude'),
    label: c.req.query('label'),
  });

  if (!parsed.success) {
    return fail(c, 'invalid_request', z.prettifyError(parsed.error));
  }

  const { latitude, longitude, label } = parsed.data;
  const snapshot = await getWeather({
    latitude,
    longitude,
    label: label ?? `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
  });

  c.header('Cache-Control', 'public, max-age=600');
  return c.json({ weather: snapshot, risk: assessRisk(snapshot) });
});

weather.get('/search', async (c) => {
  const query = c.req.query('q')?.trim();
  if (!query || query.length < 2) {
    return fail(c, 'invalid_request', 'Provide a place name of at least two characters');
  }

  const location = await geocode(query);
  if (!location) return c.json({ location: null });

  c.header('Cache-Control', 'public, max-age=86400');
  return c.json({ location });
});

weather.get('/reverse', async (c) => {
  const parsed = coordsSchema.safeParse({
    latitude: c.req.query('latitude'),
    longitude: c.req.query('longitude'),
  });

  if (!parsed.success) {
    return fail(c, 'invalid_request', z.prettifyError(parsed.error));
  }

  const { latitude, longitude } = parsed.data;
  const location = await reverseGeocode(latitude, longitude);

  c.header('Cache-Control', 'public, max-age=86400');
  return c.json({ location });
});

weather.get('/detect', async (c) => {
  const location = await detectLocationByIp();
  return c.json({ location });
});

export default weather;
