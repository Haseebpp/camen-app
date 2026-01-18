import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Package, Edit2 } from 'lucide-react';
import type { RootState, AppDispatch } from '@/state/store';
import type { Product } from '@/lib/types';
import { fetchProducts, createProduct, updateProduct } from '@/state/slices/productSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { LOGO_URL } from '@/lib/constants';

const Inventory: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { products, isLoading, error } = useSelector((state: RootState) => state.products);
    const { events, selectedEventId } = useSelector((state: RootState) => state.events);
    const selectedEvent = events.find(e => e._id === selectedEventId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        itemCode: '',
        name: '',
        category: '',
        sellingPrice: 0,
        stockQuantity: 0,
        description: '',
    });

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        // ... existing submit logic ...
        e.preventDefault();
        if (editingId) {
            await dispatch(updateProduct({ id: editingId, updates: formData }));
        } else {
            await dispatch(
                createProduct({
                    itemCode: formData.itemCode || '',
                    name: formData.name || '',
                    category: formData.category || 'General',
                    costPrice: 0, // Hidden from UI, using default value
                    sellingPrice: Number(formData.sellingPrice),
                    stockQuantity: Number(formData.stockQuantity),
                    initialStock: Number(formData.stockQuantity),
                    description: formData.description || '',
                })
            );
        }
        closeModal();
    };

    const openEdit = (product: Product) => {
        setFormData(product);
        setEditingId(product._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            itemCode: '',
            name: '',
            category: '',
            sellingPrice: 0,
            stockQuantity: 0,
            description: '',
        });
    };

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

                <Button onClick={() => setIsModalOpen(true)} className="z-10">
                    <Plus size={18} /> Add Product
                </Button>
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
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    No products found. Add some inventory!
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
                                    <TableCell>
                                        <button
                                            onClick={() => openEdit(product)}
                                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? 'Edit Product' : 'Add New Product'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Item Code"
                            placeholder="e.g. SW-01"
                            value={formData.itemCode}
                            onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                            required
                        />
                        <Input
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                        <Input
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price (SAR)"
                            type="number"
                            min="0"
                            value={formData.sellingPrice}
                            onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                            required
                        />
                        <Input
                            label="Stock"
                            type="number"
                            min="0"
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Product</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventory;
