import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Event, EventStatus } from '@/lib/types';
import eventService from '../services/eventService';

interface EventState {
    events: Event[];
    selectedEventId: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: EventState = {
    events: [],
    selectedEventId: localStorage.getItem('selectedEventId'),
    isLoading: false,
    error: null,
};

export const fetchEvents = createAsyncThunk('events/fetchAll', async (_, { rejectWithValue }) => {
    try {
        return await eventService.getEvents();
    } catch (error) {
        return rejectWithValue((error as Error).message);
    }
});

export const createEvent = createAsyncThunk(
    'events/create',
    async (eventData: { name: string; date: number; location: string }, { rejectWithValue }) => {
        try {
            return await eventService.createEvent(eventData);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateEventStatus = createAsyncThunk(
    'events/updateStatus',
    async ({ id, status }: { id: string; status: EventStatus }, { rejectWithValue }) => {
        try {
            return await eventService.updateEventStatus(id, status);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'events/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await eventService.deleteEvent(id);
            return id;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedEvent: (state, action: PayloadAction<string | null>) => {
            state.selectedEventId = action.payload;
            if (action.payload) {
                localStorage.setItem('selectedEventId', action.payload);
            } else {
                localStorage.removeItem('selectedEventId');
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Events
            .addCase(fetchEvents.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
                state.isLoading = false;
                state.events = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Event
            .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
                state.events.unshift(action.payload);
            })
            // Update Event Status
            .addCase(updateEventStatus.fulfilled, (state, action: PayloadAction<Event>) => {
                const index = state.events.findIndex(e => e._id === action.payload._id);
                if (index !== -1) {
                    state.events[index] = action.payload;
                }
            })
            // Delete Event
            .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
                state.events = state.events.filter(e => e._id !== action.payload);
                if (state.selectedEventId === action.payload) {
                    state.selectedEventId = null;
                    localStorage.removeItem('selectedEventId');
                }
            });
    },
});

export const { clearError, setSelectedEvent } = eventSlice.actions;
export default eventSlice.reducer;
