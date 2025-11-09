import { useState } from 'react';
import Page from '@/components/layout/Page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Search, Building2, MapPin, Globe } from 'lucide-react';
import type { Account } from '@shared/schema';

export default function Accounts() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    queryFn: () => apiRequest('/api/accounts')
  });

  const filteredAccounts = accounts.filter(account => {
    const search = searchQuery.toLowerCase();
    return (
      account.name.toLowerCase().includes(search) ||
      account.industry?.toLowerCase().includes(search) ||
      account.website?.toLowerCase().includes(search)
    );
  });

  // Calculate stats
  const totalRevenue = accounts.reduce((sum, acc) => sum + (acc.annualRevenue || 0), 0);
  const avgEmployees = accounts.length > 0
    ? Math.round(accounts.reduce((sum, acc) => sum + (acc.numberOfEmployees || 0), 0) / accounts.length)
    : 0;

  if (isLoading) {
    return (
      <Page title="Accounts">
        <div className="text-center py-12 text-gold-300">Loading accounts...</div>
      </Page>
    );
  }

  return (
    <Page title="Accounts">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-300" />
            <Input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-gold"
            />
          </div>
        </div>
        <Button className="btn-gold">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">{accounts.length}</div>
            <p className="text-sm text-gold-300">Total Accounts</p>
          </CardContent>
        </Card>
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">
              ${(totalRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-sm text-gold-300">Combined Annual Revenue</p>
          </CardContent>
        </Card>
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">{avgEmployees}</div>
            <p className="text-sm text-gold-300">Avg. Employees</p>
          </CardContent>
        </Card>
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">
              {filteredAccounts.length}
            </div>
            <p className="text-sm text-gold-300">Matching Search</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      {filteredAccounts.length === 0 ? (
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="py-12 text-center">
            <p className="text-gold-300">
              {searchQuery ? 'No accounts match your search.' : 'No accounts yet. Create your first account!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAccounts.map((account) => (
            <Card key={account.id} className="panel-dark border-gold-800/30 hover:border-gold-600/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-gold-shine text-xl flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      {account.name}
                    </CardTitle>
                    {account.industry && (
                      <p className="text-sm text-gold-300 mt-1">{account.industry}</p>
                    )}
                  </div>
                  {account.accountType && (
                    <span className="px-3 py-1 bg-gold-900/30 text-gold border border-gold-800/30 rounded-full text-xs font-semibold">
                      {account.accountType}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gold-300 uppercase mb-2">Details</h4>
                    <div className="space-y-1 text-sm text-gold-300">
                      {account.numberOfEmployees && (
                        <p>Employees: {account.numberOfEmployees.toLocaleString()}</p>
                      )}
                      {account.annualRevenue && (
                        <p>Revenue: ${(account.annualRevenue / 1000000).toFixed(1)}M</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gold-300 uppercase mb-2">Contact</h4>
                    <div className="space-y-1 text-sm text-gold-300">
                      {account.phone && (
                        <div className="flex items-center">
                          <span>{account.phone}</span>
                        </div>
                      )}
                      {account.website && (
                        <div className="flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          <a href={account.website} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                            {account.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gold-300 uppercase mb-2">Location</h4>
                    <div className="space-y-1 text-sm text-gold-300">
                      {(account.billingStreet || account.billingCity || account.billingState) && (
                        <div className="flex items-start">
                          <MapPin className="h-3 w-3 mr-1 mt-1 flex-shrink-0" />
                          <div>
                            {account.billingStreet && <p>{account.billingStreet}</p>}
                            <p>
                              {account.billingCity && `${account.billingCity}, `}
                              {account.billingState && `${account.billingState} `}
                              {account.billingPostalCode}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
