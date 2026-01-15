import React from 'react';
import { useData } from '../contexts/DataContext';

const Settings: React.FC = () => {
  const { state, updateSettings } = useData();

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Financial Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance (SAR)</label>
              <input 
                type="number" 
                value={state.settings.openingBalance}
                onChange={(e) => updateSettings({ openingBalance: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">This is the initial cash on hand before any sales.</p>
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
                value={state.settings.userEmail}
                onChange={(e) => updateSettings({ userEmail: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Data is synced to this account across devices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;