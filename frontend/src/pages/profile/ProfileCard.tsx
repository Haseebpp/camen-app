import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail } from 'lucide-react';
import type { RootState } from '@/state/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ProfileCard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User size={20} />
                    Profile Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">Account Owner</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Mail size={24} />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{user.email}</p>
                        <p className="text-sm text-slate-500">Email Address</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileCard;
