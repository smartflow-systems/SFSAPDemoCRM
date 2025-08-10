import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Download, Upload, Eye } from "lucide-react";
import { useCRM, useLeads } from "@/contexts/CRMContext";
import AddLeadModal from "@/components/AddLeadModal";
import { format } from "date-fns";

export default function Leads() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useCRM();
  const { data: leads = [], isLoading } = useLeads();
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSourceFilter("all");
    setStatusFilter("all");
  };

  const exportCSV = () => {
    const csvData = filteredLeads.map(lead => ({
      Name: `${lead.firstName} ${lead.lastName}`,
      Company: lead.company || '',
      Email: lead.email || '',
      Phone: lead.phone || '',
      Source: lead.source,
      Status: lead.status,
      Owner: 'Gareth Bowers',
      Created: format(new Date(lead.createdAt!), 'yyyy-MM-dd')
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "New": return "badge-gold";
      case "Qualified": return "badge-gold";
      case "Converted": return "bg-green-600/20 text-green-400 border-green-600/30";
      case "Lost": return "bg-red-600/20 text-red-400 border-red-600/30";
      default: return "badge-gold";
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-gold-shine text-4xl font-extrabold">Leads</h1>
        </div>
        <Card className="panel-dark border-gold rounded-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-16 rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-gold-shine text-4xl font-extrabold">Leads</h1>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setIsAddLeadModalOpen(true)}
            className="btn-gold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Lead
          </Button>
          <Button className="btn-gold-ghost">
            <Upload className="w-5 h-5 mr-2" />
            Import CSV
          </Button>
          <Button onClick={exportCSV} className="btn-gold-ghost">
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="panel-dark border-gold mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Search leads..."
              className="input-dark"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="input-dark">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="bg-black-900 border-gold-800/30">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Cold Call">Cold Call</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="input-dark">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-black-900 border-gold-800/30">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={clearFilters}
              className="btn-gold-ghost"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-gold-300 text-sm">
          Showing {filteredLeads.length} of {leads.length} leads
        </p>
      </div>

      {/* Leads Table */}
      <Card className="panel-dark border-gold rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-black-900/50 border-b border-gold-800/20">
                <TableHead className="px-6 py-4 text-left text-gold font-semibold">Name</TableHead>
                <TableHead className="px-6 py-4 text-left text-gold font-semibold">Company</TableHead>
                <TableHead className="px-6 py-4 text-left text-gold font-semibold">Email</TableHead>
                <TableHead className="px-6 py-4 text-left text-gold font-semibold">Source</TableHead>
                <TableHead className="px-6 py-4 text-left text-gold font-semibold">Status</TableHead>
                <TableHead className="px-6 py-4 text-left text-gold font-semibold">Created</TableHead>
                <TableHead className="px-6 py-4 text-left text-gold font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gold-800/20">
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-black-900/30 transition-colors">
                  <TableCell className="px-6 py-4 text-gold-100">
                    {lead.firstName} {lead.lastName}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gold-300">
                    {lead.company || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gold-300">
                    {lead.email || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="badge-gold">{lead.source}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gold-300">
                    {format(new Date(lead.createdAt!), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Link href={`/leads/${lead.id}`}>
                      <Button className="btn-gold-ghost text-sm px-3 py-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="bg-black-900/30 px-6 py-4 border-t border-gold-800/20">
          <div className="flex items-center justify-between">
            <div className="text-gold-300 text-sm">
              Showing {filteredLeads.length} results
            </div>
            <div className="flex space-x-2">
              <Button className="btn-gold-ghost text-sm px-3 py-1" disabled>
                Previous
              </Button>
              <Button className="btn-gold text-sm px-3 py-1">1</Button>
              <Button className="btn-gold-ghost text-sm px-3 py-1" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <AddLeadModal 
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
      />
    </main>
  );
}
