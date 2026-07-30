import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Home, ListOrdered, Package, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/my-orders', label: 'My Orders', icon: ListOrdered },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/add-order', label: 'Add Order', icon: PlusCircle },
]

function Navbar() {
  const location = useLocation()

  return (
    <nav className="border-b bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <ShoppingCart className="size-5" />
          Order Management
        </Link>

        <div className="flex flex-wrap gap-2">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to
            return (
              <Button
                key={to}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                className={isActive ? '' : 'text-white hover:bg-neutral-800 hover:text-white'}
              >
                <Link to={to}>
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
