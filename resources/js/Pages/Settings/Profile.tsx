import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TopBar from '@/Components/navigation/TopBar';
import { Card, CardTitle, CardDescription } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import type { User } from '@/types/models';

interface Props {
    user: User;
}

export default function SettingsProfile({ user }: Props) {
    const profileForm = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        tax_identification_number: user.tax_identification_number || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/settings/profile');
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <>
            <Head title="Settings" />
            <AppLayout>
                <TopBar title="Settings" subtitle="Manage your account" />

                <div className="p-4 sm:p-6 max-w-2xl space-y-6">
                    {/* Profile */}
                    <Card>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription className="mt-1">Update your personal details and tax information</CardDescription>
                        <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
                            <Input
                                id="name"
                                label="Full Name"
                                helpText="Your display name in the app"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                error={profileForm.errors.name}
                            />
                            <Input
                                id="email"
                                type="email"
                                label="Email"
                                helpText="Login email address"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                error={profileForm.errors.email}
                            />
                            <Input
                                id="phone"
                                label="Phone Number"
                                helpText="Malaysian phone number (optional)"
                                value={profileForm.data.phone}
                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                error={profileForm.errors.phone}
                                placeholder="+60"
                            />
                            <Input
                                id="tax_identification_number"
                                label="Tax Identification Number (TIN)"
                                helpText="11-digit TIN from LHDN for tax relief tracking"
                                value={profileForm.data.tax_identification_number}
                                onChange={(e) => profileForm.setData('tax_identification_number', e.target.value)}
                                error={profileForm.errors.tax_identification_number}
                                hint="Your Malaysian tax identification number for LHDN"
                            />
                            <Button type="submit" loading={profileForm.processing} tooltip="Save profile changes">
                                <UserIcon className="h-4 w-4 mr-1.5" />
                                Save Profile
                            </Button>
                        </form>
                    </Card>

                    {/* Password */}
                    <Card>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription className="mt-1">Ensure your account is using a strong password</CardDescription>
                        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                            <Input
                                id="current_password"
                                type="password"
                                label="Current Password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                error={passwordForm.errors.current_password}
                            />
                            <Input
                                id="new_password"
                                type="password"
                                label="New Password"
                                helpText="Must be at least 8 characters"
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                error={passwordForm.errors.password}
                            />
                            <Input
                                id="password_confirmation"
                                type="password"
                                label="Confirm New Password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                            />
                            <Button type="submit" loading={passwordForm.processing} tooltip="Update your password">
                                <LockClosedIcon className="h-4 w-4 mr-1.5" />
                                Change Password
                            </Button>
                        </form>
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}
