import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Receipt, Trash2, Calendar, Tag } from 'lucide-react';
import type { RootState, AppDispatch } from '@/state/store';
import { fetchExpenses, createExpense, deleteExpense } from '@/state/slices/expenseSlice';
import { fetchEvents } from '@/state/slices/eventSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

const Expenses: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { expenses, isLoading, error } = useSelector((state: RootState) => state.expenses);
    const { events, selectedEventId } = useSelector((state: RootState) => state.events);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        description: '',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
    });

    const selectedEvent = events.find(e => e._id === selectedEventId);

    useEffect(() => {
        dispatch(fetchExpenses());
        dispatch(fetchEvents());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(
            createExpense({
                description: formData.description,
                category: formData.category || 'General',
                amount: Number(formData.amount),
                date: new Date(formData.date).getTime(),
                eventId: selectedEventId || undefined,
            })
        );
        closeModal();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            await dispatch(deleteExpense(id));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            description: '',
            category: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
        });
    };

    const filteredExpenses = expenses.filter(
        (e) =>
            e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">Expenses</h2>
                <Button variant="destructive" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Add Expense
                </Button>
            </div>

            {/* Context Indicator */}
            {selectedEvent && (
                <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-yellow-100">
                    <Calendar size={16} />
                    <span>Adding expenses for: <strong>{selectedEvent.name}</strong></span>
                </div>
            )}

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

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton columns={6} rows={5} />
                        ) : filteredExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Receipt size={32} className="text-slate-300" />
                                        </div>
                                        <p className="text-slate-500">No expenses found.</p>
                                        <p className="text-sm text-slate-400 mt-1">Add expenses to track your spending.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExpenses.map((expense) => (
                                <TableRow key={expense._id}>
                                    <TableCell className="text-slate-600 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-slate-400" />
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                                <Receipt size={16} />
                                            </div>
                                            <span className="font-medium text-slate-900">{expense.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-slate-400" />
                                            <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                                                {expense.category}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {expense.event ? (
                                            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs border border-yellow-100">
                                                {expense.event.name}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-red-600">
                                        -SAR {expense.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <button
                                            onClick={() => handleDelete(expense._id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                            title="Delete Expense"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Add New Expense">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {selectedEvent && (
                        <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm mb-4 border border-yellow-100">
                            <strong>Note:</strong> This expense will be linked to valid active event: <strong>{selectedEvent.name}</strong>
                        </div>
                    )}
                    <Input
                        label="Description"
                        placeholder="e.g., Office Rent, Electricity Bill"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Category"
                            placeholder="e.g., Utilities"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                        <Input
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <Input
                        label="Amount (SAR)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                        required
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive">
                            Save Expense
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
