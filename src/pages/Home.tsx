import { Link } from 'react-router-dom'
import { ClipboardList, PackagePlus, ArrowRight } from 'lucide-react'

const links = [
  {
    to: '/my-orders',
    icon: ClipboardList,
    title: 'My Orders',
    description: 'Browse every order, update status, or jump into edit.',
    cta: 'View orders',
  },
  {
    to: '/add-order',
    icon: PackagePlus,
    title: 'Add Order',
    description: 'Start a new purchase order and add products to it.',
    cta: 'New order',
  },
]

function Home() {
  return (
    <div className="mx-auto max-w-5xl border border-border bg-card">
      <div className="p-12">
        <h1 className="text-4xl">Order Management</h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          Track purchase orders and the product catalog that feeds them — create an order, count
          and price it automatically, and move it from Pending to Completed.
        </p>
      </div>

      <div className="border-t-2 border-border" />

      <div className="grid sm:grid-cols-2">
        {links.map(({ to, icon: Icon, title, description, cta }, i) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col gap-3 p-8 hover:bg-secondary/40 ${i === 0 ? 'border-b border-border sm:border-r sm:border-b-0' : ''}`}
          >
            <Icon className="size-7 text-primary" strokeWidth={1.6} />
            <h3>{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <span className="mt-auto flex items-center gap-1.5 font-heading text-sm font-semibold text-primary">
              {cta}
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
