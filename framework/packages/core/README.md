# @ocodejs/core

Early Node.js HTTP runtime for OCodejs file-system routes. Exports `createOCodeServer`, `listen`, and `composeMiddleware`. Page/layout modules must currently be runnable JavaScript returning HTML strings or a `Response`. TypeScript/JSX compilation, API routes, HMR, and active loading/error boundaries are not implemented.

## Vercel Web Analytics

The core package includes built-in support for [Vercel Web Analytics](https://vercel.com/docs/analytics), allowing you to track page views and visitor metrics for your OCodejs application.

### Installation

The `@vercel/analytics` package is already included as a dependency. No additional installation is required.

### Usage

#### Option 1: Using Middleware (Recommended)

The easiest way to add analytics is using the `analyticsMiddleware`, which automatically injects the analytics script into all HTML responses:

```javascript
import { createOCodeServer, analyticsMiddleware } from '@ocodejs/core';

const { server } = await createOCodeServer({
  appDirectory: './app',
  middleware: [analyticsMiddleware()]
});
```

**With debug mode** (for development):

```javascript
middleware: [analyticsMiddleware({ debug: true })]
```

**With custom script source**:

```javascript
middleware: [analyticsMiddleware({ scriptSrc: 'https://example.com/analytics.js' })]
```

#### Option 2: Manual Injection in Layouts

If you prefer more control, manually add the analytics script to your layout files:

```javascript
import { getAnalyticsScript } from '@ocodejs/core';

export function render({ children }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
        ${getAnalyticsScript()}
      </head>
      <body>
        ${children}
      </body>
    </html>
  `;
}
```

**With debug mode**:

```javascript
${getAnalyticsScript({ debug: true })}
```

### Configuration

Both methods support the following options:

- **`debug`** (boolean): Use the debug version of the analytics script for development. Default: `false`
- **`scriptSrc`** (string): Custom URL for the analytics script. Optional.

### Vercel Dashboard

To view analytics data:

1. Deploy your application to Vercel
2. Enable Web Analytics in your project's Vercel dashboard (Analytics section)
3. Visit your deployed site to generate page views
4. View metrics in the Vercel dashboard after data accumulates

For more information, see the [Vercel Web Analytics documentation](https://vercel.com/docs/analytics).
