import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Product, CartItem, SaleType } from '../types';
import { ShoppingCart, Plus, Trash2, Check, LayoutGrid, Calendar, PackageCheck, Sparkles } from 'lucide-react';

const PRESET_COMBOS = [
  {
    name: "CMN BLND 1 OFFER",
    price: 100.00,
    items: [
      { name: "Oud Risala", qty: 1 },
      { name: "Green Oud", qty: 1 },
      { name: "Eau Blue", qty: 1 }
    ]
  },
  {
    name: "CMN BLND 2 OFFER",
    price: 150.00,
    items: [
      { name: "Wild Flame", qty: 1 },
      { name: "Shadow Walk", qty: 1 },
      { name: "Eau Blue", qty: 1 }
    ]
  }
];

const Sales: React.FC = () => {
  const { state, recordSale } = useData();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleType, setSaleType] = useState<SaleType>(SaleType.INDIVIDUAL);
  const [comboName, setComboName] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'products' | 'checkout'>('products');

  const openEvents = state.events.filter(e => e.status === 'OPEN');

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stockQuantity) } 
            : item
        );
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.sellingPrice }];
    });
  };

  const applyPresetCombo = (combo: typeof PRESET_COMBOS[0]) => {
    const newCart: CartItem[] = [];
    let missingProducts: string[] = [];

    // Distribute price among items. 
    // We'll give the first item the remainder to ensure exact total match.
    // e.g. 100 / 3 = 33.33, 33.33, 33.34
    const count = combo.items.length;
    const basePrice = Math.floor((combo.price / count) * 100) / 100;
    const remainder = Number((combo.price - (basePrice * count)).toFixed(2));

    combo.items.forEach((comboItem, index) => {
      const product = state.products.find(p => p.name === comboItem.name);
      if (!product) {
        missingProducts.push(comboItem.name);
        return;
      }
      
      if (product.stockQuantity < comboItem.qty) {
        alert(`Insufficient stock for ${product.name}. Required: ${comboItem.qty}, Available: ${product.stockQuantity}`);
        missingProducts.push(product.name); // Mark as failed to prevent partial add
        return;
      }

      const itemPrice = index === 0 ? Number((basePrice + remainder).toFixed(2)) : basePrice;

      newCart.push({
        productId: product.id,
        productName: product.name,
        quantity: comboItem.qty,
        unitPrice: itemPrice
      });
    });

    if (missingProducts.length > 0) {
      if (newCart.length < combo.items.length) {
         // If any product was missing or low stock, don't apply the combo partially
         return;
      }
    }

    setCart(newCart);
    setComboName(combo.name);
    setSaleType(SaleType.COMBO);
    alert(`${combo.name} applied!`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.productId !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const product = state.products.find(p => p.id === id);
        const maxStock = product ? product.stockQuantity : 0;
        const newQty = Math.max(1, Math.min(item.quantity + delta, maxStock));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    recordSale(
      cart, 
      saleType, 
      saleType === SaleType.COMBO ? comboName : undefined,
      selectedEventId || undefined
    );
    setCart([]);
    setComboName('');
    setSaleType(SaleType.INDIVIDUAL);
    setActiveTab('products');
    alert("Sale recorded successfully!");
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Product Selection Area */}
      <div className={`flex-1 flex flex-col ${activeTab === 'checkout' ? 'hidden md:flex' : 'flex'}`}>
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Select Products</h2>
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">
            <button
               onClick={() => setSaleType(SaleType.INDIVIDUAL)}
               className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${saleType === SaleType.INDIVIDUAL ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}
            >
              Individual
            </button>
            <button
               onClick={() => setSaleType(SaleType.COMBO)}
               className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${saleType === SaleType.COMBO ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}
            >
              Combo Offer
            </button>
          </div>
        </div>

        {/* Event Selection */}
        {openEvents.length > 0 && (
          <div className="mb-4 flex items-center gap-2 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
             <Calendar size={18} className="text-yellow-600" />
             <select 
               value={selectedEventId}
               onChange={(e) => setSelectedEventId(e.target.value)}
               className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none w-full cursor-pointer"
             >
               <option value="">-- No Specific Event (General Sale) --</option>
               {openEvents.map(e => (
                 <option key={e.id} value={e.id}>{e.name} ({new Date(e.date).toLocaleDateString()})</option>
               ))}
             </select>
          </div>
        )}

        {saleType === SaleType.COMBO && (
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
              onChange={e => setComboName(e.target.value)}
             />
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
          {state.products.map(product => (
            <div 
              key={product.id}
              onClick={() => addToCart(product)}
              className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${product.stockQuantity === 0 ? 'opacity-50 border-red-200 pointer-events-none' : 'border-slate-200 hover:border-indigo-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                  <LayoutGrid size={18} />
                </div>
                <span className="font-bold text-slate-700">SAR {product.sellingPrice}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{product.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{product.stockQuantity} in stock</p>
              <button disabled={product.stockQuantity === 0} className="w-full py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100">
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart / Checkout Area */}
      <div className={`w-full md:w-96 bg-white rounded-2xl shadow-xl flex flex-col border border-slate-200 ${activeTab === 'products' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" /> Current Sale
          </h2>
          <p className="text-sm text-slate-500 mt-1">
             {saleType === SaleType.COMBO ? 'Combo Offer Sale' : 'Standard Sale'}
          </p>
          {selectedEventId && (
            <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block font-medium">
               Tag: {openEvents.find(e => e.id === selectedEventId)?.name}
            </div>
          )}
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
                  <p className="text-xs text-slate-500">SAR {item.unitPrice} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-slate-100">-</button>
                    <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-slate-100">+</button>
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
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || (saleType === SaleType.COMBO && !comboName)}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <Check size={20} /> Complete Sale
          </button>
        </div>
      </div>
      
      {/* Mobile Toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
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
    </div>
  );
};

export default Sales;