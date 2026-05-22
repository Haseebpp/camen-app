import React from 'react';
import { useData } from '../contexts/DataContext';
import { FileDown, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const { state, getFinancials } = useData();

  const exportPDF = () => {
    const doc = new jsPDF();
    const { totalRevenue, currentBalance } = getFinancials();

    // Title
    doc.setFontSize(20);
    doc.text('SalesTrack AI - Detailed Report', 14, 22);

    // Metadata
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`User: ${state.settings.userEmail}`, 14, 36);

    // Summary Section
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 45, 182, 30, 'F');
    doc.setFontSize(12);
    doc.text('Financial Summary', 20, 55);
    doc.setFontSize(10);
    doc.text(`Opening Balance: SAR ${state.settings.openingBalance}`, 20, 65);
    doc.text(`Total Sales Revenue: SAR ${totalRevenue}`, 80, 65);
    doc.text(`Current Balance: SAR ${currentBalance}`, 140, 65);

    // Inventory Table
    doc.setFontSize(14);
    doc.text('Current Inventory Status', 14, 90);

    const inventoryData = state.products.map(p => [
      p.itemCode,
      p.name,
      p.category,
      `SAR ${p.costPrice}`,
      `SAR ${p.sellingPrice}`,
      p.stockQuantity.toString(),
      p.soldQuantity.toString()
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Code', 'Product', 'Category', 'Cost', 'Price', 'Stock', 'Sold']],
      body: inventoryData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Sales History
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text('Recent Sales Transaction History', 14, finalY + 15);

    const salesData = state.sales.map(s => [
      new Date(s.timestamp).toLocaleDateString(),
      s.type,
      s.comboName || '-',
      s.items.length.toString(),
      `SAR ${s.totalAmount}`
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Date', 'Type', 'Combo Name', 'Items Count', 'Total']],
      body: salesData,
      theme: 'striped'
    });

    doc.save('SalesTrack_Report.pdf');
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Products
    const wsProducts = XLSX.utils.json_to_sheet(state.products.map(p => ({
      Code: p.itemCode,
      Name: p.name,
      Category: p.category,
      Cost: p.costPrice,
      Price: p.sellingPrice,
      Stock: p.stockQuantity,
      Sold: p.soldQuantity
    })));
    XLSX.utils.book_append_sheet(wb, wsProducts, "Inventory");

    // Sheet 2: Sales
    const wsSales = XLSX.utils.json_to_sheet(state.sales.map(s => ({
      Date: new Date(s.timestamp).toLocaleString(),
      Type: s.type,
      ComboName: s.comboName || 'N/A',
      TotalAmount: s.totalAmount,
      SoldBy: s.soldBy
    })));
    XLSX.utils.book_append_sheet(wb, wsSales, "Sales History");

    XLSX.writeFile(wb, "SalesTrack_Data.xlsx");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Reports & Export</h2>
      <p className="text-slate-500">Download detailed analysis of your inventory and sales performance.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">PDF Report</h3>
          <p className="text-slate-500 mb-6 text-sm">Professional document format suitable for printing and sharing. Includes summary tables and financial snapshots.</p>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <FileDown size={18} /> Download PDF
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Table size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Excel Spreadsheet</h3>
          <p className="text-slate-500 mb-6 text-sm">Raw data format (.xlsx) for external analysis. Contains separate sheets for Inventory and Transaction logs.</p>
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileDown size={18} /> Download Excel
          </button>
        </div>
      </div>

      {/* Data Sync Status Indicator */}
      <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-blue-800">Cloud Sync Status</h4>
          <p className="text-sm text-blue-600">All data is synced to registered email: <strong>{state.settings.userEmail}</strong></p>
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