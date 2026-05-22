import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Search, Receipt, Trash2, Calendar, Tag } from 'lucide-react';
import { Expense } from '../types';

const Expenses: React.FC = () => {
  const { state, addExpense, deleteExpense } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Expense> & { eventId?: string }>({
    description: '',
    category: '',
    amount: 0,
    date: Date.now(),
    eventId: ''
  });

  const openEvents = state.events.filter(e => e.status === 'OPEN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      description: formData.description!,
      category: formData.category || 'General',
      amount: Number(formData.amount),
      date: new Date(formData.date!).getTime(),
    }, formData.eventId || undefined);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ description: '', category: '', amount: 0, date: Date.now(), eventId: '' });
  };

  const filteredExpenses = state.expenses.filter(e =>
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Expenses</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-xl hover:shadow"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search expenses by description or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Description</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Event</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => {
                const eventName = expense.eventId ? state.events.find(e => e.id === expense.eventId)?.name : null;
                return (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                          <Receipt size={16} />
                        </div>
                        <span className="font-medium text-slate-900">{expense.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-slate-400" />
                        <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                          {expense.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {eventName ? (
                        <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs border border-yellow-100">
                          {eventName}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">
                      -SAR {expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                        title="Delete Expense"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Receipt size={32} className="text-slate-300" />
                      </div>
                      <p>No expenses found.</p>
                      <p className="text-sm text-slate-400 mt-1">Add expenses to track your spending.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <Receipt size={24} />
              </div>
              Add New Expense
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Office Rent, Electricity Bill"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Utilities"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                    onChange={e => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
                  />
                </div>
              </div>

              {openEvents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link to Event (Optional)</label>
                  <select
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.eventId}
                    onChange={e => setFormData({ ...formData, eventId: e.target.value })}
                  >
                    <option value="">-- No Specific Event --</option>
                    {openEvents.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (SAR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">SAR</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;