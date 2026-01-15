import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/state/store';
import { fetchSettings, updateSettings } from '@/state/slices/settingsSlice';
import { Input } from '@/components/ui/input';

const Settings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { settings, isLoading } = useSelector((state: RootState) => state.settings);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const handleOpeningBalanceChange = (value: number) => {
        dispatch(updateSettings({ openingBalance: value }));
    };

    if (isLoading || !settings) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-indigo-600">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-800">Settings</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Financial Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <Input
                                type="number"
                                label="Opening Balance (SAR)"
                                value={settings.openingBalance}
                                onChange={(e) => handleOpeningBalanceChange(Number(e.target.value))}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                This is the initial cash on hand before any sales.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <h3 className="font-semibold text-lg mb-4">User & Sync</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Registered Email ID</label>
                            <input
                                type="email"
                                value={settings.userEmail}
                                disabled
                                className="w-full p-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Data is synced to this account across devices. Email cannot be changed here.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <h3 className="font-semibold text-lg mb-4">Currency</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                            <input
                                type="text"
                                value={settings.currency}
                                disabled
                                className="w-full p-2 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Currently set to {settings.currency}. Currency change is not supported.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
