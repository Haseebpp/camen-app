import React from 'react';

const SiteFooter: React.FC = () => {
    return (
        <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} SalesTrack. All rights reserved.</p>
        </footer>
    );
};

export default SiteFooter;
