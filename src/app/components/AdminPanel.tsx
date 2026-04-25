import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Database, X } from 'lucide-react';

interface User {
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from localStorage
    const usersData = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(usersData);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Database className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                Database Viewer
              </h2>
              <p className="text-sm text-muted-foreground">
                LocalStorage Users Database
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="size-10 rounded-xl bg-muted hover:bg-accent flex items-center justify-center transition-colors"
          >
            <X className="size-5" />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="bg-muted rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <Users className="size-5 text-primary" />
            <span className="text-lg">
              Total Registered Users: <strong>{users.length}</strong>
            </span>
          </div>
        </div>

        {/* Users table */}
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Database className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users registered yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create an account to see users appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Password
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm">{index + 1}</td>
                    <td className="py-4 px-4 font-medium">{user.name}</td>
                    <td className="py-4 px-4 text-sm font-mono text-primary">
                      {user.email}
                    </td>
                    <td className="py-4 px-4 text-sm font-mono text-muted-foreground">
                      {user.password}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Tip:</strong> Open DevTools (F12) → Application → Local Storage →
            Look for the "users" key to see this data in JSON format
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(users, null, 2));
              alert('Users data copied to clipboard!');
            }}
            className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary-hover transition-colors"
          >
            Copy JSON Data
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (confirm('Are you sure you want to delete all users? This cannot be undone!')) {
                localStorage.removeItem('users');
                setUsers([]);
              }
            }}
            className="px-6 py-3 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors"
          >
            Clear All Users
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
