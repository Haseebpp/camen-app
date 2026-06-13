import React, { useState, useEffect, useMemo } from 'react';
import { Menu, X, LogOut, User, Edit2, Check, Wallet } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState, AppDispatch } from '@/state/store';
import { logout } from '@/state/slices/authSlice';
import { updateEventClearedSales } from '@/state/slices/eventSlice';
import { updateSettings } from '@/state/slices/settingsSlice';
import { Button } from '@/components/ui/button';
import { LOGO_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
    isMobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { sales } = useSelector((state: RootState) => state.sales);
    const { events, selectedEventId } = useSelector((state: RootState) => state.events);
    const { settings } = useSelector((state: RootState) => state.settings);

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('0');
    const [showMobileStats, setShowMobileStats] = useState(false);

    const activeEvent = useMemo(() => {
        return selectedEventId ? events.find(e => e._id === selectedEventId) : null;
    }, [events, selectedEventId]);

    // Filter sales belonging to the current context
    const contextSales = useMemo(() => {
        return sales.filter(sale => {
            const saleEventId = sale.event
                ? (typeof sale.event === 'object' ? (sale.event as any)._id : sale.event)
                : null;
            if (selectedEventId) {
                return saleEventId === selectedEventId;
            } else {
                return !saleEventId;
            }
        });
    }, [sales, selectedEventId]);

    // Calculate total sales
    const totalSales = useMemo(() => {
        return contextSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    }, [contextSales]);

    // Calculate cleared sales
    const clearedSales = selectedEventId
        ? (activeEvent?.clearedSalesAmount || 0)
        : (settings?.clearedSalesAmount || 0);

    // Calculate sales in hand
    const salesInHand = totalSales - clearedSales;

    // Keep editValue in sync with clearedSales when not editing
    useEffect(() => {
        if (!isEditing) {
            setEditValue(clearedSales.toString());
        }
    }, [clearedSales, isEditing]);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    const handleSaveClearedSales = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(editValue);
        if (isNaN(amt) || amt < 0) {
            alert('Please enter a valid non-negative number');
            return;
        }

        try {
            if (selectedEventId) {
                await dispatch(updateEventClearedSales({ id: selectedEventId, clearedSalesAmount: amt })).unwrap();
            } else {
                await dispatch(updateSettings({ clearedSalesAmount: amt })).unwrap();
            }
            setIsEditing(false);
        } catch (error) {
            alert(`Failed to save cleared sales: ${error}`);
        }
    };

    return (
        <header className="bg-white border-b border-slate-100 p-4 flex justify-between items-center z-20 shadow-sm">
            {/* Left side: Logo on mobile, stats on desktop */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 md:hidden">
                    <img src={LOGO_URL} alt="SalesTrack" className="h-8 w-auto object-contain" />
                </div>

                {/* Desktop Sales Stats Widget */}
                {user && (
                    <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Total Sales</span>
                            <span className="text-slate-800 font-bold text-sm">
                                SAR {totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />

                        <div className="flex flex-col min-w-[130px]">
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Cleared Amount</span>
                            {isEditing ? (
                                <form onSubmit={handleSaveClearedSales} className="flex items-center gap-1 mt-0.5">
                                    <input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-20 px-2 py-0.5 border border-indigo-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                        autoFocus
                                        min="0"
                                        step="any"
                                    />
                                    <button type="submit" className="p-0.5 text-green-600 hover:text-green-800 transition-colors">
                                        <Check size={14} />
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="p-0.5 text-red-500 hover:text-red-700 transition-colors">
                                        <X size={14} />
                                    </button>
                                </form>
                            ) : (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-slate-700 font-bold text-sm">
                                        SAR {clearedSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setEditValue(clearedSales.toString());
                                            setIsEditing(true);
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                        title="Edit Cleared Sales"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="h-6 w-px bg-slate-200" />

                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">In Hand</span>
                            <span className={cn(
                                "font-bold text-sm transition-colors duration-200",
                                salesInHand >= 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                                SAR {salesInHand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right side: Mobile stats trigger, profile, logout, mobile menu toggle */}
            <div className="flex items-center gap-3">
                {/* Mobile Sales Stats Trigger */}
                {user && (
                    <div className="md:hidden relative">
                        <button
                            onClick={() => setShowMobileStats(!showMobileStats)}
                            className={cn(
                                "p-2 rounded-xl border flex items-center gap-1 transition-all text-xs font-bold",
                                showMobileStats
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-350"
                            )}
                        >
                            <Wallet size={16} className={showMobileStats ? "text-indigo-600" : "text-slate-500"} />
                            <span>SAR {salesInHand.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </button>

                        {showMobileStats && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowMobileStats(false)} />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-40 space-y-3 text-left">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <span className="font-bold text-slate-800 text-sm truncate max-w-[180px]">
                                            {selectedEventId ? activeEvent?.name : 'General Sales'}
                                        </span>
                                        <button onClick={() => setShowMobileStats(false)} className="text-slate-400 hover:text-slate-600">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Total Sales:</span>
                                            <span className="text-slate-800 font-bold">
                                                SAR {totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Cleared Amount:</span>
                                            {isEditing ? (
                                                <form onSubmit={handleSaveClearedSales} className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="w-20 px-1.5 py-0.5 border border-indigo-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                                                        autoFocus
                                                        min="0"
                                                        step="any"
                                                    />
                                                    <button type="submit" className="p-0.5 text-green-600 hover:text-green-800">
                                                        <Check size={14} />
                                                    </button>
                                                    <button type="button" onClick={() => setIsEditing(false)} className="p-0.5 text-red-500 hover:text-red-700">
                                                        <X size={14} />
                                                    </button>
                                                </form>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-800 font-bold">
                                                        SAR {clearedSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setEditValue(clearedSales.toString());
                                                            setIsEditing(true);
                                                        }}
                                                        className="p-0.5 text-slate-400 hover:text-indigo-600 rounded"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-slate-100 my-1" />

                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">Sales in Hand:</span>
                                            <span className={cn(
                                                "font-bold text-sm",
                                                salesInHand >= 0 ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                SAR {salesInHand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {user && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mr-1">
                        <User size={16} className="text-slate-400" />
                        <span className="hidden sm:inline font-medium">{user.name}</span>
                    </div>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <LogOut size={18} />
                </Button>
                <button onClick={onToggleMobileMenu} className="text-slate-600 p-2 md:hidden hover:bg-slate-50 rounded-xl transition-all">
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </header>
    );
};

export default SiteHeader;
