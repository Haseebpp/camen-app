import React from 'react';
import { Link } from 'react-router';
import { BarChart3, Package, ShoppingCart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOGO_URL } from '@/lib/constants';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            {/* Header */}
            <header className="container mx-auto px-4 py-6 flex justify-between items-center">
                <img src={LOGO_URL} alt="SalesTrack" className="h-12 w-auto" />
                <div className="flex gap-4">
                    <Link to="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
                        Track Sales.{' '}
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Grow Business.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                        A powerful multi-user sales tracking application that helps you manage inventory,
                        record sales, track expenses, and generate insightful reports.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register">
                            <Button size="lg" variant="gradient" className="gap-2">
                                Start Free <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline">
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                            <Package size={24} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Inventory Management</h3>
                        <p className="text-slate-500 text-sm">
                            Track stock levels, costs, and selling prices in real-time.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                            <ShoppingCart size={24} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Point of Sale</h3>
                        <p className="text-slate-500 text-sm">
                            Quick checkout with individual and combo sale options.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Reports & Analytics</h3>
                        <p className="text-slate-500 text-sm">
                            Export detailed reports to PDF and Excel formats.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                            <Users size={24} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Multi-User Sync</h3>
                        <p className="text-slate-500 text-sm">
                            Multiple users can work simultaneously with real-time sync.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} SalesTrack. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
