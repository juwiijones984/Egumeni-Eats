import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import ConfirmDialog from './ConfirmDialog'
import {
  Shield,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Package,
  LogOut,
  RefreshCw,
  Camera,
  Upload,
  X,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import egumeniLogo from 'figma:asset/5f7e92102992d37ad039f90a4366f1707e7a6962.png'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  ingredients: string[]
  preparationTime: number
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  customerId: string
  customerInfo: { name: string }
  items: OrderItem[]
  totalAmount: number
  status: string
  estimatedTime: number
  createdAt: string
  specialInstructions: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
  phone: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

interface OrderItem {
  id?: string
  name: string
  description?: string
  price: number
  quantity: number
}

interface ChartDataPoint {
  date: string
  revenue: number
  orders: number
}

interface TopSellingItem {
  name: string
  quantity: number
  revenue: number
}

export default function AdminDashboard() {
  const { profile, logout } = useAuth()
  const [menu, setMenu] = useState<{ [category: string]: MenuItem[] }>({})
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    item: MenuItem | null
  }>({ open: false, item: null })

  // User management modal states
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<{
    open: boolean
    user: User | null
  }>({ open: false, user: null })
  
  // Form data
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    ingredients: '',
    preparationTime: '15',
    isAvailable: true
  })

  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer',
    phone: '',
    isActive: true
  })
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Analytics state
  const [analyticsView, setAnalyticsView] = useState<'overview' | 'charts' | 'items'>('overview')

  const loadMenu = async () => {
    try {
      const data = await api.request('/menu')
      setMenu(data.menu)
    } catch (error) {
      console.error('Failed to load menu:', error)
      setError('Failed to load menu')
    }
  }

  const loadOrders = async () => {
    try {
      const data = await api.request('/orders')
      setOrders(data.orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await api.request('/users')
      setUsers(data.users)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const initializeData = async () => {
    try {
      await api.request('/init', { method: 'POST' })
      setSuccess('Sample data initialized')
      setTimeout(() => setSuccess(''), 3000)
      await loadMenu()
    } catch (error) {
      console.error('Failed to initialize data:', error)
      setError('Failed to initialize sample data')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadMenu(), loadOrders(), loadUsers()])
      setLoading(false)
    }
    loadData()
  }, [])

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const resetForm = () => {
    setItemForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      ingredients: '',
      preparationTime: '15',
      isAvailable: true
    })
    setEditingItem(null)
    setSelectedImage(null)
    setImagePreview('')
  }

  const resetUserForm = () => {
    setUserForm({
      email: '',
      password: '',
      name: '',
      role: 'customer',
      phone: '',
      isActive: true
    })
    setEditingUser(null)
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    setItemForm({ ...itemForm, image: '' })
  }
  
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploadingImage(true)

    try {
      let imageUrl = itemForm.image
      
      // Convert uploaded image to base64 if present
      if (selectedImage) {
        imageUrl = await convertImageToBase64(selectedImage)
      }
      
      const itemData = {
        ...itemForm,
        image: imageUrl,
        price: parseFloat(itemForm.price),
        preparationTime: parseInt(itemForm.preparationTime),
        ingredients: itemForm.ingredients.split(',').map(ing => ing.trim()).filter(Boolean)
      }

      await api.request('/menu', {
        method: 'POST',
        body: JSON.stringify(itemData)
      })

      setSuccess('Menu item added successfully')
      setShowAddItem(false)
      resetForm()
      await loadMenu()
    } catch (error) {
      console.error('Failed to add menu item:', error)
      setError('Failed to add menu item')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    setError('')
    setSuccess('')
    setUploadingImage(true)

    try {
      let imageUrl = itemForm.image
      
      // Convert uploaded image to base64 if present
      if (selectedImage) {
        imageUrl = await convertImageToBase64(selectedImage)
      }
      
      const itemData = {
        ...itemForm,
        image: imageUrl,
        price: parseFloat(itemForm.price),
        preparationTime: parseInt(itemForm.preparationTime),
        ingredients: itemForm.ingredients.split(',').map(ing => ing.trim()).filter(Boolean)
      }

      await api.request(`/menu/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData)
      })

      setSuccess('Menu item updated successfully')
      setEditingItem(null)
      resetForm()
      await loadMenu()
    } catch (error) {
      console.error('Failed to update menu item:', error)
      setError('Failed to update menu item')
    } finally {
      setUploadingImage(false)
    }
  }

  const startEdit = (item: MenuItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      ingredients: item.ingredients.join(', '),
      preparationTime: item.preparationTime.toString(),
      isAvailable: item.isAvailable
    })
    // Set current image as preview for editing
    if (item.image) {
      setImagePreview(item.image)
    }
    setSelectedImage(null)
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      setDeleteConfirm({ open: false, item: null })
      await api.request(`/menu/${itemId}`, {
        method: 'DELETE'
      })
      
      setSuccess('Menu item deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
      await loadMenu()
    } catch (error) {
      console.error('Failed to delete menu item:', error)
      setError('Failed to delete menu item')
    }
  }

  const confirmDelete = (item: MenuItem) => {
    setDeleteConfirm({ open: true, item })
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.request(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      
      await loadOrders()
      setSuccess(`Order status updated to ${newStatus}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Failed to update order status:', error)
      setError('Failed to update order status')
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const userData = {
        ...userForm,
        password: userForm.password,
      }
      await api.request('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
      setSuccess('User added successfully')
      setShowAddUser(false)
      resetUserForm()
      await loadUsers()
    } catch (error) {
      console.error('Failed to add user:', error)
      setError('Failed to add user')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setError('')
    setSuccess('')
    try {
      const userData = {
        ...userForm,
        password: undefined, // No password for edit
      }
      await api.request(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      })
      setSuccess('User updated successfully')
      setEditingUser(null)
      resetUserForm()
      await loadUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
      setError('Failed to update user')
    }
  }

  const startEditUser = (user: User) => {
    setEditingUser(user)
    setUserForm({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive
    })
    setShowAddUser(true)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeleteUserConfirm({ open: false, user: null })
      await api.request(`/users/${userId}`, {
        method: 'DELETE'
      })
      setSuccess('User deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
      await loadUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      setError('Failed to delete user')
    }
  }

  const confirmDeleteUser = (user: User) => {
    setDeleteUserConfirm({ open: true, user })
  }

  const getOrderStats = () => {
    const today = new Date().toDateString()
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === today
    )
    
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const pendingOrders = orders.filter(order => order.status === 'pending').length
    const preparingOrders = orders.filter(order => order.status === 'preparing').length

    return {
      todayOrders: todayOrders.length,
      totalRevenue,
      pendingOrders,
      preparingOrders
    }
  }

  // Enhanced analytics functions for comprehensive revenue tracking
  const getRevenueAnalytics = () => {
    const now = new Date()
    
    // Daily Revenue (Today)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dailyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfToday
    )
    const dailyRevenue = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Weekly Revenue (Last 7 days)
    const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const weeklyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfWeek
    )
    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Monthly Revenue (This month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfMonth
    )
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    
    // Yearly Revenue (This year)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const yearlyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfYear
    )
    const yearlyRevenue = yearlyOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Previous periods for comparison
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfYesterday && orderDate < endOfYesterday
    })
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    const startOfLastWeek = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
    const endOfLastWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const lastWeekOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfLastWeek && orderDate < endOfLastWeek
    })
    const lastWeekRevenue = lastWeekOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfLastMonth && orderDate < endOfLastMonth
    })
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Calculate growth percentages
    const dailyGrowth = yesterdayRevenue > 0 ? ((dailyRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
    const weeklyGrowth = lastWeekRevenue > 0 ? ((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0
    const monthlyGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    return {
      daily: {
        revenue: dailyRevenue,
        orders: dailyOrders.length,
        growth: dailyGrowth,
        comparison: yesterdayRevenue
      },
      weekly: {
        revenue: weeklyRevenue,
        orders: weeklyOrders.length,
        growth: weeklyGrowth,
        comparison: lastWeekRevenue
      },
      monthly: {
        revenue: monthlyRevenue,
        orders: monthlyOrders.length,
        growth: monthlyGrowth,
        comparison: lastMonthRevenue
      },
      yearly: {
        revenue: yearlyRevenue,
        orders: yearlyOrders.length,
        growth: 0, // Can't calculate yearly growth without previous year data
        comparison: 0
      }
    }
  }

  // Chart data for revenue trends
  const getRevenueChartData = () => {
    const last7Days: ChartDataPoint[] = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startOfDay && orderDate < endOfDay
      })
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      })
    }
    
    return last7Days
  }

  // Get top performing menu items
  const getTopPerformingItems = () => {
    const itemSales: Record<string, TopSellingItem> = {}
    
    orders.forEach(order => {
      order.items.forEach((item: OrderItem) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          }
        }
        itemSales[item.name].quantity += item.quantity
        itemSales[item.name].revenue += item.price * item.quantity
      })
    })
    
    return Object.values(itemSales)
      .sort((a: TopSellingItem, b: TopSellingItem) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  const getAllMenuItems = () => {
    return Object.values(menu).flat()
  }

  const getMenuStats = () => {
    const allItems = getAllMenuItems()
    return {
      totalItems: allItems.length,
      availableItems: allItems.filter(item => item.isAvailable).length,
      categories: Object.keys(menu).length
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
      ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
      out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const stats = getOrderStats()
  const menuStats = getMenuStats()
  const revenueAnalytics = getRevenueAnalytics()
  const chartData = getRevenueChartData()
  const topItems = getTopPerformingItems()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src={egumeniLogo}
                alt="Egumeni Eats"
                className="w-10 h-10 object-contain mr-3"
              />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { loadMenu(); loadOrders(); loadUsers(); }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <span className="text-sm text-gray-600">Welcome, {profile?.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuStats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                {menuStats.availableItems} available
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Manage customer orders and status updates</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                    <Button
                      onClick={initializeData}
                      className="mt-4"
                      variant="outline"
                    >
                      Initialize Sample Data
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                              <CardTitle className="text-lg">
                                Order #{order.id.slice(-8)}
                              </CardTitle>
                              <CardDescription>
                                Customer: {order.customerInfo.name || 'N/A'} | 
                                {new Date(order.createdAt).toLocaleString()}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              {getStatusBadge(order.status)}
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-full sm:w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="preparing">Preparing</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-4">
                            {order.items.map((item: OrderItem, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span>R{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          {order.specialInstructions && (
                            <div className="text-sm text-gray-600 mb-4">
                              <strong>Special instructions:</strong> {order.specialInstructions}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-4 border-t">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold text-lg">R{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle>Menu Management</CardTitle>
                      <CardDescription>Add, edit, and manage menu items</CardDescription>
                    </div>
                    <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                      <DialogTrigger asChild>
                        <Button onClick={() => { resetForm(); setShowAddItem(true); }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add Menu Item</DialogTitle>
                          <DialogDescription>
                            Create a new menu item for your restaurant.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={itemForm.name}
                              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={itemForm.description}
                              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="price">Price (R)</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={itemForm.price}
                                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="prep-time">Prep Time (min)</Label>
                              <Input
                                id="prep-time"
                                type="number"
                                value={itemForm.preparationTime}
                                onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={itemForm.category}
                              onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                              placeholder="e.g., Main Dishes, Desserts"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                            <Input
                              id="ingredients"
                              value={itemForm.ingredients}
                              onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })}
                              placeholder="e.g., chicken, vegetables, spices"
                            />
                          </div>
                          
                          {/* Image Upload Section */}
                          <div className="space-y-2">
                            <Label>Item Image</Label>
                            <div className="space-y-3">
                              {imagePreview ? (
                                <div className="relative">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={removeImage}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                  <div className="text-center">
                                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">Upload an image of your menu item</p>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageChange}
                                      className="hidden"
                                      id="image-upload"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => document.getElementById('image-upload')?.click()}
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Choose Image
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF (max 5MB)</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="available"
                              checked={itemForm.isAvailable}
                              onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                            />
                            <Label htmlFor="available">Available</Label>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              type="submit" 
                              className="flex-1" 
                              disabled={uploadingImage}
                            >
                              {uploadingImage ? 'Adding...' : 'Add Item'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowAddItem(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {Object.keys(menu).length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No menu items found</p>
                      <Button
                        onClick={initializeData}
                        className="mt-4"
                        variant="outline"
                      >
                        Initialize Sample Data
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {Object.entries(menu).map(([category, items]) => (
                        <div key={category}>
                          <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item) => (
                              <Card key={item.id} className="relative">
                                <CardContent className="p-4">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-32 object-cover rounded-md mb-3"
                                    />
                                  )}
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                        <p className="text-lg font-bold text-green-600">R{item.price.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{item.preparationTime} min prep time</p>
                                        {!item.isAvailable && (
                                          <Badge variant="secondary" className="mt-1">Unavailable</Badge>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => startEdit(item)}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => confirmDelete(item)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Revenue Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Daily Revenue */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Daily Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R{revenueAnalytics.daily.revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {revenueAnalytics.daily.orders} orders today
                    </p>
                    <div className="flex items-center mt-2">
                      {revenueAnalytics.daily.growth >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs ${revenueAnalytics.daily.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(revenueAnalytics.daily.growth).toFixed(1)}% vs yesterday
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Revenue */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Weekly Revenue</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R{revenueAnalytics.weekly.revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {revenueAnalytics.weekly.orders} orders this week
                    </p>
                    <div className="flex items-center mt-2">
                      {revenueAnalytics.weekly.growth >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs ${revenueAnalytics.weekly.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(revenueAnalytics.weekly.growth).toFixed(1)}% vs last week
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Revenue */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Monthly Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R{revenueAnalytics.monthly.revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {revenueAnalytics.monthly.orders} orders this month
                    </p>
                    <div className="flex items-center mt-2">
                      {revenueAnalytics.monthly.growth >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs ${revenueAnalytics.monthly.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(revenueAnalytics.monthly.growth).toFixed(1)}% vs last month
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Yearly Revenue */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Yearly Revenue</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R{revenueAnalytics.yearly.revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {revenueAnalytics.yearly.orders} orders this year
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-600">
                        Total for {new Date().getFullYear()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Period Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Yesterday:</span>
                      <span>R{revenueAnalytics.daily.comparison.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Week:</span>
                      <span>R{revenueAnalytics.weekly.comparison.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Month:</span>
                      <span>R{revenueAnalytics.monthly.comparison.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Average Order Values</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Daily Avg:</span>
                      <span>R{revenueAnalytics.daily.orders > 0 ? (revenueAnalytics.daily.revenue / revenueAnalytics.daily.orders).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Avg:</span>
                      <span>R{revenueAnalytics.weekly.orders > 0 ? (revenueAnalytics.weekly.revenue / revenueAnalytics.weekly.orders).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Avg:</span>
                      <span>R{revenueAnalytics.monthly.orders > 0 ? (revenueAnalytics.monthly.revenue / revenueAnalytics.monthly.orders).toFixed(2) : '0.00'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Growth Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Daily Growth:</span>
                      <span className={revenueAnalytics.daily.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {revenueAnalytics.daily.growth >= 0 ? '+' : ''}{revenueAnalytics.daily.growth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Growth:</span>
                      <span className={revenueAnalytics.weekly.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {revenueAnalytics.weekly.growth >= 0 ? '+' : ''}{revenueAnalytics.weekly.growth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Growth:</span>
                      <span className={revenueAnalytics.monthly.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {revenueAnalytics.monthly.growth >= 0 ? '+' : ''}{revenueAnalytics.monthly.growth.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <div className="space-y-6">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    7-Day Revenue Trend
                  </CardTitle>
                  <CardDescription>Daily revenue and order volume for the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (R)" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Order Volume Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Volume Breakdown</CardTitle>
                  <CardDescription>Number of orders per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="items" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Menu Items</CardTitle>
                <CardDescription>Best selling items by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {topItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No sales data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topItems.map((item: TopSellingItem, index: number) => (
                      <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.quantity} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">R{item.revenue.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update the details of this menu item.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (R)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-prep-time">Prep Time (min)</Label>
                  <Input
                    id="edit-prep-time"
                    type="number"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ingredients">Ingredients (comma-separated)</Label>
                <Input
                  id="edit-ingredients"
                  value={itemForm.ingredients}
                  onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload a new image</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="edit-image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('edit-image-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-available"
                  checked={itemForm.isAvailable}
                  onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                />
                <Label htmlFor="edit-available">Available</Label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Updating...' : 'Update Item'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        onConfirm={() => deleteConfirm.item && handleDeleteItem(deleteConfirm.item.id)}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${deleteConfirm.item?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
