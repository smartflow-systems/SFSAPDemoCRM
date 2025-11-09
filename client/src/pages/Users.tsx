import { useState } from 'react';
import Page from '@/components/layout/Page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Search, UserCog, Shield, Edit, Trash2 } from 'lucide-react';
import type { User } from '@shared/schema';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('/api/users')
  });

  const filteredUsers = users.filter(user => {
    const search = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-900/30 text-red-400 border-red-800';
      case 'Manager': return 'bg-blue-900/30 text-blue-400 border-blue-800';
      case 'Sales Rep': return 'bg-green-900/30 text-green-400 border-green-800';
      case 'Viewer': return 'bg-gray-900/30 text-gray-400 border-gray-800';
      default: return 'bg-gold-900/30 text-gold border-gold-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <Shield className="h-4 w-4" />;
      case 'Manager': return <UserCog className="h-4 w-4" />;
      default: return <UserCog className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Page title="User Management">
        <div className="text-center py-12 text-gold-300">Loading users...</div>
      </Page>
    );
  }

  return (
    <Page title="User Management">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-300" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-gold"
            />
          </div>
        </div>
        <Button className="btn-gold" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">{users.length}</div>
            <p className="text-sm text-gold-300">Total Users</p>
          </CardContent>
        </Card>
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">
              {users.filter(u => u.role === 'Admin').length}
            </div>
            <p className="text-sm text-gold-300">Administrators</p>
          </CardContent>
        </Card>
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">
              {users.filter(u => u.role === 'Sales Rep').length}
            </div>
            <p className="text-sm text-gold-300">Sales Reps</p>
          </CardContent>
        </Card>
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">
              {filteredUsers.length}
            </div>
            <p className="text-sm text-gold-300">Matching Search</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="panel-dark border-gold-800/30">
        <CardHeader>
          <CardTitle className="text-gold-shine">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gold-300">
              {searchQuery ? 'No users match your search.' : 'No users yet.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-brown-900/30 border border-gold-800/20 hover:border-gold-600/40 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gold-900/30 flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-gold-shine font-semibold">{user.fullName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gold-300">@{user.username} • {user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-gold-300 hover:text-gold">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}
