import React from 'react';
import { Link, useLocation } from 'react-router';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    Settings as SettingsIcon,
    Receipt,
    CalendarDays,
} from 'lucide-react';
import { LOGO_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            )}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    );
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 transform transition-transform duration-200 ease-in-out md:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="h-full flex flex-col p-6">
                    {/* Logo */}
                    <div className="flex justify-center mb-10">
                        <img
                            src={LOGO_URL}
                            alt="CAMEN"
                            className="h-16 w-auto object-contain"
                        />
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2 flex-1">
                        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                        <SidebarLink to="/events" icon={<CalendarDays size={20} />} label="Events" />
                        <SidebarLink to="/sales" icon={<ShoppingCart size={20} />} label="Point of Sale" />
                        <SidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" />
                        <SidebarLink to="/expenses" icon={<Receipt size={20} />} label="Expenses" />
                        <SidebarLink to="/reports" icon={<BarChart3 size={20} />} label="Reports" />
                        <SidebarLink to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
                    </nav>

                    {/* Sync Status */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                            <p className="text-xs font-semibold text-indigo-800 uppercase mb-1">
                                Multi-Device Sync
                            </p>
                            <p className="text-xs text-slate-500">Active • Real-time sync enabled</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
