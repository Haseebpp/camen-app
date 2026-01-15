import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings as SettingsIcon, Menu, X, Receipt, CalendarDays } from 'lucide-react';
import { DataProvider } from './contexts/DataContext';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Expenses from './components/Expenses';
import Events from './components/Events';

// Placeholder for the uploaded logo. Replace with local asset path (e.g., '/assets/camen-logo.png')
const LOGO_URL = "https://placehold.co/400x150/transparent/D4AF37?text=CAMEN&font=playfair-display";

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/');
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          {/* Main Logo Area */}
          <div className="flex justify-center mb-10">
            <img 
              src={LOGO_URL} 
              alt="CAMEN" 
              className="h-16 w-auto object-contain" 
            />
          </div>
          
          <nav className="space-y-2 flex-1">
            <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarLink to="/events" icon={<CalendarDays size={20} />} label="Events" />
            <SidebarLink to="/sales" icon={<ShoppingCart size={20} />} label="Point of Sale" />
            <SidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" />
            <SidebarLink to="/expenses" icon={<Receipt size={20} />} label="Expenses" />
            <SidebarLink to="/reports" icon={<BarChart3 size={20} />} label="Reports" />
            <SidebarLink to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
          </nav>

          <div className="pt-6 border-t border-slate-100">
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                <p className="text-xs font-semibold text-indigo-800 uppercase mb-1">Multi-Device Sync</p>
                <p className="text-xs text-slate-500">Active • Last synced just now</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-100 p-4 md:hidden flex justify-between items-center z-20">
           <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="SalesTrack" className="h-8 w-auto object-contain" />
           </div>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
             {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
           {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
};

export default App;