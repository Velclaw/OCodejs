/**
 * Vercel Web Analytics integration for OCodejs
 * 
 * Provides middleware to inject Vercel Analytics tracking script into HTML responses.
 * The script is loaded from Vercel's CDN and tracks page views automatically.
 */

/**
 * Creates middleware that injects Vercel Analytics script into HTML responses.
 * The script is inserted before the closing </head> tag if present, otherwise
 * before the closing </body> tag, or at the end of the response if neither exists.
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} [options.debug=false] - Use debug version of analytics script
 * @param {string} [options.scriptSrc] - Custom script source URL (optional)
 * @returns {Function} Middleware function (request, next) => Promise<Response>
 * 
 * @example
 * import { createOCodeServer } from '@ocodejs/core';
 * import { analyticsMiddleware } from '@ocodejs/core/analytics';
 * 
 * const { server } = await createOCodeServer({
 *   appDirectory: './app',
 *   middleware: [analyticsMiddleware()]
 * });
 */
export function analyticsMiddleware({ debug = false, scriptSrc } = {}) {
  // Determine script source: custom, debug, or production
  const src = scriptSrc || (debug 
    ? 'https://cdn.vercel-insights.com/v1/script.debug.js'
    : 'https://cdn.vercel-insights.com/v1/script.js');
  
  const analyticsScript = `<script defer src="${src}"></script>`;

  return async function analytics(request, next) {
    const response = await next();
    
    // Only process HTML responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      return response;
    }

    // Read the response body
    const html = await response.text();
    
    // Inject analytics script into HTML
    let modifiedHtml = html;
    
    // Try to inject before </head> (preferred location)
    if (html.includes('</head>')) {
      modifiedHtml = html.replace('</head>', `${analyticsScript}\n</head>`);
    }
    // Otherwise, try before </body>
    else if (html.includes('</body>')) {
      modifiedHtml = html.replace('</body>', `${analyticsScript}\n</body>`);
    }
    // Fallback: append to end of HTML
    else {
      modifiedHtml = html + analyticsScript;
    }

    // Return new response with modified HTML
    return new Response(modifiedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  };
}

/**
 * Generates HTML snippet for Vercel Analytics that can be manually injected into layouts.
 * Use this if you prefer to manually add analytics to your layout files instead of using middleware.
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} [options.debug=false] - Use debug version of analytics script
 * @param {string} [options.scriptSrc] - Custom script source URL (optional)
 * @returns {string} HTML script tag for Vercel Analytics
 * 
 * @example
 * import { getAnalyticsScript } from '@ocodejs/core/analytics';
 * 
 * export function render({ children }) {
 *   return `
 *     <!DOCTYPE html>
 *     <html>
 *       <head>
 *         <title>My App</title>
 *         ${getAnalyticsScript()}
 *       </head>
 *       <body>${children}</body>
 *     </html>
 *   `;
 * }
 */
export function getAnalyticsScript({ debug = false, scriptSrc } = {}) {
  const src = scriptSrc || (debug 
    ? 'https://cdn.vercel-insights.com/v1/script.debug.js'
    : 'https://cdn.vercel-insights.com/v1/script.js');
  
  return `<script defer src="${src}"></script>`;
}
