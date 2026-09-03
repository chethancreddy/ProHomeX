'use client';

import { useState, useTransition } from 'react';
import { updateAdminCredentials, createStaffAccount, updateStaffRole } from './actions';
import { Button } from '@/components/ui/Button';
import { Shield, UserPlus, Key, Mail, Edit } from 'lucide-react';

export default function SettingsClient({ initialStaff, currentUserEmail }: { initialStaff: any[]; currentUserEmail: string }) {
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // My Account State
  const [email, setEmail] = useState(currentUserEmail);
  const [password, setPassword] = useState('');

  // New Staff State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffRole, setStaffRole] = useState('TECHNICIAN');

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  function handleUpdateMyAccount(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    startTransition(async () => {
      const res = await updateAdminCredentials(email, password || undefined);
      if (res.success) {
        showToast('Your account credentials have been updated successfully.');
        setPassword('');
      } else {
        setErrorMessage(res.error || 'Failed to update credentials.');
      }
    });
  }

  function handleCreateStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createStaffAccount(formData);
      if (res.success) {
        showToast('Staff account created successfully.');
        setShowStaffModal(false);
      } else {
        setErrorMessage(res.error || 'Failed to create staff account.');
      }
    });
  }

  function handleChangeRole(userId: string, newRole: string) {
    setErrorMessage('');
    startTransition(async () => {
      const res = await updateStaffRole(userId, newRole);
      if (res.success) {
        showToast('Staff role updated successfully.');
      } else {
        setErrorMessage(res.error || 'Failed to update role.');
      }
    });
  }

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
          {toastMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* MY ACCOUNT SECTION */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Key size={18} className="text-blue-600" /> My Admin Credentials
        </h2>
        <form onSubmit={handleUpdateMyAccount} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="password" 
                placeholder="Leave blank to keep current password"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <Button type="submit" isLoading={isPending}>Update Credentials</Button>
        </form>
      </section>

      {/* STAFF MANAGEMENT SECTION */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield size={18} className="text-emerald-600" /> Staff & Roles Management
          </h2>
          <Button onClick={() => setShowStaffModal(true)} variant="secondary" className="flex items-center gap-2">
            <UserPlus size={16} /> Create Staff
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Role</th>
              </tr>
            </thead>
            <tbody>
              {initialStaff.map(staff => (
                <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{staff.full_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{staff.email}</td>
                  <td className="py-3 px-4 text-sm">
                    <select
                      value={staff.role}
                      onChange={(e) => handleChangeRole(staff.id, e.target.value)}
                      disabled={isPending}
                      className="border border-gray-200 rounded-md px-2 py-1 text-xs font-semibold bg-white text-gray-700"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="SALES">SALES</option>
                      <option value="TECHNICAL_TEAM">TECHNICAL_TEAM</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="INVENTORY">INVENTORY</option>
                      <option value="ACCOUNTS">ACCOUNTS</option>
                    </select>
                  </td>
                </tr>
              ))}
              {initialStaff.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-gray-500">
                    No staff accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE STAFF MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Staff Account</h3>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="fullName" required type="text" className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" required type="email" className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input name="password" required type="password" minLength={6} className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" value={staffRole} onChange={e => setStaffRole(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SALES">SALES</option>
                  <option value="TECHNICAL_TEAM">TECHNICAL_TEAM</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="INVENTORY">INVENTORY</option>
                  <option value="ACCOUNTS">ACCOUNTS</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setShowStaffModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={isPending}>Create User</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
