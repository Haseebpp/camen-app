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
    Download,
    Settings as SettingsIcon,
    Loader2,
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
import { ReportsSkeleton } from '@/components/skeletons/ReportsSkeleton';
import { Modal } from '@/components/ui/modal';

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

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportProgress, setExportProgress] = useState<string | null>(null);
    const [exportConfig, setExportConfig] = useState({
        title: 'SalesTrack Analytics Report',
        format: 'pdf' as 'pdf' | 'xlsx',
        accentColor: '#6366f1',
        orientation: 'portrait' as 'portrait' | 'landscape',
        includeCharts: true,
        sections: {
            summary: true,
            events: true,
            staff: true,
            expenses: true,
            timeline: true,
            inventory: true,
            sales: true,
        }
    });

    const colorThemes = {
        '#6366f1': { name: 'Indigo', rgb: [99, 102, 241], bgRgb: [243, 244, 246] },
        '#22c55e': { name: 'Emerald', rgb: [34, 197, 94], bgRgb: [240, 253, 250] },
        '#ef4444': { name: 'Rose', rgb: [239, 68, 68], bgRgb: [254, 242, 242] },
        '#f59e0b': { name: 'Amber', rgb: [245, 158, 11], bgRgb: [254, 243, 199] },
        '#8b5cf6': { name: 'Purple', rgb: [139, 92, 246], bgRgb: [245, 243, 255] }
    };

    const getSvgChartAsPng = async (wrapperId: string): Promise<string | null> => {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return null;
        const svgElement = wrapper.querySelector('svg');
        if (!svgElement) return null;

        return new Promise((resolve) => {
            try {
                const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
                const width = svgElement.clientWidth || svgElement.viewBox.baseVal.width || 800;
                const height = svgElement.clientHeight || svgElement.viewBox.baseVal.height || 400;

                clonedSvg.setAttribute('width', width.toString());
                clonedSvg.setAttribute('height', height.toString());

                const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
                styleElement.textContent = `
                    text {
                        font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
                    }
                    .recharts-text {
                        fill: #64748b !important;
                        font-size: 11px !important;
                    }
                    .recharts-cartesian-grid-horizontal line,
                    .recharts-cartesian-grid-vertical line {
                        stroke: #e2e8f0 !important;
                        stroke-opacity: 0.8;
                    }
                `;
                clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

                const svgString = new XMLSerializer().serializeToString(clonedSvg);
                const canvas = document.createElement('canvas');
                const scale = 2;
                canvas.width = width * scale;
                canvas.height = height * scale;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(null);
                    return;
                }

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.scale(scale, scale);

                const img = new Image();
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    URL.revokeObjectURL(url);
                    resolve(canvas.toDataURL('image/png'));
                };

                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    resolve(null);
                };

                img.src = url;
            } catch (error) {
                console.error('Failed to convert SVG to PNG:', error);
                resolve(null);
            }
        });
    };

    const generateConfiguredPDF = async () => {
        if (!reportData || !financials) return;

        setExportProgress('Initializing PDF engine...');

        const doc = new jsPDF({
            orientation: exportConfig.orientation,
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - 2 * margin;
        const currentDate = new Date();
        const dateStr = currentDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const timeStr = currentDate.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });

        const theme = colorThemes[exportConfig.accentColor as keyof typeof colorThemes] || colorThemes['#6366f1'];
        const [themeR, themeG, themeB] = theme.rgb;

        const addHeader = (pdfDoc: typeof doc) => {
            pdfDoc.setFillColor(themeR, themeG, themeB);
            pdfDoc.rect(0, 0, pageWidth, 24, 'F');
            pdfDoc.setTextColor(255, 255, 255);
            pdfDoc.setFontSize(16);
            pdfDoc.setFont('helvetica', 'bold');
            pdfDoc.text('SalesTrack', margin, 15);
            pdfDoc.setFontSize(9);
            pdfDoc.setFont('helvetica', 'normal');
            pdfDoc.text(exportConfig.title, pageWidth - margin, 11, { align: 'right' });
            pdfDoc.text(dateStr, pageWidth - margin, 17, { align: 'right' });
            pdfDoc.setTextColor(0, 0, 0);
        };

        const addFooter = (pdfDoc: typeof doc, pageNum: number, totalPages: number) => {
            pdfDoc.setFontSize(8);
            pdfDoc.setTextColor(128, 128, 128);
            pdfDoc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            pdfDoc.text(`Generated: ${dateStr} at ${timeStr}`, margin, pageHeight - 10);
            pdfDoc.text('SalesTrack Business Report', pageWidth - margin, pageHeight - 10, { align: 'right' });
        };

        let yPos = 32;
        addHeader(doc);

        const checkAddPage = (heightNeeded: number) => {
            if (yPos + heightNeeded > pageHeight - 20) {
                doc.addPage();
                addHeader(doc);
                yPos = 32;
                return true;
            }
            return false;
        };

        // 1. Summary
        if (exportConfig.sections.summary) {
            setExportProgress('Formatting Executive Summary...');
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('Executive Summary', margin, yPos + 6);
            yPos += 10;

            doc.setFillColor(theme.bgRgb[0], theme.bgRgb[1], theme.bgRgb[2]);
            doc.roundedRect(margin, yPos, contentWidth, 30, 2, 2, 'F');

            const profitMargin = reportData.totals.revenue > 0
                ? ((reportData.totals.profit / reportData.totals.revenue) * 100).toFixed(1)
                : '0.0';

            const colWidth = contentWidth / 4;
            const kpiY = yPos + 13;

            doc.setTextColor(34, 197, 94);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`SAR ${reportData.totals.revenue.toLocaleString()}`, margin + 6, kpiY);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('Total Revenue', margin + 6, kpiY + 5);

            doc.setTextColor(239, 68, 68);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`SAR ${reportData.totals.expenses.toLocaleString()}`, margin + 6 + colWidth, kpiY);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('Total Expenses', margin + 6 + colWidth, kpiY + 5);

            doc.setTextColor(themeR, themeG, themeB);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`SAR ${reportData.totals.profit.toLocaleString()}`, margin + 6 + colWidth * 2, kpiY);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('Net Profit', margin + 6 + colWidth * 2, kpiY + 5);

            doc.setTextColor(245, 158, 11);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${profitMargin}%`, margin + 6 + colWidth * 3, kpiY);
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('Profit Margin', margin + 6 + colWidth * 3, kpiY + 5);

            yPos += 38;

            if (exportConfig.includeCharts) {
                setExportProgress('Capturing summary charts...');
                const revExpPng = await getSvgChartAsPng('export-chart-revenue-expenses');
                const expDistPng = await getSvgChartAsPng('export-chart-expenses-distribution');

                const chartW = contentWidth * 0.9;
                const chartH = chartW * 0.45;
                const chartX = margin + (contentWidth - chartW) / 2;

                if (revExpPng) {
                    checkAddPage(chartH + 15);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105);
                    doc.text('Revenue vs Expenses by Event', margin, yPos + 4);
                    yPos += 8;
                    doc.addImage(revExpPng, 'PNG', chartX, yPos, chartW, chartH);
                    yPos += chartH + 10;
                }

                if (expDistPng) {
                    checkAddPage(chartH + 15);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105);
                    doc.text('Expense Distribution', margin, yPos + 4);
                    yPos += 8;
                    doc.addImage(expDistPng, 'PNG', chartX, yPos, chartW, chartH);
                    yPos += chartH + 10;
                }
            }
        }

        // 2. Events Table
        if (exportConfig.sections.events) {
            setExportProgress('Formatting Events performance...');
            checkAddPage(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('Event Performance Detail', margin, yPos + 6);
            yPos += 10;

            const eventsData = reportData.events.map((ev) => [
                ev.event.name.length > 20 ? ev.event.name.substring(0, 20) + '...' : ev.event.name,
                ev.event.location.length > 12 ? ev.event.location.substring(0, 12) + '...' : ev.event.location,
                new Date(ev.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
                ev.event.status,
                ev.saleCount.toString(),
                `SAR ${ev.revenue.toLocaleString()}`,
                `SAR ${ev.expenses.toLocaleString()}`,
                `SAR ${ev.profit.toLocaleString()}`,
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Event', 'Location', 'Date', 'Status', 'Sales', 'Revenue', 'Expenses', 'Profit']],
                body: eventsData,
                theme: 'grid',
                headStyles: {
                    fillColor: [themeR, themeG, themeB],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 8
                },
                styles: { fontSize: 7.5, cellPadding: 2.5 },
                alternateRowStyles: { fillColor: [250, 250, 250] },
                columnStyles: {
                    5: { halign: 'right', textColor: [34, 197, 94] },
                    6: { halign: 'right', textColor: [239, 68, 68] },
                    7: { halign: 'right', fontStyle: 'bold' },
                },
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // 3. Staff Performance Table
        if (exportConfig.sections.staff) {
            setExportProgress('Formatting Staff Performance...');
            checkAddPage(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('Staff Performance Rankings', margin, yPos + 6);
            yPos += 10;

            const staffData = reportData.staffPerformance.map((s, idx) => [
                `#${idx + 1}`,
                s.staffName,
                s.totalSales.toString(),
                `SAR ${s.totalRevenue.toLocaleString()}`,
                `SAR ${s.averageOrderValue.toLocaleString()}`,
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Rank', 'Staff Member', 'Sales Count', 'Total Revenue', 'Avg Order Value']],
                body: staffData,
                theme: 'striped',
                headStyles: {
                    fillColor: [themeR, themeG, themeB],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 8
                },
                styles: { fontSize: 8, cellPadding: 2.5 },
                columnStyles: {
                    0: { halign: 'center', fontStyle: 'bold' },
                    3: { halign: 'right', textColor: [34, 197, 94] },
                    4: { halign: 'right' },
                },
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;

            if (exportConfig.includeCharts) {
                setExportProgress('Capturing staff performance chart...');
                const staffPng = await getSvgChartAsPng('export-chart-staff-performance');
                if (staffPng) {
                    const chartW = contentWidth * 0.9;
                    const chartH = chartW * 0.45;
                    const chartX = margin + (contentWidth - chartW) / 2;

                    checkAddPage(chartH + 15);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105);
                    doc.text('Staff Performance Analytics Chart', margin, yPos + 4);
                    yPos += 8;
                    doc.addImage(staffPng, 'PNG', chartX, yPos, chartW, chartH);
                    yPos += chartH + 10;
                }
            }
        }

        // 4. Expenses breakdown
        if (exportConfig.sections.expenses) {
            setExportProgress('Formatting Expenses details...');
            checkAddPage(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('Expense Breakdown by Category', margin, yPos + 6);
            yPos += 10;

            const totalExpenseAmount = reportData.expensesByCategory.reduce((sum, e) => sum + e.total, 0);
            const expenseData = reportData.expensesByCategory.map((e) => [
                e.category,
                e.count.toString(),
                `SAR ${e.total.toLocaleString()}`,
                `SAR ${Math.round(e.total / e.count).toLocaleString()}`,
                `${totalExpenseAmount > 0 ? ((e.total / totalExpenseAmount) * 100).toFixed(1) : '0.0'}%`,
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Category', 'Count', 'Total Amount', 'Average', '% of Total']],
                body: expenseData,
                theme: 'striped',
                headStyles: {
                    fillColor: [themeR, themeG, themeB],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 8
                },
                styles: { fontSize: 8, cellPadding: 2.5 },
                columnStyles: {
                    2: { halign: 'right', textColor: [239, 68, 68] },
                    3: { halign: 'right' },
                    4: { halign: 'right', fontStyle: 'bold' },
                },
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;

            if (exportConfig.includeCharts) {
                setExportProgress('Capturing expenses chart...');
                const expBarPng = await getSvgChartAsPng('export-chart-expenses-cat-bar');
                if (expBarPng) {
                    const chartW = contentWidth * 0.9;
                    const chartH = chartW * 0.45;
                    const chartX = margin + (contentWidth - chartW) / 2;

                    checkAddPage(chartH + 15);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105);
                    doc.text('Expenses Category Chart', margin, yPos + 4);
                    yPos += 8;
                    doc.addImage(expBarPng, 'PNG', chartX, yPos, chartW, chartH);
                    yPos += chartH + 10;
                }
            }
        }

        // 5. Sales Timeline
        if (exportConfig.sections.timeline) {
            setExportProgress('Formatting Sales timeline...');
            checkAddPage(40);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('30-Day Sales Timeline Summary', margin, yPos + 6);
            yPos += 10;

            const nonZeroDays = reportData.salesTimeline.filter(t => t.amount > 0);
            const totalTimelineAmount = nonZeroDays.reduce((sum, t) => sum + t.amount, 0);
            const avgDaily = nonZeroDays.length > 0 ? totalTimelineAmount / nonZeroDays.length : 0;
            const maxDay = nonZeroDays.reduce((max, t) => t.amount > max.amount ? t : max, { date: '', amount: 0 });

            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');

            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            const statsColW = contentWidth / 4;
            const textY = yPos + 12;

            doc.setTextColor(themeR, themeG, themeB);
            doc.text(`Active Days: ${nonZeroDays.length}`, margin + 6, textY);
            doc.setTextColor(34, 197, 94);
            doc.text(`Avg Daily: SAR ${Math.round(avgDaily).toLocaleString()}`, margin + 6 + statsColW, textY);
            doc.setTextColor(245, 158, 11);
            doc.text(`Best Day: SAR ${maxDay.amount.toLocaleString()}`, margin + 6 + statsColW * 2, textY);
            doc.setTextColor(139, 92, 246);
            doc.text(`30-Day Total: SAR ${totalTimelineAmount.toLocaleString()}`, margin + 6 + statsColW * 3, textY);

            yPos += 26;

            if (exportConfig.includeCharts) {
                setExportProgress('Capturing sales timeline chart...');
                const timelinePng = await getSvgChartAsPng('export-chart-sales-timeline');
                if (timelinePng) {
                    const chartW = contentWidth * 0.9;
                    const chartH = chartW * 0.45;
                    const chartX = margin + (contentWidth - chartW) / 2;

                    checkAddPage(chartH + 15);
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(71, 85, 105);
                    doc.text('30-Day Sales Trend Line', margin, yPos + 4);
                    yPos += 8;
                    doc.addImage(timelinePng, 'PNG', chartX, yPos, chartW, chartH);
                    yPos += chartH + 10;
                }
            }
        }

        // 6. Products Inventory status
        if (exportConfig.sections.inventory) {
            setExportProgress('Formatting Inventory status...');
            checkAddPage(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('Inventory & Stock Analysis', margin, yPos + 6);
            yPos += 10;

            const inventoryData = products.map((p, idx) => [
                `#${idx + 1}`,
                p.itemCode,
                p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
                p.category,
                `SAR ${p.sellingPrice.toLocaleString()}`,
                p.stockQuantity.toString(),
                p.soldQuantity.toString(),
                p.stockQuantity <= 10 ? 'LOW STOCK' : 'OK',
                `SAR ${(p.stockQuantity * p.sellingPrice).toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Rank', 'Item Code', 'Product', 'Category', 'Price', 'Stock', 'Sold', 'Status', 'Revenue Potential']],
                body: inventoryData,
                theme: 'grid',
                headStyles: {
                    fillColor: [themeR, themeG, themeB],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 8
                },
                styles: { fontSize: 7, cellPadding: 2 },
                columnStyles: {
                    4: { halign: 'right' },
                    5: { halign: 'center' },
                    6: { halign: 'center' },
                    7: { halign: 'center', fontStyle: 'bold' },
                    8: { halign: 'right', fontStyle: 'bold' }
                }
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // 7. Recent Transactions (Sales Log)
        if (exportConfig.sections.sales) {
            setExportProgress('Formatting Sales transactions...');
            checkAddPage(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('Detailed Sales Transactions Log', margin, yPos + 6);
            yPos += 10;

            const allSalesData = sales.map((s) => [
                new Date(s.timestamp).toLocaleDateString('en-US'),
                s.type,
                s.comboName || 'N/A',
                `SAR ${s.totalAmount.toLocaleString()}`,
                s.soldBy,
                s.event?.name || 'No Event',
                s.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ') || 'N/A'
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Type', 'Combo Name', 'Total Amount', 'Sold By', 'Event', 'Items detail']],
                body: allSalesData,
                theme: 'grid',
                headStyles: {
                    fillColor: [themeR, themeG, themeB],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 8
                },
                styles: { fontSize: 6.5, cellPadding: 2 },
                columnStyles: {
                    3: { halign: 'right', fontStyle: 'bold', textColor: [34, 197, 94] },
                    6: { cellWidth: 50 }
                }
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // Add footers to all pages
        setExportProgress('Finalizing page numbers...');
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter(doc, i, totalPages);
        }

        setExportProgress('Downloading PDF...');
        const cleanedTitle = exportConfig.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${cleanedTitle}_${currentDate.toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        setExportProgress(null);
        setIsExportModalOpen(false);
    };

    const generateConfiguredExcel = () => {
        if (!reportData) return;

        setExportProgress('Generating Excel sheets...');
        const wb = XLSX.utils.book_new();
        const currentDate = new Date();
        const dateStr = currentDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const profitMargin = reportData.totals.revenue > 0
            ? ((reportData.totals.profit / reportData.totals.revenue) * 100).toFixed(1)
            : '0.0';
        const nonZeroDays = reportData.salesTimeline.filter(t => t.amount > 0);
        const totalTimelineAmount = nonZeroDays.reduce((sum, t) => sum + t.amount, 0);
        const avgDaily = nonZeroDays.length > 0 ? Math.round(totalTimelineAmount / nonZeroDays.length) : 0;
        const totalExpenseAmount = reportData.expensesByCategory.reduce((sum, e) => sum + e.total, 0);

        if (exportConfig.sections.summary) {
            const summaryData = [
                [exportConfig.title.toUpperCase()],
                [],
                ['Report Information'],
                ['Generated Date', dateStr],
                ['Generated Time', currentDate.toLocaleTimeString('en-US')],
                [],
                ['FINANCIAL SUMMARY'],
                ['Metric', 'Value (SAR)', 'Notes'],
                ['Total Revenue', reportData.totals.revenue, 'All sales income'],
                ['Total Expenses', reportData.totals.expenses, 'Operational costs'],
                ['Net Profit', reportData.totals.profit, 'Revenue - Expenses'],
                ['Profit Margin', `${profitMargin}%`, 'Profit / Revenue'],
                [],
                ['BUSINESS METRICS'],
                ['Metric', 'Count'],
                ['Total Events', reportData.events.length],
                ['Staff Members', reportData.staffPerformance.length],
                ['Expense Categories', reportData.expensesByCategory.length],
                ['Active Sales Days (30d)', nonZeroDays.length],
                [],
                ['30-DAY SALES SUMMARY'],
                ['Metric', 'Value (SAR)'],
                ['Total Sales (30 days)', totalTimelineAmount],
                ['Average Daily Sales', avgDaily],
                ['Best Single Day', nonZeroDays.length > 0 ? Math.max(...nonZeroDays.map(d => d.amount)) : 0],
            ];
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 25 }];
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
        }

        if (exportConfig.sections.events) {
            const eventsSheetData = reportData.events.map((ev, idx) => ({
                '#': idx + 1,
                'Event Name': ev.event.name,
                'Location': ev.event.location,
                'Date': new Date(ev.event.date).toLocaleDateString('en-US'),
                'Status': ev.event.status,
                'Sales Count': ev.saleCount,
                'Expense Count': ev.expenseCount,
                'Revenue (SAR)': ev.revenue,
                'Expenses (SAR)': ev.expenses,
                'COGS (SAR)': ev.cogs,
                'Profit (SAR)': ev.profit,
                'Profit Margin %': ev.revenue > 0 ? ((ev.profit / ev.revenue) * 100).toFixed(1) : '0.0',
            }));
            const wsEvents = XLSX.utils.json_to_sheet(eventsSheetData);
            wsEvents['!cols'] = [
                { wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 10 },
                { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
                { wch: 15 }, { wch: 15 }
            ];
            XLSX.utils.book_append_sheet(wb, wsEvents, 'Events');
        }

        if (exportConfig.sections.staff) {
            const staffSheetData = reportData.staffPerformance.map((s, idx) => ({
                'Rank': idx + 1,
                'Staff Name': s.staffName,
                'Total Sales': s.totalSales,
                'Total Revenue (SAR)': s.totalRevenue,
                'Average Order Value (SAR)': s.averageOrderValue,
                '% of Total Revenue': reportData.totals.revenue > 0
                    ? ((s.totalRevenue / reportData.totals.revenue) * 100).toFixed(1)
                    : '0.0',
            }));
            const wsStaff = XLSX.utils.json_to_sheet(staffSheetData);
            wsStaff['!cols'] = [
                { wch: 6 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 18 }
            ];
            XLSX.utils.book_append_sheet(wb, wsStaff, 'Staff Performance');
        }

        if (exportConfig.sections.expenses) {
            const expensesCatData = reportData.expensesByCategory.map((e, idx) => ({
                '#': idx + 1,
                'Category': e.category,
                'Transaction Count': e.count,
                'Total Amount (SAR)': e.total,
                'Average per Transaction (SAR)': Math.round(e.total / e.count),
                '% of Total Expenses': ((e.total / totalExpenseAmount) * 100).toFixed(1),
            }));
            const wsExpensesCat = XLSX.utils.json_to_sheet(expensesCatData);
            wsExpensesCat['!cols'] = [
                { wch: 5 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 28 }, { wch: 18 }
            ];
            XLSX.utils.book_append_sheet(wb, wsExpensesCat, 'Expenses by Category');
        }

        if (exportConfig.sections.timeline) {
            let runningTotal = 0;
            const timelineData = reportData.salesTimeline.map((t, idx) => {
                runningTotal += t.amount;
                return {
                    'Day #': idx + 1,
                    'Date': t.date,
                    'Day of Week': new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' }),
                    'Sales Amount (SAR)': t.amount,
                    'Running Total (SAR)': runningTotal,
                    'Status': t.amount > 0 ? 'Active' : 'No Sales',
                };
            });
            const wsTimeline = XLSX.utils.json_to_sheet(timelineData);
            wsTimeline['!cols'] = [
                { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 10 }
            ];
            XLSX.utils.book_append_sheet(wb, wsTimeline, 'Sales Timeline');
        }

        if (exportConfig.sections.inventory) {
            const inventoryData = products.map((p, idx) => ({
                '#': idx + 1,
                'Item Code': p.itemCode,
                'Product Name': p.name,
                'Category': p.category,
                'Selling Price (SAR)': p.sellingPrice,
                'Current Stock': p.stockQuantity,
                'Initial Stock': p.initialStock,
                'Quantity Sold': p.soldQuantity,
                'Stock Status': p.stockQuantity <= 10 ? 'LOW STOCK' : 'OK',
                'Revenue Potential (SAR)': p.stockQuantity * p.sellingPrice,
            }));
            const wsProducts = XLSX.utils.json_to_sheet(inventoryData);
            wsProducts['!cols'] = [
                { wch: 5 }, { wch: 12 }, { wch: 25 }, { wch: 15 },
                { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
                { wch: 12 }, { wch: 20 }
            ];
            XLSX.utils.book_append_sheet(wb, wsProducts, 'Inventory');
        }

        if (exportConfig.sections.sales) {
            const allSalesData = sales.map((s, idx) => ({
                '#': idx + 1,
                'Date': new Date(s.timestamp).toLocaleDateString('en-US'),
                'Time': new Date(s.timestamp).toLocaleTimeString('en-US'),
                'Sale Type': s.type,
                'Combo Name': s.comboName || 'N/A',
                'Items Count': s.items?.length || 0,
                'Total Amount (SAR)': s.totalAmount,
                'Sold By': s.soldBy,
                'Event': s.event?.name || 'No Event',
                'Items Detail': s.items?.map(i => `${i.productName} x${i.quantity}`).join(', ') || 'N/A',
            }));
            const wsSales = XLSX.utils.json_to_sheet(allSalesData);
            wsSales['!cols'] = [
                { wch: 5 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
                { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 50 }
            ];
            XLSX.utils.book_append_sheet(wb, wsSales, 'All Sales');
        }

        setExportProgress('Downloading Excel file...');
        const cleanedTitle = exportConfig.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${cleanedTitle}_${currentDate.toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        setExportProgress(null);
        setIsExportModalOpen(false);
    };

    const handleExport = async () => {
        if (exportConfig.format === 'pdf') {
            await generateConfiguredPDF();
        } else {
            generateConfiguredExcel();
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'staff', label: 'Staff Performance', icon: Users },
        { id: 'expenses', label: 'Expenses', icon: PieChart },
        { id: 'timeline', label: 'Sales Timeline', icon: TrendingUp },
    ];

    if (isLoading) {
        return <ReportsSkeleton />;
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
                    <Button
                        onClick={() => setIsExportModalOpen(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md flex items-center gap-2"
                    >
                        <SettingsIcon size={18} /> Configure & Export
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

            {/* Export Settings Modal */}
            <Modal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                title="Export Analytics Report"
                className="max-w-2xl"
            >
                {exportProgress ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <p className="text-lg font-semibold text-slate-700">Generating Report...</p>
                        <p className="text-sm text-slate-500 animate-pulse">{exportProgress}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: General Configuration */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Report Title
                                    </label>
                                    <input
                                        type="text"
                                        value={exportConfig.title}
                                        onChange={(e) => setExportConfig({ ...exportConfig, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                                        Export Format
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setExportConfig({ ...exportConfig, format: 'pdf' })}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                                exportConfig.format === 'pdf'
                                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <FileText className="w-6 h-6 mb-1" />
                                            <span className="text-sm font-semibold">PDF Document</span>
                                            <span className="text-[10px] opacity-70">With Charts & Layout</span>
                                        </button>
                                        <button
                                            onClick={() => setExportConfig({ ...exportConfig, format: 'xlsx' })}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                                exportConfig.format === 'xlsx'
                                                    ? 'border-green-600 bg-green-50/50 text-green-700'
                                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <TableIcon className="w-6 h-6 mb-1" />
                                            <span className="text-sm font-semibold">Excel Sheet</span>
                                            <span className="text-[10px] opacity-70">Raw Data & Sheets</span>
                                        </button>
                                    </div>
                                </div>

                                {exportConfig.format === 'pdf' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                                                Accent Color Theme
                                            </label>
                                            <div className="flex gap-3">
                                                {Object.entries(colorThemes).map(([hex, info]) => (
                                                    <button
                                                        key={hex}
                                                        onClick={() => setExportConfig({ ...exportConfig, accentColor: hex })}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                            exportConfig.accentColor === hex
                                                                ? 'ring-4 ring-offset-2 ring-slate-400 scale-110'
                                                                : 'hover:scale-105'
                                                        }`}
                                                        style={{ backgroundColor: hex }}
                                                        title={info.name}
                                                    >
                                                        {exportConfig.accentColor === hex && (
                                                            <span className="text-white text-xs font-bold">✓</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                                                Page Orientation
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setExportConfig({ ...exportConfig, orientation: 'portrait' })}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                        exportConfig.orientation === 'portrait'
                                                            ? 'bg-slate-800 text-white border-slate-800'
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    Portrait
                                                </button>
                                                <button
                                                    onClick={() => setExportConfig({ ...exportConfig, orientation: 'landscape' })}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                        exportConfig.orientation === 'landscape'
                                                            ? 'bg-slate-800 text-white border-slate-800'
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    Landscape
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Include Graphical Charts</p>
                                                <p className="text-xs text-slate-500">Embed visual charts in the PDF</p>
                                            </div>
                                            <button
                                                onClick={() => setExportConfig({ ...exportConfig, includeCharts: !exportConfig.includeCharts })}
                                                className={`w-11 h-6 rounded-full transition-colors relative ${
                                                    exportConfig.includeCharts ? 'bg-indigo-600' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform ${
                                                        exportConfig.includeCharts ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right Column: Sections Selection */}
                            <div className="space-y-4">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                                    Select Report Sections
                                </label>
                                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                                    {Object.entries({
                                        summary: { label: 'Executive Summary', icon: DollarSign, desc: 'Profit margin, revenue, operational costs summary' },
                                        events: { label: 'Event Performance', icon: Calendar, desc: 'Sales, revenue, profit per event table' },
                                        staff: { label: 'Staff Performance', icon: Users, desc: 'Rankings, sales counts, avg order values' },
                                        expenses: { label: 'Expenses Breakdown', icon: PieChart, desc: 'Expenses by category breakdown' },
                                        timeline: { label: 'Sales Timeline', icon: TrendingUp, desc: '30-day timeline details & stats' },
                                        inventory: { label: 'Products Inventory', icon: TableIcon, desc: 'All products list, prices, current stock status' },
                                        sales: { label: 'Recent Transactions', icon: FileText, desc: 'Detailed history of individual sales' },
                                    }).map(([key, info]) => {
                                        const isChecked = exportConfig.sections[key as keyof typeof exportConfig.sections];
                                        const Icon = info.icon;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setExportConfig({
                                                        ...exportConfig,
                                                        sections: {
                                                            ...exportConfig.sections,
                                                            [key]: !isChecked
                                                        }
                                                    });
                                                }}
                                                className={`w-full flex items-start p-2.5 rounded-xl border text-left transition-all ${
                                                    isChecked
                                                        ? 'border-indigo-100 bg-indigo-50/20'
                                                        : 'border-slate-100 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className={`mt-0.5 mr-3 p-1.5 rounded-lg ${isChecked ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                                        {info.label}
                                                        <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                                                            isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                                                        }`}>
                                                            {isChecked && '✓'}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate mt-0.5">{info.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleExport}
                                className={exportConfig.format === 'pdf' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'}
                                disabled={!Object.values(exportConfig.sections).some(Boolean)}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Hidden charts for exporting */}
            <div className="absolute -left-[9999px] top-0 pointer-events-none opacity-0" style={{ width: '800px' }}>
                <div id="export-chart-revenue-expenses" className="bg-white p-4">
                    {reportData && (
                        <BarChart width={760} height={360} data={reportData.events.map(e => ({
                            name: e.event.name.length > 15 ? e.event.name.substring(0, 15) + '...' : e.event.name,
                            revenue: e.revenue,
                            expenses: e.expenses,
                            profit: e.profit,
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                            <Bar dataKey="profit" fill="#6366f1" name="Profit" />
                        </BarChart>
                    )}
                </div>

                <div id="export-chart-expenses-distribution" className="bg-white p-4">
                    {reportData && (
                        <RechartsPieChart width={760} height={360}>
                            <Pie
                                data={reportData.expensesByCategory}
                                dataKey="total"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                fill="#8884d8"
                                label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {reportData.expensesByCategory.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </RechartsPieChart>
                    )}
                </div>

                <div id="export-chart-staff-performance" className="bg-white p-4">
                    {reportData && (
                        <BarChart width={760} height={360} data={reportData.staffPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="staffName" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis yAxisId="left" stroke="#6366f1" tick={{ fontSize: 10 }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#22c55e" tick={{ fontSize: 10 }} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="totalRevenue" fill="#6366f1" name="Total Revenue" />
                            <Bar yAxisId="right" dataKey="totalSales" fill="#22c55e" name="Sales Count" />
                        </BarChart>
                    )}
                </div>

                <div id="export-chart-expenses-cat-bar" className="bg-white p-4">
                    {reportData && (
                        <BarChart width={760} height={360} data={reportData.expensesByCategory} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Bar dataKey="total" fill="#ef4444" name="Total Expenses">
                                {reportData.expensesByCategory.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </div>

                <div id="export-chart-sales-timeline" className="bg-white p-4">
                    {reportData && (
                        <AreaChart width={760} height={360} data={reportData.salesTimeline}>
                            <defs>
                                <linearGradient id="colorAmountExport" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 9, fill: '#64748b' }}
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmountExport)" />
                        </AreaChart>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
