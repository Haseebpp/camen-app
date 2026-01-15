import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    FileText,
    Table as TableIcon,
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    Calendar,
    MapPin,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { RootState } from '@/state/store';
import reportService from '@/state/services/reportService';
import type { Financials, EventsReportData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Chart colors
const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

type TabType = 'overview' | 'events' | 'staff' | 'expenses' | 'timeline';

const Reports: React.FC = () => {
    const { settings } = useSelector((state: RootState) => state.settings);
    const { products } = useSelector((state: RootState) => state.products);
    const { sales } = useSelector((state: RootState) => state.sales);

    const [financials, setFinancials] = useState<Financials | null>(null);
    const [reportData, setReportData] = useState<EventsReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [financialsData, eventsReportData] = await Promise.all([
                reportService.getFinancials(),
                reportService.getEventsReport(),
            ]);
            setFinancials(financialsData);
            setReportData(eventsReportData);
        } catch (error) {
            console.error('Failed to load report data:', error);
            setError('Failed to load report data. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const exportPDF = () => {
        if (!reportData || !financials) return;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('SalesTrack - Comprehensive Report', 14, 22);

        // Metadata
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`User: ${settings?.userEmail || 'N/A'}`, 14, 36);

        // Summary Section
        doc.setFillColor(241, 245, 249);
        doc.rect(14, 45, 182, 35, 'F');
        doc.setFontSize(12);
        doc.text('Financial Summary', 20, 55);
        doc.setFontSize(10);
        doc.text(`Total Revenue: SAR ${reportData.totals.revenue.toLocaleString()}`, 20, 65);
        doc.text(`Total Expenses: SAR ${reportData.totals.expenses.toLocaleString()}`, 80, 65);
        doc.text(`Net Profit: SAR ${reportData.totals.profit.toLocaleString()}`, 140, 65);
        doc.text(`Events Count: ${reportData.events.length}`, 20, 73);
        doc.text(`Staff Members: ${reportData.staffPerformance.length}`, 80, 73);

        // Events Table
        doc.setFontSize(14);
        doc.text('Event Performance Summary', 14, 95);

        const eventsData = reportData.events.map((ev) => [
            ev.event.name,
            ev.event.location,
            new Date(ev.event.date).toLocaleDateString(),
            ev.event.status,
            `SAR ${ev.revenue.toLocaleString()}`,
            `SAR ${ev.expenses.toLocaleString()}`,
            `SAR ${ev.profit.toLocaleString()}`,
        ]);

        autoTable(doc, {
            startY: 100,
            head: [['Event', 'Location', 'Date', 'Status', 'Revenue', 'Expenses', 'Profit']],
            body: eventsData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 8 },
        });

        // Staff Performance
        const finalY1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 150;
        doc.text('Staff Performance', 14, finalY1 + 15);

        const staffData = reportData.staffPerformance.map((s) => [
            s.staffName,
            s.totalSales.toString(),
            `SAR ${s.totalRevenue.toLocaleString()}`,
            `SAR ${s.averageOrderValue}`,
        ]);

        autoTable(doc, {
            startY: finalY1 + 20,
            head: [['Staff Member', 'Total Sales', 'Total Revenue', 'Avg Order Value']],
            body: staffData,
            theme: 'striped',
        });

        // Expenses by Category
        const finalY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 200;

        if (finalY2 > 250) {
            doc.addPage();
            doc.text('Expenses by Category', 14, 20);

            const expenseData = reportData.expensesByCategory.map((e) => [
                e.category,
                e.count.toString(),
                `SAR ${e.total.toLocaleString()}`,
            ]);

            autoTable(doc, {
                startY: 25,
                head: [['Category', 'Count', 'Total Amount']],
                body: expenseData,
                theme: 'striped',
            });
        } else {
            doc.text('Expenses by Category', 14, finalY2 + 15);

            const expenseData = reportData.expensesByCategory.map((e) => [
                e.category,
                e.count.toString(),
                `SAR ${e.total.toLocaleString()}`,
            ]);

            autoTable(doc, {
                startY: finalY2 + 20,
                head: [['Category', 'Count', 'Total Amount']],
                body: expenseData,
                theme: 'striped',
            });
        }

        doc.save('SalesTrack_Comprehensive_Report.pdf');
    };

    const exportExcel = () => {
        if (!reportData) return;

        const wb = XLSX.utils.book_new();

        // Sheet 1: Summary
        const summaryData = [
            ['SalesTrack Comprehensive Report'],
            ['Generated:', new Date().toLocaleString()],
            [],
            ['FINANCIAL SUMMARY'],
            ['Total Revenue', `SAR ${reportData.totals.revenue.toLocaleString()}`],
            ['Total Expenses', `SAR ${reportData.totals.expenses.toLocaleString()}`],
            ['Net Profit', `SAR ${reportData.totals.profit.toLocaleString()}`],
            [],
            ['COUNTS'],
            ['Events', reportData.events.length],
            ['Staff Members', reportData.staffPerformance.length],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // Sheet 2: Events
        const wsEvents = XLSX.utils.json_to_sheet(
            reportData.events.map((ev) => ({
                'Event Name': ev.event.name,
                'Location': ev.event.location,
                'Date': new Date(ev.event.date).toLocaleDateString(),
                'Status': ev.event.status,
                'Sales Count': ev.saleCount,
                'Expense Count': ev.expenseCount,
                'Revenue': ev.revenue,
                'Expenses': ev.expenses,
                'COGS': ev.cogs,
                'Profit': ev.profit,
            }))
        );
        XLSX.utils.book_append_sheet(wb, wsEvents, 'Events');

        // Sheet 3: Staff Performance
        const wsStaff = XLSX.utils.json_to_sheet(
            reportData.staffPerformance.map((s) => ({
                'Staff Name': s.staffName,
                'Total Sales': s.totalSales,
                'Total Revenue': s.totalRevenue,
                'Average Order Value': s.averageOrderValue,
            }))
        );
        XLSX.utils.book_append_sheet(wb, wsStaff, 'Staff Performance');

        // Sheet 4: Expenses by Category
        const wsExpenses = XLSX.utils.json_to_sheet(
            reportData.expensesByCategory.map((e) => ({
                'Category': e.category,
                'Count': e.count,
                'Total Amount': e.total,
            }))
        );
        XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses by Category');

        // Sheet 5: Sales Timeline
        const wsTimeline = XLSX.utils.json_to_sheet(
            reportData.salesTimeline.map((t) => ({
                'Date': t.date,
                'Sales Amount': t.amount,
            }))
        );
        XLSX.utils.book_append_sheet(wb, wsTimeline, 'Sales Timeline');

        // Sheet 6: Products (from redux)
        const wsProducts = XLSX.utils.json_to_sheet(
            products.map((p) => ({
                Code: p.itemCode,
                Name: p.name,
                Category: p.category,
                Cost: p.costPrice,
                Price: p.sellingPrice,
                Stock: p.stockQuantity,
                Sold: p.soldQuantity,
            }))
        );
        XLSX.utils.book_append_sheet(wb, wsProducts, 'Inventory');

        // Sheet 7: All Sales (from redux)
        const wsSales = XLSX.utils.json_to_sheet(
            sales.map((s) => ({
                Date: new Date(s.timestamp).toLocaleString(),
                Type: s.type,
                ComboName: s.comboName || 'N/A',
                TotalAmount: s.totalAmount,
                SoldBy: s.soldBy,
                Event: s.event?.name || 'N/A',
            }))
        );
        XLSX.utils.book_append_sheet(wb, wsSales, 'All Sales');

        XLSX.writeFile(wb, 'SalesTrack_Comprehensive_Report.xlsx');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'staff', label: 'Staff Performance', icon: Users },
        { id: 'expenses', label: 'Expenses', icon: PieChart },
        { id: 'timeline', label: 'Sales Timeline', icon: TrendingUp },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin text-indigo-600">
                        <RefreshCw size={40} />
                    </div>
                    <p className="text-slate-500 font-medium">Loading reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <Users size={40} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
                <p className="text-slate-500 mb-6 max-w-md">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Reports & Analytics</h2>
                    <p className="text-slate-500">Comprehensive analysis of your events, sales, and performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={exportPDF} variant="secondary">
                        <FileText size={18} /> Export PDF
                    </Button>
                    <Button onClick={exportExcel} className="bg-green-600 hover:bg-green-700">
                        <TableIcon size={18} /> Export Excel
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold mt-1">SAR {reportData.totals.revenue.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <ArrowUpRight size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-xl text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                                <p className="text-2xl font-bold mt-1">SAR {reportData.totals.expenses.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <ArrowDownRight size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-xl text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium">Net Profit</p>
                                <p className="text-2xl font-bold mt-1">SAR {reportData.totals.profit.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <DollarSign size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-xl text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm font-medium">Total Events</p>
                                <p className="text-2xl font-bold mt-1">{reportData.events.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Calendar size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Tab Content */}
            {reportData && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue vs Expenses by Event</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.events.map(e => ({
                                            name: e.event.name.length > 15 ? e.event.name.substring(0, 15) + '...' : e.event.name,
                                            revenue: e.revenue,
                                            expenses: e.expenses,
                                            profit: e.profit,
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `SAR ${Number(value).toLocaleString()}`} />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                                            <Bar dataKey="profit" fill="#6366f1" name="Profit" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Expense Distribution</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={reportData.expensesByCategory}
                                                    dataKey="total"
                                                    nameKey="category"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                                                >
                                                    {reportData.expensesByCategory.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `SAR ${Number(value).toLocaleString()}`} />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Staff Performers</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={reportData.staffPerformance.slice(0, 5)} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="staffName" type="category" width={100} tick={{ fontSize: 12 }} />
                                                <Tooltip formatter={(value) => `SAR ${Number(value).toLocaleString()}`} />
                                                <Bar dataKey="totalRevenue" fill="#6366f1" name="Total Revenue" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800">Event Performance Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {reportData.events.map((ev) => (
                                    <div key={ev.event._id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">{ev.event.name}</h4>
                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                    <MapPin size={12} /> {ev.event.location}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {new Date(ev.event.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant={ev.event.status === 'OPEN' ? 'success' : 'secondary'}>
                                                {ev.event.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="bg-green-50 p-2 rounded-lg">
                                                <p className="text-green-600 font-medium">SAR {ev.revenue.toLocaleString()}</p>
                                                <p className="text-xs text-green-500">Revenue</p>
                                            </div>
                                            <div className="bg-red-50 p-2 rounded-lg">
                                                <p className="text-red-600 font-medium">SAR {ev.expenses.toLocaleString()}</p>
                                                <p className="text-xs text-red-500">Expenses</p>
                                            </div>
                                            <div className="bg-indigo-50 p-2 rounded-lg">
                                                <p className={`font-medium ${ev.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                                                    SAR {ev.profit.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-indigo-500">Profit</p>
                                            </div>
                                            <div className="bg-amber-50 p-2 rounded-lg">
                                                <p className="text-amber-600 font-medium">{ev.saleCount}</p>
                                                <p className="text-xs text-amber-500">Sales</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Sales</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Expenses</TableHead>
                                        <TableHead>Profit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.events.map((ev) => (
                                        <TableRow key={ev.event._id}>
                                            <TableCell className="font-medium">{ev.event.name}</TableCell>
                                            <TableCell className="text-sm text-slate-500">{ev.event.location}</TableCell>
                                            <TableCell>{new Date(ev.event.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={ev.event.status === 'OPEN' ? 'success' : 'secondary'}>
                                                    {ev.event.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{ev.saleCount}</TableCell>
                                            <TableCell className="text-green-600 font-medium">SAR {ev.revenue.toLocaleString()}</TableCell>
                                            <TableCell className="text-red-600">SAR {ev.expenses.toLocaleString()}</TableCell>
                                            <TableCell className={`font-medium ${ev.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                                                SAR {ev.profit.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Staff Performance Tab */}
                    {activeTab === 'staff' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800">Staff Performance Analysis</h3>

                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.staffPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="staffName" tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                                        <Tooltip formatter={(value, name) => [
                                            name === 'totalRevenue' ? `SAR ${Number(value).toLocaleString()}` : value,
                                            name === 'totalRevenue' ? 'Revenue' : 'Sales Count'
                                        ]} />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="totalRevenue" fill="#6366f1" name="Total Revenue" />
                                        <Bar yAxisId="right" dataKey="totalSales" fill="#22c55e" name="Sales Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Staff Member</TableHead>
                                        <TableHead>Total Sales</TableHead>
                                        <TableHead>Total Revenue</TableHead>
                                        <TableHead>Avg Order Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.staffPerformance.map((staff, idx) => (
                                        <TableRow key={staff.staffName}>
                                            <TableCell>
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                                                        idx === 2 ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {idx + 1}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">{staff.staffName}</TableCell>
                                            <TableCell>{staff.totalSales}</TableCell>
                                            <TableCell className="text-green-600 font-medium">
                                                SAR {staff.totalRevenue.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-indigo-600">
                                                SAR {staff.averageOrderValue.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Expenses Tab */}
                    {activeTab === 'expenses' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800">Expense Analysis by Category</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={reportData.expensesByCategory}
                                                dataKey="total"
                                                nameKey="category"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                label={({ category, total }) => `${category}: SAR ${total.toLocaleString()}`}
                                            >
                                                {reportData.expensesByCategory.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `SAR ${Number(value).toLocaleString()}`} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.expensesByCategory} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(value) => `SAR ${Number(value).toLocaleString()}`} />
                                            <Bar dataKey="total" fill="#ef4444" name="Total Expenses">
                                                {reportData.expensesByCategory.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Count</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Average</TableHead>
                                        <TableHead>% of Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.expensesByCategory.map((cat, idx) => (
                                        <TableRow key={cat.category}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    />
                                                    <span className="font-medium">{cat.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{cat.count}</TableCell>
                                            <TableCell className="text-red-600 font-medium">
                                                SAR {cat.total.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                SAR {Math.round(cat.total / cat.count).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {((cat.total / reportData.totals.expenses) * 100).toFixed(1)}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800">Sales Timeline (Last 30 Days)</h3>

                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={reportData.salesTimeline}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`SAR ${Number(value).toLocaleString()}`, 'Sales']}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#6366f1"
                                            fillOpacity={1}
                                            fill="url(#colorAmount)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {(() => {
                                    const nonZeroDays = reportData.salesTimeline.filter(t => t.amount > 0);
                                    const totalAmount = nonZeroDays.reduce((sum, t) => sum + t.amount, 0);
                                    const avgDaily = nonZeroDays.length > 0 ? totalAmount / nonZeroDays.length : 0;
                                    const maxDay = nonZeroDays.reduce((max, t) => t.amount > max.amount ? t : max, { date: '', amount: 0 });

                                    return (
                                        <>
                                            <div className="bg-indigo-50 p-4 rounded-xl">
                                                <p className="text-sm text-indigo-600 font-medium">Active Days</p>
                                                <p className="text-2xl font-bold text-indigo-800">{nonZeroDays.length}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-xl">
                                                <p className="text-sm text-green-600 font-medium">Avg Daily Sales</p>
                                                <p className="text-2xl font-bold text-green-800">SAR {Math.round(avgDaily).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-amber-50 p-4 rounded-xl">
                                                <p className="text-sm text-amber-600 font-medium">Best Day</p>
                                                <p className="text-2xl font-bold text-amber-800">SAR {maxDay.amount.toLocaleString()}</p>
                                                <p className="text-xs text-amber-600">
                                                    {maxDay.date ? new Date(maxDay.date).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-xl">
                                                <p className="text-sm text-purple-600 font-medium">30-Day Total</p>
                                                <p className="text-2xl font-bold text-purple-800">SAR {totalAmount.toLocaleString()}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            )}

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

export default Reports;
