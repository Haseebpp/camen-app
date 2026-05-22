import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Calendar, MapPin, ChevronRight, TrendingUp, TrendingDown, DollarSign, X, CheckCircle, Lock } from 'lucide-react';
import { Event } from '../types';

const Events: React.FC = () => {
  const { state, addEvent, updateEventStatus, deleteEvent } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({
      name: formData.name,
      date: new Date(formData.date).getTime(),
      location: formData.location
    });
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', date: new Date().toISOString().split('T')[0], location: '' });
  };

  const getEventStats = (eventId: string) => {
    const eventSales = state.sales.filter(s => s.eventId === eventId);
    const eventExpenses = state.expenses.filter(e => e.eventId === eventId);

    const revenue = eventSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const expenses = eventExpenses.reduce((sum, e) => sum + e.amount, 0);
    // Calculate COGS for this event
    const cogs = eventSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((isum, item) => {
        const product = state.products.find(p => p.id === item.productId);
        return isum + (product ? product.costPrice * item.quantity : 0);
      }, 0);
    }, 0);

    const totalCost = expenses + cogs;
    const profit = revenue - totalCost;

    return { revenue, expenses, cogs, profit, saleCount: eventSales.length, expenseCount: eventExpenses.length };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Events</h2>
          <p className="text-slate-500">Manage and track sales for specific events or dates.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.events.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-100 border-dashed">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700">No Events Created</h3>
            <p className="text-slate-500">Create an event to start tracking specific sales data.</p>
          </div>
        ) : (
          state.events.map(event => {
            const stats = getEventStats(event.id);
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{event.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Calendar size={14} /> {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <MapPin size={14} /> {event.location}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${event.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                    <div>
                      <p className="text-xs text-slate-500">Revenue</p>
                      <p className="font-semibold text-green-600">SAR {stats.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Net Profit</p>
                      <p className={`font-semibold ${stats.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                        SAR {stats.profit.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full mt-2 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    View Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Create New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
                <input required type="text" className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Summer Festival" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input required type="date" className="w-full p-2 border rounded-lg" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input required type="text" className="w-full p-2 border rounded-lg" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. City Mall" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedEvent.name}</h2>
                <p className="text-slate-500">{new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.location}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            {/* Financial Overview */}
            {(() => {
              const stats = getEventStats(selectedEvent.id);
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <p className="text-sm text-green-600 font-medium flex items-center gap-1"><TrendingUp size={16} /> Total Revenue</p>
                      <p className="text-2xl font-bold text-green-800 mt-1">SAR {stats.revenue}</p>
                      <p className="text-xs text-green-600 mt-1">{stats.saleCount} transactions</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <p className="text-sm text-red-600 font-medium flex items-center gap-1"><TrendingDown size={16} /> Total Costs</p>
                      <p className="text-2xl font-bold text-red-800 mt-1">SAR {(stats.expenses + stats.cogs).toLocaleString()}</p>
                      <p className="text-xs text-red-600 mt-1">{stats.expenseCount} expenses + COGS</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <p className="text-sm text-indigo-600 font-medium flex items-center gap-1"><DollarSign size={16} /> Net Profit</p>
                      <p className="text-2xl font-bold text-indigo-800 mt-1">SAR {stats.profit.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-bold text-slate-800 mb-4">Event Controls</h3>
                    <div className="flex gap-4">
                      {selectedEvent.status === 'OPEN' ? (
                        <button
                          onClick={() => {
                            updateEventStatus(selectedEvent.id, 'CLOSED');
                            setSelectedEvent({ ...selectedEvent, status: 'CLOSED' });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                        >
                          <Lock size={16} /> Close Event
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateEventStatus(selectedEvent.id, 'OPEN');
                            setSelectedEvent({ ...selectedEvent, status: 'OPEN' });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle size={16} /> Re-open Event
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {selectedEvent.status === 'OPEN'
                        ? "Event is currently active. You can select this event when adding sales or expenses."
                        : "Event is closed. New transactions cannot be added to this event."}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;