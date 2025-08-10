import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, Building, Calendar, Plus, Download } from "lucide-react";
import { useCRM, useLead, useLeadActivities, useCreateActivity } from "@/contexts/CRMContext";
import { format } from "date-fns";

export default function LeadDetail() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useCRM();
  
  const { data: lead, isLoading: leadLoading } = useLead(id!);
  const { data: activities = [], isLoading: activitiesLoading } = useLeadActivities(id!);
  const createActivity = useCreateActivity();
  
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (leadLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => setLocation("/leads")}
            className="btn-gold-ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="panel-dark border-gold">
              <CardContent className="p-6">
                <div className="skeleton h-8 w-64 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-4 w-full"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="panel-dark border-gold">
              <CardContent className="p-6">
                <div className="skeleton h-6 w-32 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-4 w-full"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (!lead) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-gold text-2xl font-bold mb-4">Lead Not Found</h1>
          <Button 
            onClick={() => setLocation("/leads")}
            className="btn-gold"
          >
            Back to Leads
          </Button>
        </div>
      </main>
    );
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      await createActivity.mutateAsync({
        type: "Note",
        subject: "Note added",
        description: noteText,
        leadId: lead.id,
        contactId: null,
        opportunityId: null,
        accountId: null,
        ownerId: user?.id || "",
        dueDate: null,
        completed: true,
      });

      setNoteText("");
      setIsAddingNote(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const exportLead = () => {
    const leadData = {
      Name: `${lead.firstName} ${lead.lastName}`,
      Company: lead.company || '',
      Email: lead.email || '',
      Phone: lead.phone || '',
      Title: lead.title || '',
      Source: lead.source,
      Status: lead.status,
      Notes: lead.notes || '',
      Created: format(new Date(lead.createdAt!), 'yyyy-MM-dd HH:mm:ss')
    };

    const csvString = [
      Object.keys(leadData).join(','),
      Object.values(leadData).map(value => `"${value}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead_${lead.firstName}_${lead.lastName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          onClick={() => setLocation("/leads")}
          className="btn-gold-ghost mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-gold-shine text-4xl font-extrabold">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="text-gold-300 text-lg mt-2">
              {lead.company && `${lead.company} • `}{lead.title}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button className="btn-gold">Convert to Opportunity</Button>
            <Button className="btn-gold-ghost">Mark Lost</Button>
            <Button onClick={exportLead} className="btn-gold-ghost">
              <Download className="w-4 h-4 mr-2" />
              Export Lead
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Information */}
          <Card className="panel-dark border-gold">
            <CardHeader>
              <CardTitle className="text-gold text-xl font-bold">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gold-300 text-sm font-medium">Contact Information</Label>
                    <div className="mt-2 space-y-2">
                      {lead.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gold-300" />
                          <span className="text-gold-100">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gold-300" />
                          <span className="text-gold-100">{lead.phone}</span>
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gold-300" />
                          <span className="text-gold-100">{lead.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-gold-300 text-sm font-medium">Lead Details</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gold-300">Source:</span>
                        <Badge className="badge-gold">{lead.source}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gold-300">Status:</span>
                        <Badge className="badge-gold">{lead.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gold-300">Owner:</span>
                        <span className="text-gold-100">Gareth Bowers</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gold-300">Created:</span>
                        <span className="text-gold-100">
                          {format(new Date(lead.createdAt!), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {lead.notes && (
                <div>
                  <Label className="text-gold-300 text-sm font-medium">Notes</Label>
                  <div className="mt-2 p-3 bg-black-900/50 rounded-lg">
                    <p className="text-gold-100">{lead.notes}</p>
                  </div>
                </div>
              )}
              
              {lead.tags && lead.tags.length > 0 && (
                <div>
                  <Label className="text-gold-300 text-sm font-medium">Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {lead.tags.map((tag, index) => (
                      <Badge key={index} className="badge-gold">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activities */}
          <Card className="panel-dark border-gold">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-gold text-xl font-bold">Activities</CardTitle>
                <Button 
                  onClick={() => setIsAddingNote(true)}
                  className="btn-gold-ghost"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isAddingNote && (
                <div className="mb-6 p-4 bg-black-900/50 rounded-lg">
                  <Label className="text-gold-300 text-sm font-medium mb-2 block">
                    Add New Note
                  </Label>
                  <Textarea
                    className="input-dark mb-3"
                    rows={3}
                    placeholder="Enter your note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleAddNote}
                      className="btn-gold"
                      disabled={createActivity.isPending || !noteText.trim()}
                    >
                      {createActivity.isPending ? "Adding..." : "Add Note"}
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsAddingNote(false);
                        setNoteText("");
                      }}
                      className="btn-gold-ghost"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-black-900/50 rounded-lg">
                    <div className="bg-gold-gradient p-2 rounded-full">
                      {activity.type === "Call" && <Phone className="w-4 h-4 text-black-900" />}
                      {activity.type === "Email" && <Mail className="w-4 h-4 text-black-900" />}
                      {activity.type === "Note" && <Calendar className="w-4 h-4 text-black-900" />}
                      {activity.type === "Task" && <Calendar className="w-4 h-4 text-black-900" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gold-100 font-medium">{activity.subject}</p>
                      <p className="text-gold-300 text-sm mt-1">{activity.description}</p>
                      <div className="flex items-center mt-2 text-gold-300 text-sm">
                        <span>Gareth Bowers</span>
                        <span className="mx-2">•</span>
                        <span>{format(new Date(activity.createdAt!), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activities.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gold-300">No activities recorded yet.</p>
                    <Button 
                      onClick={() => setIsAddingNote(true)}
                      className="btn-gold-ghost mt-3"
                    >
                      Add First Note
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Actions */}
          <Card className="panel-dark border-gold">
            <CardHeader>
              <CardTitle className="text-gold text-lg font-bold">Next Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-gold-300 text-sm font-medium mb-2 block">
                    Next Action Date
                  </Label>
                  <Input 
                    type="date" 
                    className="input-dark"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label className="text-gold-300 text-sm font-medium mb-2 block">
                    Action Description
                  </Label>
                  <Textarea 
                    className="input-dark" 
                    rows={3}
                    placeholder="Next action to take..."
                  />
                </div>
                <Button className="btn-gold w-full">
                  Save Next Action
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="panel-dark border-gold">
            <CardHeader>
              <CardTitle className="text-gold text-lg font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="btn-gold-ghost w-full">
                <Phone className="w-4 h-4 mr-2" />
                Log Call
              </Button>
              <Button className="btn-gold-ghost w-full">
                <Mail className="w-4 h-4 mr-2" />
                Log Email
              </Button>
              <Button className="btn-gold-ghost w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button className="btn-gold w-full">
                Convert to Opportunity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
