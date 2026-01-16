import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Package,
    ShoppingCart,
    AlertTriangle,
    RefreshCw,
    Activity,
    Target,
} from 'lucide-react';
import type { RootState } from '@/state/store';
import reportService from '@/state/services/reportService';
import type { DashboardData, EventsReportData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Chart colors
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { settings } = useSelector((state: RootState) => state.settings);
    const { events, selectedEventId } = useSelector((state: RootState) => state.events);
    const selectedEvent = events.find(e => e._id === selectedEventId);

    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [reportData, setReportData] = useState<EventsReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Initial load
    const [isRefreshing, setIsRefreshing] = useState(false); // Background refresh
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (isBackground = false) => {
        if (isBackground) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);
        try {
            const [dashData, eventsReportData] = await Promise.all([
                reportService.getDashboardData(selectedEventId || undefined),
                reportService.getEventsReport(),
            ]);
            setDashboardData(dashData);
            setReportData(eventsReportData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setError('Failed to load dashboard data. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        // If we already have data, do a background refresh to avoid flickering
        const hasData = dashboardData !== null;
        fetchData(hasData);
    }, [selectedEventId]);

    const financials = useMemo(() => dashboardData?.financials || {
        openingBalance: settings?.openingBalance || 0,
        totalRevenue: 0,
        totalExpenses: 0,
        currentBalance: 0,
    }, [dashboardData, settings]);

    // Get ongoing events - Safe access
    const ongoingEvents = useMemo(() =>
        reportData?.events?.filter(e => e.event.status === 'OPEN') || [],
        [reportData]);

    const lowStockProducts = dashboardData?.lowStockProducts || [];
    const recentSales = dashboardData?.recentSales || [];

    // Calculate profit margin
    const profitMargin = useMemo(() => {
        return financials.totalRevenue > 0
            ? ((financials.totalRevenue - financials.totalExpenses) / financials.totalRevenue * 100).toFixed(1)
            : '0';
    }, [financials]);

    if (isLoading && !dashboardData) {
        return <DashboardSkeleton />;
    }

    if (error && !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <AlertTriangle size={40} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
                <p className="text-slate-500 mb-6 max-w-md">{error}</p>
                <button
                    onClick={() => fetchData(false)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={cn("space-y-6 transition-opacity duration-200", isRefreshing && "opacity-60 pointer-events-none")}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">
                        {selectedEvent ? `Dashboard - ${selectedEvent.name}` : 'Dashboard'}
                    </h2>
                    <p className="text-slate-500">
                        {selectedEvent
                            ? `Showing data specific to ${selectedEvent.name}`
                            : 'Quick overview of your business performance'}
                    </p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                >
                    <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Opening Balance</p>
                            <p className="text-2xl font-bold mt-1">SAR {financials.openingBalance.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold mt-1">+SAR {financials.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                            <p className="text-2xl font-bold mt-1">-SAR {financials.totalExpenses.toLocaleString()}</p>
                            <p className="text-xs text-red-200 mt-0.5">Cost of Goods Sold</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-xl text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Current Balance</p>
                            <p className="text-2xl font-bold mt-1">SAR {financials.currentBalance.toLocaleString()}</p>
                            <p className="text-xs text-indigo-200 mt-0.5">{profitMargin}% margin</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Target size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{reportData?.events?.length || 0}</p>
                            <p className="text-xs text-slate-500">Total Events</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-50 rounded-lg text-green-600">
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{ongoingEvents.length}</p>
                            <p className="text-xs text-slate-500">Active Events</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                            <ShoppingCart size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{dashboardData?.salesCount || 0}</p>
                            <p className="text-xs text-slate-500">Total Sales</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{dashboardData?.productsCount || 0}</p>
                            <p className="text-xs text-slate-500">Products</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Sales Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-lg mb-6 text-slate-800">Recent Sales Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={recentSales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                    }}
                                    formatter={(value: number) => [`SAR ${value.toLocaleString()}`, 'Amount']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: '#6366f1' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg text-slate-800">Low Stock Alerts</h3>
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <Badge variant={lowStockProducts.length > 3 ? 'destructive' : 'secondary'}>
                                {lowStockProducts.length} items
                            </Badge>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lowStockProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    formatter={(value: number) => [`${value} units`, 'Stock']}
                                />
                                <Bar
                                    dataKey="stock"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                >
                                    {lowStockProducts.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.stock <= 5 ? '#ef4444' : entry.stock <= 10 ? '#f59e0b' : '#22c55e'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ongoing Events */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg text-slate-800">Ongoing Events</h3>
                        {ongoingEvents.length > 0 && (
                            <Badge variant="success">{ongoingEvents.length} Active</Badge>
                        )}
                    </div>
                    {ongoingEvents.length > 0 ? (
                        <div className="space-y-3">
                            {ongoingEvents.slice(0, 4).map((ev) => (
                                <div key={ev.event._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-800">{ev.event.name}</h4>
                                            <p className="text-sm text-slate-500">{ev.event.location} • {new Date(ev.event.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">SAR {ev.revenue.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">{ev.saleCount} sales</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Calendar size={40} className="mb-2" />
                            <p>No ongoing events</p>
                        </div>
                    )}
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">Expense Categories</h3>
                    {(reportData?.expensesByCategory || []).length > 0 ? (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={reportData?.expensesByCategory || []}
                                        dataKey="total"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                    >
                                        {(reportData?.expensesByCategory || []).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `SAR ${Number(value).toLocaleString()}`} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <Package size={32} className="mb-2" />
                            <p className="text-sm">No expense data</p>
                        </div>
                    )}
                    <div className="space-y-2 mt-4">
                        {(reportData?.expensesByCategory || []).slice(0, 4).map((cat, idx) => (
                            <div key={cat.category} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-slate-600">{cat.category}</span>
                                </div>
                                <span className="font-medium text-slate-800">SAR {cat.total.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cloud Sync Status */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-blue-800">Cloud Sync Status</h4>
                    <p className="text-sm text-blue-600">
                        All data is synced to registered email: <strong>{settings?.userEmail || 'N/A'}</strong>
                    </p>
                </div>
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Live Synced
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
