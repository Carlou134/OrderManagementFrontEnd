# Technical Documentation

This document covers the code-level details of the frontend: local setup, folder structure, patterns, and the reasoning behind the main technical decisions. For system-level context (what the app does, stack overview, deploy) see the [README](../README.md).

---

## Local environment setup

**Requirements:**
- Node.js >= 20
- pnpm (`packageManager: pnpm@11.17.0` in `package.json`)
- The [backend](https://github.com/Carlou134/OrderManagementBackend) running locally (MySQL + .NET 8) — this app has no mock/offline mode, every page fetches from a real API

**Environment variables:**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API (e.g. `https://localhost:7197/api`) |

```bash
pnpm install
cp .env.example .env.development
pnpm dev
```

**Available scripts:**

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc -b`, no emit |
| `pnpm lint` | ESLint over the whole project |
| `pnpm preview` | Serves the production build locally |

---

## Folder structure

```
src/
├── components/
│   ├── ui/              shadcn/ui primitives (Button, Dialog, Table, ...) — generated, not hand-written
│   ├── Navbar.tsx
│   └── ProductModal.tsx     add/edit a product line within an order
├── hooks/
│   ├── useOrders.ts         useOrders, useDeleteOrder, useChangeOrderStatus
│   └── useProducts.ts       useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct
├── pages/
│   ├── Home.tsx
│   ├── MyOrders.tsx         order list + pagination + status/delete
│   ├── Products.tsx         product list + pagination + CRUD
│   └── AddEditOrder.tsx     create/edit order, shared by both routes
├── services/
│   ├── ordersApi.ts         Axios calls for orders — no business logic, no types
│   └── productsApi.ts       Axios calls for products — no business logic, no types
├── types/
│   ├── order.ts             Order, OrderProductDetail, OrderQueryParams, CreateOrderPayload
│   ├── product.ts           Product, ProductQueryParams, ProductPayload
│   └── pagination.ts        PagedResult<T>
├── lib/
│   └── utils.ts              cn() (clsx + tailwind-merge), shadcn convention
├── App.tsx                   routes + QueryClientProvider + Toaster
└── main.tsx
```

**Why services and types are split apart:** `services/*Api.ts` files only know how to talk HTTP (Axios calls, error logging). They import their types from `types/*.ts` but don't own or re-export them. Anything importing a domain type (`Order`, `Product`, `PagedResult<T>`) imports it directly from `types/`, never through a service file. This keeps the HTTP layer swappable without touching type consumers, and avoids a service file becoming a dumping ground for both HTTP calls and domain modeling.

**Why one file per resource, not one shared `api.ts`:** the project briefly had a single `api.ts` handling both orders and products; it was split into `ordersApi.ts` / `productsApi.ts` because a shared file kept growing unrelated concerns together and made it harder to see, at a glance, everything a given resource does.

---

## Patterns used

### Data fetching: hooks wrapping React Query

Pages don't call `useQuery`/`useMutation` directly — they use hooks from `src/hooks/`. Every mutation hook owns its own success/error side effects (toast + `queryClient.invalidateQueries`), so pages stay focused on UI state (which dialog is open, which row is being edited) instead of repeating fetch/mutate boilerplate.

```ts
// src/hooks/useProducts.ts
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: () => toast.error('Could not delete product'),
  })
}
```

Dialog-closing side effects that are specific to a single call site (not something every caller wants) are passed per-call instead of baked into the hook:

```ts
statusMutation.mutate(
  { id: statusTarget.id, status: Number(newStatus) },
  { onSuccess: () => setStatusTarget(null) }
)
```

### Pagination

List endpoints return `PagedResult<T>` (`items`, `page`, `pageSize`, `totalCount`, `totalPages`). Query hooks use `placeholderData: keepPreviousData` so the table doesn't flash back to a loading state when moving between pages. Pages own a local `page` state and a Prev/Next footer; there's no infinite scroll or virtualization since the backend caps `pageSize` at 100 (see `ProductQueryValidator`/`OrderQueryValidator` on the backend).

### Forms inside dialogs

`ProductModal` pre-fills its fields from an `editingProduct` prop via a `useEffect` watching `[open, editingProduct]` — not inside the Dialog's `onOpenChange`, because Radix's `onOpenChange` only fires on Radix-driven open/close, not when a parent externally flips `open` to `true`.

### `type="button"` discipline inside `<form>`

shadcn's `Button` component does not set a default `type`, so any `<Button>` rendered inside a `<form>` that isn't the actual submit action must get an explicit `type="button"` — otherwise it defaults to the native `type="submit"` and triggers the form's `onSubmit` on click. This bit `AddEditOrder.tsx` once (the per-row "Edit quantity" button silently submitted and created the order). Buttons rendered through a Radix `Portal` (`AlertDialogContent`, `DialogContent`) are exempt — they're not DOM descendants of the `<form>` regardless of where they sit in the JSX/React tree.

### Path alias

`@/*` resolves to `src/*` (`vite.config.ts` + `tsconfig.app.json`), so imports never use relative `../../..` chains across `components/`, `hooks/`, `pages/`, `services/`, `types/`.

---

## Technical decisions

| Decision | Why |
|----------|-----|
| **TypeScript with `allowJs: true`** | Lets JS and TS files coexist so the JS → TS migration happened incrementally, file by file, instead of a single all-or-nothing rewrite. |
| **TypeScript pinned to `6.0.3`** | TS 7 (the Go-based rewrite) broke `typescript-eslint` entirely at the time of migration; pinned to the last compatible major. |
| **shadcn/ui over a full component library** | Components are generated into the repo (`src/components/ui/`) instead of imported as an opaque dependency, so the design system ("Modernist" — flat colors, zero border radius, Archivo typography) could be applied directly as CSS tokens without fighting a library's own theming API. |
| **CSS Cascade Layers during the Bootstrap → Tailwind migration** | Both frameworks ship global resets that collide. `@layer bootstrap, theme, base, components, utilities` let Bootstrap coexist at a lower priority while components were migrated one at a time, instead of a big-bang cutover. |
| **React Query instead of `useState` + `useEffect` for server state** | Removes manual loading/error state juggling and duplicate fetch-on-mount logic, and gives pagination `keepPreviousData` for free. |
| **Sonner instead of SweetAlert2** | SweetAlert2 rendered outside React's tree and didn't fit the shadcn/Radix dialog patterns already in use; Sonner is a normal React component (`<Toaster />`) that composes with the rest of the UI. |
| **`react-refresh/only-export-components` disabled under `src/components/ui/**`** | shadcn's generated files (e.g. `button.tsx`) intentionally export both a component and a helper (`buttonVariants`), which the rule otherwise flags as a Fast Refresh hazard. Scoped to generated files only, not the whole project. |

---

## Known gaps

- No automated tests yet (Vitest + React Testing Library) — deferred until the module restructuring settled. A `docs/test-cases.md` will be added once tests exist.
- No client-side form validation library (Zod / React Hook Form) — forms validate manually inline.
- No optimistic updates — mutations wait for the server response before invalidating queries.
