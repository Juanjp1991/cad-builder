# Development Guide - Frontend

## Prerequisites

- **Node.js**: 20.9.0 or higher (Next.js 16 requirement)
- **npm**: Latest version
- **Backend**: Running Backend service at `http://localhost:8001`

## Local Development Setup

### 1. Navigate to Frontend

```bash
cd "Lego builder python/Frontend"
```

### 2. Install Dependencies

```bash
npm install
```

Key dependencies installed:
- Next.js 16 (React 19)
- React Three Fiber + Drei (3D rendering)
- Tailwind CSS 4
- TypeScript
- Vitest (testing)

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### 4. Run Development Server

```bash
npm run dev
```

- Frontend will be available at `http://localhost:3000`
- Hot module replacement enabled
- TypeScript type checking on save

## Development Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run fix       # Auto-fix linting issues
npm run test      # Run Vitest unit tests
npm run check     # Google TypeScript Style check
npm run clean     # Clean build artifacts
```

## Running with Docker

### Build Image

```bash
docker build -t forma-ai-frontend .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://backend:8001 \
  forma-ai-frontend
```

### Using Docker Compose

```bash
docker compose up --build
```

## Testing

### Unit Tests (Vitest)

Run all tests:
```bash
npm run test
```

Run in watch mode:
```bash
npm run test -- --watch
```

Run with coverage:
```bash
npm run test -- --coverage
```

### Test Files

- `__tests__/Chat.test.tsx`: Chat component tests
- `__tests__/ModelViewer.test.tsx`: 3D viewer tests

### Writing Tests

Example test structure:
```typescript
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Chat from '@/components/Chat';

describe('Chat', () => {
  it('renders input field', () => {
    render(<Chat />);
    expect(screen.getByPlaceholderText(/enter prompt/i)).toBeInTheDocument();
  });
});
```

## Common Development Tasks

### Adding a New Component

```bash
# Create component file
touch components/MyComponent.tsx

# Create test file
touch __tests__/MyComponent.test.tsx
```

Component template:
```typescript
import React from 'react';

interface MyComponentProps {
  // props
}

export default function MyComponent({ }: MyComponentProps) {
  return <div>My Component</div>;
}
```

### Updating API Types

Edit `lib/api.ts` to match Backend A2A protocol changes.

### Styling with Tailwind

Use utility classes:
```tsx
<div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
  {/* content */}
</div>
```

Merge classes with `cn()` utility:
```tsx
import { cn } from '@/lib/utils';

<div className={cn("base-classes", isActive && "active-classes")}>
```

### 3D Model Development

Test STL loading locally:
```tsx
<ModelViewer 
  fileUrl="/path/to/test.stl"
/>
```

### Debugging API Calls

Add console logging in `lib/api.ts`:
```typescript
export async function sendMessage(prompt: string) {
  console.log('Sending:', prompt);
  const response = await fetch(...);
  const data = await response.json();
  console.log('Response:', data);
  return data.task;
}
```

## Project Structure for Development

Key directories:

- **`app/`**: Add new pages/routes here
- **`components/`**: All React components
- **`lib/`**: Utilities, API client, helpers
- **`public/`**: Static assets (images, fonts)
- **`__tests__/`**: Test files

## Troubleshooting

### Backend Connection Errors

Verify Backend is running:
```bash
curl http://localhost:8001/v1/tasks/test
```

Check `NEXT_PUBLIC_API_URL` in `.env.local`.

### 3D Viewer Not Loading

Check browser console for WebGL errors. Ensure:
- Browser supports WebGL
- STL file URL is accessible
- CORS headers allow fetch

### TypeScript Errors

Run type check:
```bash
npx tsc --noEmit
```

### Build Errors

Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

### Hot Reload Not Working

Restart dev server:
```bash
npm run dev
```

## Code Quality

### Linting

ESLint with Next.js config:
```bash
npm run lint
```

Auto-fix issues:
```bash
npm run fix
```

### Type Checking

TypeScript strict mode enabled in `tsconfig.json`. Run check:
```bash
npx tsc --noEmit
```

### Code Formatting

Google TypeScript Style (gts):
```bash
npm run check  # Check formatting
npm run fix    # Auto-format
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8001` | Backend API base URL |

**Note**: `NEXT_PUBLIC_*` variables are exposed to the browser.

## Performance Optimization

### Production Build

```bash
npm run build
npm run start
```

Optimizations:
- Automatic code splitting per route
- Image optimization (if using Next/Image)
- Static page generation where possible
- Minification and tree-shaking

### 3D Optimization

For large STL files, consider:
- Decimation (reduce polygon count)
- Level of Detail (LOD)
- Lazy loading

## Deployment

### Vercel Deployment

```bash
npm install -g vercel
vercel
```

Set environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Docker Production

```bash
docker build -t forma-frontend:prod .
docker run -p 3000:3000 forma-frontend:prod
```

## Browser Compatibility

Tested browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

WebGL required for 3D viewer.

## Known Issues

- Conversation history not persisted (use localStorage for persistence)
- Large STL files may cause browser lag
- Mobile 3D controls need improvement

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)
