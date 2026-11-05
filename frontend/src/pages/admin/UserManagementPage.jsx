import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Trash2, Power, AlertCircle, Check } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { adminAPI } from '../../services/api';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Deletion modal
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers({
        role: roleFilter,
        status: statusFilter,
        search
      });
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminAPI.updateUserStatus(user._id, newStatus);
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
        setMessage(`User account ${user.email} is now ${newStatus}.`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      const res = await adminAPI.deleteUser(userToDelete._id);
      if (res.success) {
        setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
        setUserToDelete(null);
        setMessage('User account and related data permanently removed.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Platform User Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review, activate, suspend, or moderate registered student, recruiter, and administrator profiles
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50">
          {message}
        </div>
      )}

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-dark-border bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user records...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No users match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-surface/60 border-b border-slate-200 dark:border-dark-border text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-dark-surface/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center">
                            {u.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold ${
                              u.status === 'active'
                                ? 'border-amber-300 text-amber-600 hover:bg-amber-50'
                                : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!userToDelete}
        title="Delete User Account?"
        message={`Are you sure you want to permanently delete user "${userToDelete?.email}"? All related applications and job postings will also be deleted.`}
        confirmLabel="Delete User"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
};
