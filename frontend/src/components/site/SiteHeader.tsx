import React from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import type { RootState, AppDispatch } from '@/state/store';
import { logout } from '@/state/slices/authSlice';
import { Button } from '@/components/ui/button';
import { LOGO_URL } from '@/lib/constants';

interface SiteHeaderProps {
    isMobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-slate-100 p-4 md:hidden flex justify-between items-center z-20">
            <div className="flex items-center gap-2">
                <img src={LOGO_URL} alt="SalesTrack" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-2">
                {user && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mr-2">
                        <User size={16} />
                        <span className="hidden sm:inline">{user.name}</span>
                    </div>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut size={18} />
                </Button>
                <button onClick={onToggleMobileMenu} className="text-slate-600 p-2">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </header>
    );
};

export default SiteHeader;
