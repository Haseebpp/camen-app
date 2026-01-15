import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Package, TrendingUp, Sparkles, AlertCircle, TrendingDown } from 'lucide-react';
import { analyzeSalesData } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { state, getFinancials } = useData();
  const { totalRevenue, currentBalance, totalExpenses } = getFinancials();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const salesData = state.sales
    .slice(0, 7)
    .reverse()
    .map(s => ({
      name: new Date(s.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
      amount: s.totalAmount
    }));

  const stockData = state.products
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      stock: p.stockQuantity
    }));

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeSalesData(state);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <button
          onClick={handleAiAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <span className="animate-pulse">Thinking...</span>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Ask AI Analyst</span>
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-purple-800 mb-2">
                <Sparkles size={20} /> AI Insights
            </h3>
            <div className="prose prose-purple max-w-none text-sm text-slate-700 whitespace-pre-line">
                {aiAnalysis}
            </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-500 font-medium">Opening Balance</h3>
            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">SAR {state.settings.openingBalance.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-500 font-medium">Total Expenses</h3>
            <div className="p-2 bg-red-50 rounded-full text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">-SAR {totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Cost of Goods Sold</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-500 font-medium">Total Revenue</h3>
            <div className="p-2 bg-green-50 rounded-full text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">+SAR {totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-500 font-medium">Current Balance</h3>
            <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-600">SAR {currentBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-lg mb-6">Recent Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`SAR ${value}`, 'Amount']}
                />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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
              <BarChart data={stockData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={12} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
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