import React from 'react';
import { User, Phone, MapPin, Tablet } from 'lucide-react';
import { Input } from './ui/input';

import { Label } from './ui/label';

export interface CustomerDetails {
    name: string;
    phone: string;
    location: string;
    notes: string;
}

interface CustomerFormProps {
    value: CustomerDetails;
    onChange: (details: CustomerDetails) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ value, onChange }) => {
    const handleChange = (field: keyof CustomerDetails, val: string) => {
        onChange({
            ...value,
            [field]: val,
        });
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="customer-phone" className="text-xs font-semibold text-slate-500 uppercase">
                        Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                        <Input
                            id="customer-phone"
                            placeholder="555-0123"
                            className="pl-9"
                            value={value.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="customer-name" className="text-xs font-semibold text-slate-500 uppercase">
                        Full Name
                    </Label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-slate-400" />
                        <Input
                            id="customer-name"
                            placeholder="John Doe"
                            className="pl-9"
                            value={value.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="customer-location" className="text-xs font-semibold text-slate-500 uppercase">
                        Location
                    </Label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                        <Input
                            id="customer-location"
                            placeholder="Area / Street"
                            className="pl-9"
                            value={value.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="customer-notes" className="text-xs font-semibold text-slate-500 uppercase">
                        Notes
                    </Label>
                    <div className="relative">
                        <Tablet size={16} className="absolute left-3 top-3 text-slate-400" />
                        <Input
                            id="customer-notes"
                            placeholder="Preferences..."
                            className="pl-9"
                            value={value.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
