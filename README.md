# Ladimood Frontend

A modern Next.js 15 e-commerce frontend for the Ladimood brand.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand (persistent stores)
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom components + Radix UI primitives
- **Notifications**: Sonner toasts
- **Linting**: ESLint + Prettier + Husky pre-commit hooks

## Getting Started

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## Available Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `yarn dev`          | Start development server     |
| `yarn build`        | Build for production         |
| `yarn start`        | Start production server      |
| `yarn lint`         | Run ESLint                   |
| `yarn lint:fix`     | Run ESLint with auto-fix     |
| `yarn format`       | Format code with Prettier    |
| `yarn format:check` | Check code formatting        |
| `yarn type-check`   | Run TypeScript type checking |
| `yarn analyze`      | Analyze bundle size          |

## Project Structure

```
src/
├── api/                  # API client functions
│   ├── account/          # User, cart, orders API
│   ├── auth/             # Authentication API
│   └── axiosInstance.ts  # Axios configuration
├── app/                  # Next.js App Router pages
│   ├── account/          # User account page
│   ├── auth/             # Login, register, password reset
│   ├── shop/             # Product listing
│   ├── confirmation/     # Order confirmation
│   └── ...
├── components/           # React components
│   ├── Account/          # Account-related components
│   ├── Authentication/   # Auth components
│   ├── Checkout/         # Guest checkout
│   ├── Layout/           # Header, Footer, Navbar
│   ├── Order/            # Cart, Shop components
│   ├── Providers.tsx     # App providers (Query, Toast)
│   └── UI/               # Shared UI components
├── hooks/                # Custom React hooks
│   └── queries/          # TanStack Query hooks
├── lib/                  # Utility libraries
│   ├── query-client.ts   # React Query configuration
│   ├── storage.ts        # LocalStorage helpers
│   ├── toast.ts          # Toast utilities
│   └── utils.ts          # General utilities (cn, etc.)
├── schemas/              # Zod validation schemas
│   ├── auth.schema.ts
│   ├── address.schema.ts
│   └── checkout.schema.ts
├── stores/               # Zustand stores
│   ├── useAuthStore.ts   # Authentication state
│   ├── useCartStore.ts   # Cart state
│   └── useUIStore.ts     # UI state (modals, etc.)
└── styles/               # Global styles
```

## State Management

### Zustand Stores

```typescript
// Authentication
import { useAuthStore } from '@/stores';
const { isAuthenticated, user, login, logout } = useAuthStore();

// Cart
import { useCartStore } from '@/stores';
const { items, addItem, removeItem, getTotalPrice } = useCartStore();
```

### TanStack Query Hooks

```typescript
// Products
import { useProducts } from '@/hooks/queries';
const { data: products, isLoading } = useProducts();

// Cart operations
import { useAddToCart } from '@/hooks/queries';
const { mutate: addToCart } = useAddToCart();
```

## Forms & Validation

All forms use React Hook Form with Zod schemas:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas';

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

## Guest Checkout

The app supports anonymous checkout:

1. Users browse products without login
2. Add items to guest cart (session-based)
3. Complete checkout with email/name/address
4. Receive order confirmation

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Code Quality

- **ESLint**: Strict TypeScript rules, no `any` allowed
- **Prettier**: Consistent formatting
- **Husky**: Pre-commit hooks for lint-staged
- **TypeScript**: Strict mode with additional checks

## Key Features Implemented

- [x] Zustand state management with persistence
- [x] TanStack Query for data fetching & caching
- [x] React Hook Form + Zod validation
- [x] Guest/anonymous checkout flow
- [x] Sonner toast notifications
- [x] Strict TypeScript configuration
- [x] ESLint + Prettier + Husky setup
- [x] Modern UI components (Button, Input)
- [x] Cart badge with item count
- [x] Anonymous browsing (no login required for shop)

## Remaining Tasks

- [ ] Fix remaining TypeScript errors in legacy components
- [ ] Add loading skeletons
- [ ] Implement wishlist with Zustand
- [ ] Add E2E tests with Playwright
- [ ] Optimize images with next/image
- [ ] Add error boundaries
- [ ] Implement search functionality
