import { useState } from 'react';
import Page from '@/components/layout/Page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Search, Mail, Phone, Building2 } from 'lucide-react';
import type { Contact } from '@shared/schema';

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
    queryFn: () => apiRequest('/api/contacts')
  });

  const filteredContacts = contacts.filter(contact => {
    const search = searchQuery.toLowerCase();
    return (
      contact.firstName?.toLowerCase().includes(search) ||
      contact.lastName?.toLowerCase().includes(search) ||
      contact.email?.toLowerCase().includes(search) ||
      contact.phone?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <Page title="Contacts">
        <div className="text-center py-12 text-gold-300">Loading contacts...</div>
      </Page>
    );
  }

  return (
    <Page title="Contacts">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold-300" />
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-gold"
            />
          </div>
        </div>
        <Button className="btn-gold">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">{contacts.length}</div>
            <p className="text-sm text-gold-300">Total Contacts</p>
          </CardContent>
        </Card>
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">
              {contacts.filter(c => c.accountId).length}
            </div>
            <p className="text-sm text-gold-300">Associated with Accounts</p>
          </CardContent>
        </Card>
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gold-shine">
              {filteredContacts.length}
            </div>
            <p className="text-sm text-gold-300">Matching Search</p>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <Card className="panel-dark border-gold-800/30">
          <CardContent className="py-12 text-center">
            <p className="text-gold-300">
              {searchQuery ? 'No contacts match your search.' : 'No contacts yet. Create your first contact!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="panel-dark border-gold-800/30 hover:border-gold-600/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-gold-shine text-lg">
                  {contact.firstName} {contact.lastName}
                </CardTitle>
                {contact.title && (
                  <p className="text-sm text-gold-300">{contact.title}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center text-sm text-gold-300">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${contact.email}`} className="hover:text-gold">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center text-sm text-gold-300">
                      <Phone className="h-4 w-4 mr-2" />
                      <a href={`tel:${contact.phone}`} className="hover:text-gold">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.accountId && (
                    <div className="flex items-center text-sm text-gold-300">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>Account ID: {contact.accountId.slice(0, 8)}...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
