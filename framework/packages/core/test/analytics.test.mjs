import test from 'node:test';
import assert from 'node:assert/strict';
import { analyticsMiddleware, getAnalyticsScript } from '../src/analytics.js';

test('analyticsMiddleware injects script before </head>', async () => {
  const middleware = analyticsMiddleware();
  const mockNext = async () => new Response(
    '<!DOCTYPE html><html><head><title>Test</title></head><body>Content</body></html>',
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
  
  const response = await middleware({}, mockNext);
  const html = await response.text();
  
  assert.ok(html.includes('<script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>'));
  assert.ok(html.includes('</head>'));
  assert.ok(html.indexOf('script.js') < html.indexOf('</head>'));
});

test('analyticsMiddleware uses debug script when debug=true', async () => {
  const middleware = analyticsMiddleware({ debug: true });
  const mockNext = async () => new Response(
    '<html><body>Content</body></html>',
    { headers: { 'content-type': 'text/html' } }
  );
  
  const response = await middleware({}, mockNext);
  const html = await response.text();
  
  assert.ok(html.includes('script.debug.js'));
});

test('analyticsMiddleware injects before </body> when no </head>', async () => {
  const middleware = analyticsMiddleware();
  const mockNext = async () => new Response(
    '<html><body>Content</body></html>',
    { headers: { 'content-type': 'text/html' } }
  );
  
  const response = await middleware({}, mockNext);
  const html = await response.text();
  
  assert.ok(html.includes('<script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>'));
  assert.ok(html.indexOf('script.js') < html.indexOf('</body>'));
});

test('analyticsMiddleware passes through non-HTML responses', async () => {
  const middleware = analyticsMiddleware();
  const mockNext = async () => new Response(
    '{"data": "test"}',
    { headers: { 'content-type': 'application/json' } }
  );
  
  const response = await middleware({}, mockNext);
  const text = await response.text();
  
  assert.equal(text, '{"data": "test"}');
  assert.ok(!text.includes('script'));
});

test('analyticsMiddleware uses custom scriptSrc', async () => {
  const middleware = analyticsMiddleware({ scriptSrc: 'https://custom.com/analytics.js' });
  const mockNext = async () => new Response(
    '<html><head></head><body>Content</body></html>',
    { headers: { 'content-type': 'text/html' } }
  );
  
  const response = await middleware({}, mockNext);
  const html = await response.text();
  
  assert.ok(html.includes('https://custom.com/analytics.js'));
});

test('getAnalyticsScript returns production script by default', () => {
  const script = getAnalyticsScript();
  assert.equal(script, '<script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>');
});

test('getAnalyticsScript returns debug script when debug=true', () => {
  const script = getAnalyticsScript({ debug: true });
  assert.equal(script, '<script defer src="https://cdn.vercel-insights.com/v1/script.debug.js"></script>');
});

test('getAnalyticsScript uses custom scriptSrc', () => {
  const script = getAnalyticsScript({ scriptSrc: 'https://example.com/custom.js' });
  assert.equal(script, '<script defer src="https://example.com/custom.js"></script>');
});
