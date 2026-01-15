import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import {
    Users,
    Package,
    ShoppingCart,
    Receipt,
    CalendarDays,
    BarChart3,
    Edit2,
    Trash2,
    Plus,
    Shield,
    Save,
} from 'lucide-react';
import type { RootState } from '@/state/store';
import adminService, {
    type AdminStats,
    type AdminUser,
    type AdminProduct,
    type AdminSale,
    type AdminExpense,
    type AdminEvent,
} from '@/state/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

type TabType = 'overview' | 'users' | 'products' | 'sales' | 'expenses' | 'events';

const Admin: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [sales, setSales] = useState<AdminSale[]>([]);
    const [expenses, setExpenses] = useState<AdminExpense[]>([]);
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
    const [editingSale, setEditingSale] = useState<AdminSale | null>(null);
    const [editingExpense, setEditingExpense] = useState<AdminExpense | null>(null);
    const [eventFormData, setEventFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
    });

    // Redirect non-admin users
    if (user && !user.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            switch (activeTab) {
                case 'overview':
                    const statsData = await adminService.getStats();
                    setStats(statsData);
                    break;
                case 'users':
                    const usersData = await adminService.getUsers();
                    setUsers(usersData);
                    break;
                case 'products':
                    const productsData = await adminService.getProducts();
                    setProducts(productsData);
                    break;
                case 'sales':
                    const salesData = await adminService.getSales();
                    setSales(salesData);
                    break;
                case 'expenses':
                    const expensesData = await adminService.getExpenses();
                    setExpenses(expensesData);
                    break;
                case 'events':
                    const eventsData = await adminService.getEvents();
                    setEvents(eventsData);
                    break;
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const updated = await adminService.updateUser(editingUser._id, {
                name: editingUser.name,
                email: editingUser.email,
                isAdmin: editingUser.isAdmin,
            });
            setUsers(users.map((u) => (u._id === updated._id ? updated : u)));
            setEditingUser(null);
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminService.deleteUser(id);
            setUsers(users.filter((u) => u._id !== id));
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleCreateEvent = async () => {
        try {
            const newEvent = await adminService.createEvent(eventFormData);
            setEvents([newEvent, ...events]);
            setIsEventModalOpen(false);
            setEventFormData({ name: '', date: new Date().toISOString().split('T')[0], location: '' });
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleUpdateEvent = async () => {
        if (!editingEvent) return;
        try {
            const updated = await adminService.updateEvent(editingEvent._id, {
                name: editingEvent.name,
                location: editingEvent.location,
                date: editingEvent.date,
                status: editingEvent.status,
            });
            setEvents(events.map((e) => (e._id === updated._id ? updated : e)));
            setEditingEvent(null);
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await adminService.deleteEvent(id);
            setEvents(events.filter((e) => e._id !== id));
        } catch (err) {
            alert((err as Error).message);
        }
    };

    // Sale handlers
    const handleUpdateSale = async () => {
        if (!editingSale) return;
        try {
            const updated = await adminService.updateSale(editingSale._id, {
                soldBy: editingSale.soldBy,
                type: editingSale.type,
                totalAmount: editingSale.totalAmount,
            });
            setSales(sales.map((s) => (s._id === updated._id ? updated : s)));
            setEditingSale(null);
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleDeleteSale = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sale?')) return;
        try {
            await adminService.deleteSale(id);
            setSales(sales.filter((s) => s._id !== id));
        } catch (err) {
            alert((err as Error).message);
        }
    };

    // Expense handlers
    const handleUpdateExpense = async () => {
        if (!editingExpense) return;
        try {
            const updated = await adminService.updateExpense(editingExpense._id, {
                description: editingExpense.description,
                category: editingExpense.category,
                amount: editingExpense.amount,
            });
            setExpenses(expenses.map((e) => (e._id === updated._id ? updated : e)));
            setEditingExpense(null);
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            await adminService.deleteExpense(id);
            setExpenses(expenses.filter((e) => e._id !== id));
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'sales', label: 'Sales', icon: ShoppingCart },
        { id: 'expenses', label: 'Expenses', icon: Receipt },
        { id: 'events', label: 'Events', icon: CalendarDays },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Shield className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Admin Panel</h2>
                        <p className="text-slate-500">Manage all application data</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-pulse text-indigo-600">Loading...</div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-600 font-medium">Users</p>
                                    <p className="text-2xl font-bold text-blue-800">{stats.counts.users}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <p className="text-sm text-purple-600 font-medium">Products</p>
                                    <p className="text-2xl font-bold text-purple-800">{stats.counts.products}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <p className="text-sm text-green-600 font-medium">Sales</p>
                                    <p className="text-2xl font-bold text-green-800">{stats.counts.sales}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                    <p className="text-sm text-red-600 font-medium">Expenses</p>
                                    <p className="text-2xl font-bold text-red-800">{stats.counts.expenses}</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                    <p className="text-sm text-orange-600 font-medium">Events</p>
                                    <p className="text-2xl font-bold text-orange-800">{stats.counts.events}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl text-white">
                                    <p className="text-green-100 text-sm">Total Revenue</p>
                                    <p className="text-3xl font-bold">SAR {stats.financials.totalRevenue.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-xl text-white">
                                    <p className="text-red-100 text-sm">Total Expenses</p>
                                    <p className="text-3xl font-bold">SAR {stats.financials.totalExpenses.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
                                    <p className="text-indigo-100 text-sm">Net Profit</p>
                                    <p className="text-3xl font-bold">SAR {stats.financials.netProfit.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">All Users ({users.length})</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u._id}>
                                            <TableCell className="font-medium">{u.name}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={u.isAdmin ? 'destructive' : 'secondary'}>
                                                    {u.isAdmin ? 'Admin' : 'User'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingUser(u)} className="text-slate-400 hover:text-indigo-600">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(u._id)} className="text-slate-400 hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">All Products ({products.length})</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Owner</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((p) => (
                                        <TableRow key={p._id}>
                                            <TableCell className="font-mono text-sm">{p.itemCode}</TableCell>
                                            <TableCell className="font-medium">{p.name}</TableCell>
                                            <TableCell>{p.category}</TableCell>
                                            <TableCell>SAR {p.sellingPrice}</TableCell>
                                            <TableCell>
                                                <Badge variant={p.stockQuantity < 5 ? 'destructive' : 'success'}>
                                                    {p.stockQuantity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">{p.user?.name || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Sales Tab */}
                    {activeTab === 'sales' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">All Sales ({sales.length})</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Sold By</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.map((s) => (
                                        <TableRow key={s._id}>
                                            <TableCell>{new Date(s.timestamp).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={s.type === 'COMBO' ? 'default' : 'secondary'}>{s.type}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-green-600">SAR {s.totalAmount}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{s.soldBy}</TableCell>
                                            <TableCell>{s.event?.name || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingSale(s)} className="text-slate-400 hover:text-indigo-600">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteSale(s._id)} className="text-slate-400 hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Expenses Tab */}
                    {activeTab === 'expenses' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">All Expenses ({expenses.length})</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map((e) => (
                                        <TableRow key={e._id}>
                                            <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{e.description}</TableCell>
                                            <TableCell>{e.category}</TableCell>
                                            <TableCell className="font-medium text-red-600">-SAR {e.amount}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{e.user?.name || 'N/A'}</TableCell>
                                            <TableCell>{e.event?.name || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingExpense(e)} className="text-slate-400 hover:text-indigo-600">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteExpense(e._id)} className="text-slate-400 hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">All Events ({events.length})</h3>
                                <Button onClick={() => setIsEventModalOpen(true)}>
                                    <Plus size={18} /> New Event
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((e) => (
                                        <TableRow key={e._id}>
                                            <TableCell className="font-medium">{e.name}</TableCell>
                                            <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{e.location}</TableCell>
                                            <TableCell>
                                                <Badge variant={e.status === 'OPEN' ? 'success' : 'secondary'}>{e.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">{e.user?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingEvent(e)} className="text-slate-400 hover:text-indigo-600">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteEvent(e._id)} className="text-slate-400 hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <Modal isOpen={true} onClose={() => setEditingUser(null)} title="Edit User">
                    <div className="space-y-4">
                        <Input
                            label="Name"
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isAdmin"
                                checked={editingUser.isAdmin}
                                onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                                className="w-4 h-4 rounded text-indigo-600"
                            />
                            <label htmlFor="isAdmin" className="text-sm font-medium text-slate-700">
                                Admin Privileges
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setEditingUser(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateUser}>
                                <Save size={16} /> Save Changes
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Create Event Modal */}
            <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Create New Event">
                <div className="space-y-4">
                    <Input
                        label="Event Name"
                        placeholder="e.g. Summer Festival"
                        value={eventFormData.name}
                        onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                    />
                    <Input
                        label="Date"
                        type="date"
                        value={eventFormData.date}
                        onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                    />
                    <Input
                        label="Location"
                        placeholder="e.g. City Mall"
                        value={eventFormData.location}
                        onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsEventModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateEvent}>
                            <Plus size={16} /> Create Event
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Event Modal */}
            {editingEvent && (
                <Modal isOpen={true} onClose={() => setEditingEvent(null)} title="Edit Event">
                    <div className="space-y-4">
                        <Input
                            label="Event Name"
                            value={editingEvent.name}
                            onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                        />
                        <Input
                            label="Date"
                            type="date"
                            value={new Date(editingEvent.date).toISOString().split('T')[0]}
                            onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        />
                        <Input
                            label="Location"
                            value={editingEvent.location}
                            onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                value={editingEvent.status}
                                onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setEditingEvent(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateEvent}>
                                <Save size={16} /> Save Changes
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Sale Modal */}
            {editingSale && (
                <Modal isOpen={true} onClose={() => setEditingSale(null)} title="Edit Sale">
                    <div className="space-y-4">
                        <Input
                            label="Sold By"
                            value={editingSale.soldBy}
                            onChange={(e) => setEditingSale({ ...editingSale, soldBy: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select
                                value={editingSale.type}
                                onChange={(e) => setEditingSale({ ...editingSale, type: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            >
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="COMBO">Combo</option>
                            </select>
                        </div>
                        <Input
                            label="Total Amount (SAR)"
                            type="number"
                            value={editingSale.totalAmount.toString()}
                            onChange={(e) => setEditingSale({ ...editingSale, totalAmount: parseFloat(e.target.value) || 0 })}
                        />
                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                            <p><strong>Event:</strong> {editingSale.event?.name || 'No event'}</p>
                            <p><strong>Date:</strong> {new Date(editingSale.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setEditingSale(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateSale}>
                                <Save size={16} /> Save Changes
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Expense Modal */}
            {editingExpense && (
                <Modal isOpen={true} onClose={() => setEditingExpense(null)} title="Edit Expense">
                    <div className="space-y-4">
                        <Input
                            label="Description"
                            value={editingExpense.description}
                            onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                        />
                        <Input
                            label="Category"
                            value={editingExpense.category}
                            onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                        />
                        <Input
                            label="Amount (SAR)"
                            type="number"
                            value={editingExpense.amount.toString()}
                            onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                        />
                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                            <p><strong>Event:</strong> {editingExpense.event?.name || 'No event'}</p>
                            <p><strong>Date:</strong> {new Date(editingExpense.date).toLocaleDateString()}</p>
                            <p><strong>User:</strong> {editingExpense.user?.name || 'N/A'}</p>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setEditingExpense(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateExpense}>
                                <Save size={16} /> Save Changes
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Admin;

