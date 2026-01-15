import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Save } from 'lucide-react';
import type { RootState, AppDispatch } from '@/state/store';
import { updateProfile } from '@/state/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const ProfileEdit: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isLoading } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        const updateData: { name?: string; email?: string; password?: string } = {};
        if (formData.name !== user?.name) updateData.name = formData.name;
        if (formData.email !== user?.email) updateData.email = formData.email;
        if (formData.password) updateData.password = formData.password;

        if (Object.keys(updateData).length === 0) {
            setMessage({ type: 'info', text: 'No changes to save' });
            return;
        }

        try {
            await dispatch(updateProfile(updateData)).unwrap();
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setFormData({ ...formData, password: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error as string });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {message.text && (
                        <div
                            className={`px-4 py-3 rounded-lg text-sm ${message.type === 'error'
                                    ? 'bg-red-50 border border-red-200 text-red-700'
                                    : message.type === 'success'
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-blue-50 border border-blue-200 text-blue-700'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <Input
                        type="text"
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        type="email"
                        label="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Input
                        type="password"
                        label="New Password (leave blank to keep current)"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <Input
                        type="password"
                        label="Confirm New Password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                </CardContent>

                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default ProfileEdit;
