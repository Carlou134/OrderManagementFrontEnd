import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MyOrders from './pages/MyOrders'
import AddEditOrder from './pages/AddEditOrder'
import Products from './pages/Products'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Toaster richColors position="top-right" />

        <div className="px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/add-order" element={<AddEditOrder />} />
            <Route path="/add-order/:id" element={<AddEditOrder />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
