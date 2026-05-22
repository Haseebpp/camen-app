import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Package } from 'lucide-react';
import type { RootState, AppDispatch } from '@/state/store';
import { fetchProducts } from '@/state/slices/productSlice';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { LOGO_URL } from '@/lib/constants';

const Inventory: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { products, isLoading, error } = useSelector((state: RootState) => state.products);
    const { events, selectedEventId } = useSelector((state: RootState) => state.events);
    const selectedEvent = events.find(e => e._id === selectedEventId);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="relative flex flex-col sm:flex-row justify-between items-center gap-4 min-h-[60px]">
                <h2 className="text-3xl font-bold text-slate-800">
                    {selectedEvent ? `Inventory - ${selectedEvent.name}` : 'Inventory'}
                </h2>

                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img src={LOGO_URL} alt="CAMEN" className="h-16 w-auto object-contain" />
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search products by code, name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price (SAR)</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            <TableHead className="text-center">Sold</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton columns={6} rows={5} />
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell className="text-slate-600 font-mono text-sm">{product.itemCode}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{product.name}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                                    {product.description}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{product.category}</TableCell>
                                    <TableCell className="text-right font-medium text-slate-900">
                                        SAR {product.sellingPrice}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${product.stockQuantity < 5
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {product.stockQuantity}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">{product.soldQuantity}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Inventory;
