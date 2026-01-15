import React, { useEffect, useState } from 'react';
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
} from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, TrendingDown } from 'lucide-react';
import type { RootState } from '@/state/store';
import reportService from '@/state/services/reportService';
import type { DashboardData } from '@/lib/types';

const Dashboard: React.FC = () => {
    const { settings } = useSelector((state: RootState) => state.settings);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await reportService.getDashboardData();
                setDashboardData(data);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-indigo-600">Loading dashboard...</div>
            </div>
        );
    }

    const financials = dashboardData?.financials || {
        openingBalance: settings?.openingBalance || 0,
        totalRevenue: 0,
        totalExpenses: 0,
        currentBalance: 0,
    };

    return (
        <div className="space-y-6 animate-in">
            <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-slate-500 font-medium">Opening Balance</h3>
                        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                        SAR {financials.openingBalance.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-slate-500 font-medium">Total Expenses</h3>
                        <div className="p-2 bg-red-50 rounded-full text-red-600">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                        -SAR {financials.totalExpenses.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Cost of Goods Sold</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-slate-500 font-medium">Total Revenue</h3>
                        <div className="p-2 bg-green-50 rounded-full text-green-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        +SAR {financials.totalRevenue.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-slate-500 font-medium">Current Balance</h3>
                        <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">
                        SAR {financials.currentBalance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-semibold text-lg mb-6">Recent Sales Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboardData?.recentSales || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                    }}
                                    formatter={(value: number) => [`SAR ${value}`, 'Amount']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-lg">Lowest Stock Alerts</h3>
                        <AlertCircle size={18} className="text-amber-500" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardData?.lowStockProducts || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={12} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="stock" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
