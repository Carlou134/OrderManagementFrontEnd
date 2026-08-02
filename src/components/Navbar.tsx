import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home' },
  { to: '/my-orders', label: 'My Orders' },
  { to: '/products', label: 'Products' },
]

function Navbar() {
  const location = useLocation()

  return (
    <nav className="border-b-2 border-border bg-sidebar">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 py-3">
        <Link to="/" className="mr-auto flex items-center gap-2 font-heading text-lg font-extrabold">
          <ShoppingCart className="size-5" />
          Order Management
        </Link>

        {links.map(({ to, label }) => {
          const isActive = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'text-sm text-foreground hover:text-primary',
                isActive && 'text-primary'
              )}
            >
              {label}
            </Link>
          )
        })}

        <Button asChild>
          <Link to="/add-order">
            <Plus className="size-4" />
            Add Order
          </Link>
        </Button>
      </div>
    </nav>
  )
}

export default Navbar
