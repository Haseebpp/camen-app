import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    Calendar,
    MapPin,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    DollarSign,
    X,
    CheckCircle,
    Lock,
} from 'lucide-react';
import type { RootState, AppDispatch } from '@/state/store';
import type { Event, EventStats } from '@/lib/types';
import { fetchEvents, createEvent, updateEventStatus } from '@/state/slices/eventSlice';
import eventService from '@/state/services/eventService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

const Events: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { events, isLoading, error } = useSelector((state: RootState) => state.events);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventStats, setEventStats] = useState<EventStats | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
    });

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(
            createEvent({
                name: formData.name,
                date: new Date(formData.date).getTime(),
                location: formData.location,
            })
        );
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', date: new Date().toISOString().split('T')[0], location: '' });
    };

    const openEventDetails = async (event: Event) => {
        setSelectedEvent(event);
        try {
            const stats = await eventService.getEventStats(event._id);
            setEventStats(stats);
        } catch (error) {
            console.error('Failed to load event stats:', error);
        }
    };

    const handleStatusChange = async (status: 'OPEN' | 'CLOSED') => {
        if (selectedEvent) {
            await dispatch(updateEventStatus({ id: selectedEvent._id, status }));
            setSelectedEvent({ ...selectedEvent, status });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Events</h2>
                    <p className="text-slate-500">Manage and track sales for specific events or dates.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Event
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center">Loading...</div>
                ) : events.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-100 border-dashed">
                        <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-700">No Events Created</h3>
                        <p className="text-slate-500">Create an event to start tracking specific sales data.</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event._id}
                            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
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
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-bold ${event.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {event.status}
                                    </span>
                                </div>

                                <button
                                    onClick={() => openEventDetails(event)}
                                    className="w-full mt-2 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium text-sm flex items-center justify-center gap-2"
                                >
                                    View Details <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New Event Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New Event">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Event Name"
                        placeholder="e.g. Summer Festival"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                    <Input
                        label="Location"
                        placeholder="e.g. City Mall"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Event</Button>
                    </div>
                </form>
            </Modal>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{selectedEvent.name}</h2>
                                <p className="text-slate-500">
                                    {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.location}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedEvent(null);
                                    setEventStats(null);
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {eventStats && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                            <TrendingUp size={16} /> Total Revenue
                                        </p>
                                        <p className="text-2xl font-bold text-green-800 mt-1">SAR {eventStats.revenue}</p>
                                        <p className="text-xs text-green-600 mt-1">{eventStats.saleCount} transactions</p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                                            <TrendingDown size={16} /> Total Costs
                                        </p>
                                        <p className="text-2xl font-bold text-red-800 mt-1">
                                            SAR {(eventStats.expenses + eventStats.cogs).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-red-600 mt-1">{eventStats.expenseCount} expenses + COGS</p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <p className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                                            <DollarSign size={16} /> Net Profit
                                        </p>
                                        <p className="text-2xl font-bold text-indigo-800 mt-1">
                                            SAR {eventStats.profit.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6">
                                    <h3 className="font-bold text-slate-800 mb-4">Event Controls</h3>
                                    <div className="flex gap-4">
                                        {selectedEvent.status === 'OPEN' ? (
                                            <Button onClick={() => handleStatusChange('CLOSED')} variant="secondary">
                                                <Lock size={16} /> Close Event
                                            </Button>
                                        ) : (
                                            <Button onClick={() => handleStatusChange('OPEN')}>
                                                <CheckCircle size={16} /> Re-open Event
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {selectedEvent.status === 'OPEN'
                                            ? 'Event is currently active. You can select this event when adding sales or expenses.'
                                            : 'Event is closed. New transactions cannot be added to this event.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
