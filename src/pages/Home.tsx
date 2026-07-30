import { Link } from 'react-router-dom'
import { ListOrdered, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your orders and their products from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <ListOrdered className="size-6" />
            <CardTitle>My Orders</CardTitle>
            <CardDescription>View, edit and delete existing orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/my-orders">Go to My Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <PlusCircle className="size-6" />
            <CardTitle>Add Order</CardTitle>
            <CardDescription>Create a new order and add products to it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/add-order">Create order</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home
