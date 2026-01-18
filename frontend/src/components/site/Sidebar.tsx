import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    Settings as SettingsIcon,
    Receipt,
    CalendarDays,
    Shield,
    LogOut,
} from 'lucide-react';
import type { RootState, AppDispatch } from '@/state/store';
import { logout } from '@/state/slices/authSlice';
import { setSelectedEvent } from '@/state/slices/eventSlice';
import { LOGO_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

interface SidebarLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    variant?: 'default' | 'admin';
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, variant = 'default' }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    const activeClass = variant === 'admin'
        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-200'
        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200';

    const hoverClass = variant === 'admin'
        ? 'text-slate-500 hover:bg-red-50 hover:text-red-600'
        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600';

    return (
        <Link
            to={to}
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive ? activeClass : hoverClass
            )}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    );
};

interface EventSelectorProps {
    events: any[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({ events, selectedId, onSelect }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectedEvent = events.find(e => e._id === selectedId);

    // CSS for marquee animation
    const marqueeStyle = {
        display: 'inline-block',
        whiteSpace: 'nowrap' as const,
        animation: 'marquee 15s linear infinite',
        paddingLeft: '100%', // Start from right
    };

    const keyframes = `
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
        }
    `;

    // Determine styles based on event status
    const isEventOpen = selectedEvent?.status === 'OPEN';

    // Base classes
    const containerClasses = cn(
        "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group overflow-hidden relative",
        !selectedEvent
            ? "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300" // Default / General Sales
            : isEventOpen
                ? "bg-green-50 border-green-200 text-green-700 hover:border-green-300" // Open Event
                : "bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300" // Closed Event
    );

    const labelClasses = cn(
        "text-xs uppercase tracking-wider mb-0.5",
        !selectedEvent
            ? "text-slate-500"
            : isEventOpen
                ? "text-green-600"
                : "text-blue-500"
    );

    const iconClasses = cn(
        "flex-shrink-0",
        !selectedEvent
            ? "text-slate-400"
            : isEventOpen
                ? "text-green-500"
                : "text-blue-400"
    );

    return (
        <div className="relative mb-6 px-2">
            <style>{keyframes}</style>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={containerClasses}
            >
                <div className="flex flex-col w-full overflow-hidden">
                    <span className={labelClasses}>
                        {selectedEvent ? (isEventOpen ? "Active Event" : "Past Event") : "System Default"}
                    </span>

                    <div className="relative w-full overflow-hidden h-6 flex items-center">
                        {selectedEvent ? (
                            <div className="w-full overflow-hidden whitespace-nowrap mask-image-linear-gradient">
                                <span style={marqueeStyle}>
                                    {selectedEvent.name}
                                </span>
                            </div>
                        ) : (
                            <span className="font-medium whitespace-nowrap text-slate-700">
                                General Sales
                            </span>
                        )}
                    </div>
                </div>
                <ChevronsUpDown size={16} className={iconClasses} />

                {/* Animated Pulse for Active Event */}
                {selectedEvent && isEventOpen && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 z-20 overflow-hidden py-1 max-h-60 overflow-y-auto">
                        <div className="p-2">
                            <div className="text-xs font-semibold text-slate-400 px-2 py-1 mb-1">Select Context</div>

                            {/* General Sales Option */}
                            <button
                                onClick={() => {
                                    onSelect(''); // Empty string for General Sales
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors mb-1",
                                    !selectedId
                                        ? "bg-slate-100 text-slate-700 font-medium"
                                        : "hover:bg-slate-50 text-slate-600"
                                )}
                            >
                                <span>General Sales</span>
                                {!selectedId && <Check size={14} className="text-slate-600 flex-shrink-0" />}
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            {/* Events List */}
                            {events.length === 0 && (
                                <div className="text-sm text-slate-400 px-2 py-2 text-center">No events found</div>
                            )}

                            {events.map((event) => {
                                const isOpen = event.status === 'OPEN';
                                return (
                                    <button
                                        key={event._id}
                                        onClick={() => {
                                            onSelect(event._id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                            selectedId === event._id
                                                ? isOpen
                                                    ? "bg-green-50 text-green-700 font-medium"
                                                    : "bg-blue-50 text-blue-700 font-medium"
                                                : "hover:bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className={cn(
                                                "w-2 h-2 rounded-full flex-shrink-0",
                                                isOpen ? "bg-green-500" : "bg-blue-400"
                                            )} />
                                            <span className="truncate">{event.name}</span>
                                        </div>
                                        {selectedId === event._id && <Check size={14} className={isOpen ? "text-green-600" : "text-blue-600"} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { events, selectedEventId } = useSelector((state: RootState) => state.events);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    const handleEventSelect = (id: string) => {
        dispatch(setSelectedEvent(id));
    };

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
                    <div className="flex justify-center mb-6">
                        <img
                            src={LOGO_URL}
                            alt="CAMEN"
                            className="h-16 w-auto object-contain"
                        />
                    </div>

                    {/* Event Selector */}
                    <EventSelector
                        events={events}
                        selectedId={selectedEventId}
                        onSelect={handleEventSelect}
                    />

                    {/* Navigation */}
                    <nav className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                        <SidebarLink to="/sales" icon={<ShoppingCart size={20} />} label="Point of Sale" />
                        <SidebarLink to="/inventory" icon={<Package size={20} />} label="Inventory" />
                        <SidebarLink to="/expenses" icon={<Receipt size={20} />} label="Expenses" />
                        <SidebarLink to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />

                        {/* Admin Section - only visible to admins */}
                        {user?.isAdmin && (
                            <>
                                <div className="my-4 border-t border-slate-100" />
                                <SidebarLink
                                    to="/events"
                                    icon={<CalendarDays size={20} />}
                                    label="Events"
                                    variant="admin"
                                />
                                <SidebarLink
                                    to="/reports"
                                    icon={<BarChart3 size={20} />}
                                    label="Reports"
                                    variant="admin"
                                />
                                <SidebarLink
                                    to="/admin"
                                    icon={<Shield size={20} />}
                                    label="Admin Panel"
                                    variant="admin"
                                />
                            </>
                        )}
                    </nav>

                    {/* Logout Button */}
                    <div className="pt-4 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                    {/* Sync Status */}
                    <div className="pt-4 border-t border-slate-100">
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
