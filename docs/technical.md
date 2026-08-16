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
| `pnpm test` | Runs the Vitest suite once |
| `pnpm test:watch` | Runs Vitest in watch mode |

---

## Folder structure

```
src/
├── components/
│   ├── ui/                  shadcn/ui primitives (Button, Dialog, Table, ...) — generated, not hand-written
│   ├── orders/
│   │   ├── OrderStatusBadge.tsx   status → color/dot mapping, memoized
│   │   ├── OrderTableRow.tsx      one row of the orders table, memoized
│   │   └── OrderProductRow.tsx    one row of the order-lines table, memoized
│   ├── products/
│   │   ├── ProductTableRow.tsx    one row of the products table, memoized
│   │   └── ProductFormDialog.tsx  shared create/edit product dialog (RHF + Zod)
│   ├── ConfirmDeleteDialog.tsx    generic "are you sure?" AlertDialog wrapper
│   ├── PaginationFooter.tsx       Prev/Next + "Page X of Y · N items", memoized
│   ├── Navbar.tsx
│   └── ProductModal.tsx     add/edit a product line within an order (RHF + Zod)
├── hooks/
│   ├── useOrders.ts         useOrders, useDeleteOrder, useChangeOrderStatus
│   └── useProducts.ts       useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct
├── pages/
│   ├── Home.tsx
│   ├── MyOrders.tsx         order list + pagination + status/delete
│   ├── Products.tsx         product list + pagination + CRUD
│   └── AddEditOrder.tsx     create/edit order, shared by both routes
├── schemas/
│   ├── order.ts              orderFormSchema, orderProductLineSchema — AddEditOrder's form
│   ├── orderProduct.ts       orderProductFormSchema — ProductModal's form
│   └── product.ts            productFormSchema — ProductFormDialog's form
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

**Why `schemas/` is separate from `types/`:** `types/*.ts` mirrors the backend's DTO shapes — what the API actually returns/accepts. `schemas/*.ts` holds Zod schemas describing what a *form* considers valid input, which is a different concern (e.g. `unitPrice` must be `> 0`, a rule the backend enforces too but that the type alone doesn't express). Each schema exports its Zod object plus an inferred `type XFormValues = z.infer<typeof schema>` for the corresponding `useForm<XFormValues>()`.

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

### Forms: React Hook Form + Zod

Every form (`ProductFormDialog`, `ProductModal`, `AddEditOrder`) uses `useForm` with `zodResolver`, never manual `useState` + hand-rolled `if` checks. The order form additionally uses `useFieldArray` for `orderProducts`, so adding/editing/removing a line item is `append`/`update`/`remove` instead of manual array spreading.

Two things that tripped this up and are worth knowing before touching these forms again:
- **`z.coerce.number()` breaks `useForm`'s generic inference.** Zod v4 gives a coerced field a different "input" type (`unknown`) than "output" type (`number`), which `useForm<T>` can't reconcile in a single type parameter. Fixed by using plain `z.number()` in the schema and `register('field', { valueAsNumber: true })` on the input instead, so the field's input and output types stay identical.
- **Every `<form>` needs `noValidate`.** Native HTML5 attributes like `min="1"` fire the browser's own validation popup before RHF's `handleSubmit` even runs, which hides the styled Zod error message behind a native tooltip. `noValidate` hands 100% of validation to RHF + Zod.

Any field driven by a non-native control (shadcn's `Select`, in `ProductModal`) is wired through `Controller`, not `register`, since it has no real `onChange`/`value` DOM props to register against. Reading a field's live value for display (e.g. the running total in `ProductModal`, or `orderNumber`/`orderProducts` in `AddEditOrder`) uses `useWatch({ control, name })`, not `form.watch()` called directly in the render body — the latter is flagged by `eslint-plugin-react-hooks` as unsafe to memoize and isn't RHF's recommended subscription API for that case.

### Component splitting + `React.memo`

Table rows (`OrderTableRow`, `OrderProductRow`, `ProductTableRow`), the status badge, and the pagination footer are their own memoized components, each receiving primitives/callbacks as props rather than reaching into page-level state. For `memo` to actually prevent re-renders, the callbacks passed down (`onEdit`, `onDelete`, ...) are wrapped in `useCallback` at the page level — passing a fresh arrow function on every render would defeat the memoization immediately. `ConfirmDeleteDialog` is deliberately **not** memoized: its `trigger` prop is a JSX element created fresh on every parent render regardless, so memoizing the dialog itself would add complexity without preventing anything.

### `type="button"` discipline inside `<form>`

shadcn's `Button` component does not set a default `type`, so any `<Button>` rendered inside a `<form>` that isn't the actual submit action must get an explicit `type="button"` — otherwise it defaults to the native `type="submit"` and triggers the form's `onSubmit` on click. This bit `AddEditOrder.tsx` once (the per-row "Edit quantity" button silently submitted and created the order). Buttons rendered through a Radix `Portal` (`AlertDialogContent`, `DialogContent`) are exempt — they're not DOM descendants of the `<form>` regardless of where they sit in the JSX/React tree.

### Testing: Vitest + React Testing Library

Vitest runs in the same Vite config (`vite.config.ts`'s `test` block, `environment: 'jsdom'`), so it shares path aliases and plugins with the app instead of needing a parallel config. `src/test/setup.ts` wires up `@testing-library/jest-dom` matchers and — importantly — calls `cleanup()` in a global `afterEach`.

That `cleanup()` call isn't optional boilerplate: this project doesn't set `test.globals: true` (tests import `describe`/`it`/`expect` explicitly from `'vitest'` rather than relying on injected globals), and React Testing Library's automatic cleanup only self-registers when it detects a global `afterEach`. Without it, one test's rendered DOM (and, worse, an already-open Radix dialog with its overlay) stays mounted into the next test, and `getAllByRole`/`getByText` silently match leftovers instead of the current render — which is exactly what happened while writing `PaginationFooter.test.tsx` and `ConfirmDeleteDialog.test.tsx` before this was wired up.

Test layout mirrors what's being tested, not a parallel `__tests__/` tree — `Button.tsx` and `Button.test.tsx` live side by side. Coverage focuses on:
- **Schemas** (`src/schemas/*.test.ts`) — pure Zod validation rules, no rendering needed.
- **Hooks** (`src/hooks/*.test.tsx`) — `renderHook` against a real `QueryClient` (via `src/test/queryClientWrapper.tsx`, retries disabled so failure tests don't hang), with the service layer and `sonner` mocked via `vi.mock`.
- **Leaf components** (`OrderStatusBadge`, `PaginationFooter`, `ConfirmDeleteDialog`) — rendering and interaction, no mocking needed.
- **One page-level test** (`Products.test.tsx`) — the service layer mocked, exercising the full loading → list → open dialog → validate → submit → toast flow through real component composition, not just the pieces in isolation.

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
| **`@typescript-eslint/no-unused-vars` instead of base `no-unused-vars`** | `typescript-eslint/recommended` already turns the base rule off in favor of the TS-aware one, which correctly ignores parameter names in type-only contexts (e.g. `onEdit: (order: Order) => void` in an interface). An earlier config re-enabled the base rule project-wide, which meant every callback-prop interface needed a manual `eslint-disable` comment for its parameter name. Fixed once in `eslint.config.js` instead of patching each file. |
| **React Hook Form + Zod for every form** | Manual `useState` + inline `if` validation (the original pattern) scales badly once a form has more than one or two fields, and gives no consistent way to show field-level errors. RHF + `zodResolver` centralizes validation rules in one schema per form and keeps error display consistent across the app. |

---

## Known gaps

- No optimistic updates — mutations wait for the server response before invalidating queries.
- Test coverage is intentionally not exhaustive — it covers schemas, hooks, the shared leaf components, and one full page flow (`Products.tsx`) as a representative example, not every page and every branch.
