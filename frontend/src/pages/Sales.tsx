import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    ShoppingCart,
    Trash2,
    Check,
    LayoutGrid,
    Sparkles,
    History,
} from 'lucide-react';
import type { RootState, AppDispatch } from '@/state/store';
import type { Product, CartItem, SaleType } from '@/lib/types';
import { fetchProducts } from '@/state/slices/productSlice';
import { fetchEvents } from '@/state/slices/eventSlice';
import { createSale, fetchSales } from '@/state/slices/saleSlice';
import { Button } from '@/components/ui/button';
import { PRESET_COMBOS } from '@/lib/constants';

const Sales: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { products, error: productError } = useSelector((state: RootState) => state.products);
    const { events, error: eventError, selectedEventId } = useSelector((state: RootState) => state.events);
    const { sales, isLoading: saleLoading, error: saleError } = useSelector((state: RootState) => state.sales);

    const error = productError || eventError || saleError;

    const [cart, setCart] = useState<CartItem[]>([]);
    const [saleType, setSaleType] = useState<SaleType>('INDIVIDUAL');
    const [comboName, setComboName] = useState('');
    const [activeTab, setActiveTab] = useState<'products' | 'checkout' | 'history'>('products');

    const openEvents = events.filter((e) => e.status === 'OPEN');

    useEffect(() => {
        dispatch(fetchProducts());
        // fetchEvents is now called in App.tsx, but keeping it here doesn't hurt, or we can remove it. 
        // Best to leave it to ensure data is fresh if this page is loaded directly/refreshed.
        dispatch(fetchEvents());
        dispatch(fetchSales());
    }, [dispatch]);

    const addToCart = (product: Product) => {
        if (product.stockQuantity <= 0) return;

        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product._id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product._id
                        ? { ...item, quantity: Math.min(item.quantity + 1, product.stockQuantity) }
                        : item
                );
            }
            return [
                ...prev,
                {
                    productId: product._id,
                    productName: product.name,
                    quantity: 1,
                    unitPrice: product.sellingPrice,
                },
            ];
        });
    };

    const applyPresetCombo = (combo: (typeof PRESET_COMBOS)[0]) => {
        const newCart: CartItem[] = [];
        const missingProducts: string[] = [];

        const count = combo.items.length;
        const basePrice = Math.floor((combo.price / count) * 100) / 100;
        const remainder = Number((combo.price - basePrice * count).toFixed(2));

        combo.items.forEach((comboItem, index) => {
            const product = products.find((p) => p.name === comboItem.name);
            if (!product) {
                missingProducts.push(comboItem.name);
                return;
            }

            if (product.stockQuantity < comboItem.qty) {
                alert(`Insufficient stock for ${product.name}. Required: ${comboItem.qty}, Available: ${product.stockQuantity}`);
                missingProducts.push(product.name);
                return;
            }

            const itemPrice = index === 0 ? Number((basePrice + remainder).toFixed(2)) : basePrice;

            newCart.push({
                productId: product._id,
                productName: product.name,
                quantity: comboItem.qty,
                unitPrice: itemPrice,
            });
        });

        if (missingProducts.length > 0 && newCart.length < combo.items.length) {
            return;
        }

        setCart(newCart);
        setComboName(combo.name);
        setSaleType('COMBO');
        alert(`${combo.name} applied!`);
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.productId !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.productId === id) {
                    const product = products.find((p) => p._id === id);
                    const maxStock = product ? product.stockQuantity : 0;
                    const newQty = Math.max(1, Math.min(item.quantity + delta, maxStock));
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            await dispatch(
                createSale({
                    items: cart,
                    type: saleType,
                    comboName: saleType === 'COMBO' ? comboName : undefined,
                    eventId: selectedEventId || undefined,
                })
            ).unwrap();

            // Refresh products to update stock
            dispatch(fetchProducts());

            setCart([]);
            setComboName('');
            setSaleType('INDIVIDUAL');
            setActiveTab('products');
            alert('Sale recorded successfully!');
        } catch (error) {
            alert(`Sale failed: ${error}`);
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 text-left">
            {error && (
                <div className="fixed top-20 right-6 z-50 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-md">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}
            {/* Product Selection Area */}
            <div className={`flex-1 flex flex-col ${activeTab !== 'products' ? 'hidden md:flex' : 'flex'} ${activeTab === 'history' ? 'md:hidden' : ''}`}>
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Add Products</h2>
                    <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setSaleType('INDIVIDUAL')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${saleType === 'INDIVIDUAL' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'
                                }`}
                        >
                            Individual
                        </button>
                        <button
                            onClick={() => setSaleType('COMBO')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${saleType === 'COMBO' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'
                                }`}
                        >
                            Combo Offer
                        </button>
                    </div>
                </div>

                {/* Event selection moved to Sidebar */}

                {saleType === 'COMBO' && (
                    <div className="mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PRESET_COMBOS.map((combo, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => applyPresetCombo(combo)}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow hover:shadow-lg transition-all hover:scale-[1.01] text-left"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 font-bold mb-2">
                                            <Sparkles size={18} className="text-yellow-300" />
                                            {combo.name}
                                        </div>
                                        <div className="text-xs text-indigo-100 space-y-1">
                                            {combo.items.map((i, k) => (
                                                <div key={k}>{i.name}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold bg-white/20 px-3 py-1 rounded-lg ml-2">
                                        SAR {combo.price}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-slate-50 px-2 text-slate-500">Or Create Custom Combo</span>
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="Enter Custom Combo Name (e.g., Summer Bundle)"
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            value={comboName}
                            onChange={(e) => setComboName(e.target.value)}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            onClick={() => addToCart(product)}
                            className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${product.stockQuantity === 0
                                ? 'opacity-50 border-red-200 pointer-events-none'
                                : 'border-slate-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                                    <LayoutGrid size={18} />
                                </div>
                                <span className="font-bold text-slate-700">SAR {product.sellingPrice}</span>
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-1">{product.name}</h3>
                            <p className="text-xs text-slate-500 mb-3">{product.stockQuantity} in stock</p>
                            <button
                                disabled={product.stockQuantity === 0}
                                className="w-full py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100"
                            >
                                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart / Checkout Area */}
            <div
                className={`w-full md:w-96 bg-white rounded-2xl shadow-xl flex flex-col border border-slate-200 
                    ${activeTab === 'checkout' ? 'flex' : 'hidden md:flex'}
                    ${activeTab === 'history' ? 'hidden' : ''} 
                `}
            >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="text-indigo-600" /> Current Sale
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {saleType === 'COMBO' ? 'Combo Offer Sale' : 'Standard Sale'}
                    </p>
                    <div className={`mt-2 text-xs px-2 py-1 rounded inline-block font-medium ${selectedEventId ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'}`}>
                        Event: {selectedEventId ? openEvents.find((e) => e._id === selectedEventId)?.name : 'General'}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <ShoppingCart size={48} className="mb-4 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800">{item.productName}</p>
                                    <p className="text-xs text-slate-500">
                                        SAR {item.unitPrice} x {item.quantity}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-slate-100">
                                            -
                                        </button>
                                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-slate-100">
                                            +
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-500">Total Amount</span>
                        <span className="text-3xl font-bold text-slate-800">SAR {Math.round(totalAmount).toFixed(2)}</span>
                    </div>
                    <Button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || (saleType === 'COMBO' && !comboName) || saleLoading}
                        variant="gradient"
                        className="w-full py-4 text-lg"
                    >
                        <Check size={20} /> Complete Sale
                    </Button>
                </div>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`p-4 rounded-full shadow-lg ${activeTab === 'history' ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-600'
                        }`}
                >
                    <History size={24} />
                </button>
                <button
                    onClick={() => setActiveTab(activeTab === 'products' ? 'checkout' : 'products')}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-lg relative"
                >
                    <ShoppingCart />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full text-xs flex items-center justify-center border-2 border-indigo-600">
                            {cart.reduce((acc, i) => acc + i.quantity, 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* History Tab Content (Desktop Sidebar or Full View) */}
            <div
                className={`w-full md:w-80 lg:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 flex-col 
                    ${activeTab === 'history' ? 'flex' : 'hidden md:flex'}
                    ${activeTab === 'checkout' && window.innerWidth < 768 ? 'hidden' : ''}
                `}
            >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <History className="text-indigo-600" /> History
                        </h2>
                        <div className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {sales.length} Sales
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {sales.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <History size={48} className="mb-4 opacity-20" />
                            <p>No sales history found</p>
                        </div>
                    ) : (
                        sales.map((sale) => (
                            <div key={sale._id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            SAR {sale.totalAmount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(sale.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded font-medium ${sale.type === 'COMBO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {sale.type}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {sale.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-slate-600">
                                            <span>{item.quantity}x {item.productName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sales;
