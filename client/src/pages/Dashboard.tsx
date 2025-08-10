import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Download, FileText, Phone, Mail, User, TrendingUp, Calendar } from "lucide-react";
import { useCRM, useLeads, useOpportunities, useActivities } from "@/contexts/CRMContext";
import AddLeadModal from "@/components/AddLeadModal";
import { format } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useCRM();
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useOpportunities();
  const { data: activities = [], isLoading: activitiesLoading } = useActivities();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Calculate KPIs
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const leadsThisMonth = leads.filter(lead => {
    const leadDate = new Date(lead.createdAt!);
    return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
  }).length;

  const todaysActivities = activities.filter(activity => 
    activity.dueDate && new Date(activity.dueDate).toDateString() === today.toDateString()
  ).length;

  const conversionRate = leads.length > 0 ? 
    ((opportunities.filter(opp => opp.stage === "Won").length / leads.length) * 100).toFixed(1) : "0.0";

  const pipelineValue = opportunities
    .filter(opp => opp.stage !== "Won" && opp.stage !== "Lost")
    .reduce((sum, opp) => sum + opp.amount, 0);

  const recentActivities = activities
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  const pipelineOverview = [
    { stage: "New", count: opportunities.filter(opp => opp.stage === "New").length },
    { stage: "Qualified", count: opportunities.filter(opp => opp.stage === "Qualified").length },
    { stage: "Proposal", count: opportunities.filter(opp => opp.stage === "Proposal").length },
    { stage: "Won", count: opportunities.filter(opp => opp.stage === "Won").length },
  ];

  const todaysTasks = activities
    .filter(activity => 
      activity.type === "Task" && 
      !activity.completed &&
      activity.dueDate &&
      new Date(activity.dueDate) <= today
    )
    .slice(0, 3);

  const exportCSV = () => {
    // Simple CSV export functionality
    const csvData = leads.map(lead => ({
      Name: `${lead.firstName} ${lead.lastName}`,
      Company: lead.company || '',
      Email: lead.email || '',
      Phone: lead.phone || '',
      Source: lead.source,
      Status: lead.status,
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-gold-shine text-4xl font-extrabold">Dashboard</h1>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setIsAddLeadModalOpen(true)}
            className="btn-gold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Lead
          </Button>
          <Button 
            onClick={exportCSV}
            className="btn-gold-ghost"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="panel-dark border-gold">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-300 text-sm font-medium">Today's Activities</p>
                <p className="text-gold text-3xl font-bold mt-2">{todaysActivities}</p>
              </div>
              <div className="bg-gold-gradient p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-black-900" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gold-300 text-sm">
                {activities.filter(a => a.completed).length} completed today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="panel-dark border-gold">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-300 text-sm font-medium">Leads This Month</p>
                <p className="text-gold text-3xl font-bold mt-2">{leadsThisMonth}</p>
              </div>
              <div className="bg-gold-gradient p-3 rounded-lg">
                <User className="w-6 h-6 text-black-900" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">Total leads: {leads.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="panel-dark border-gold">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-300 text-sm font-medium">Conversion Rate</p>
                <p className="text-gold text-3xl font-bold mt-2">{conversionRate}%</p>
              </div>
              <div className="bg-gold-gradient p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-black-900" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">
                {opportunities.filter(opp => opp.stage === "Won").length} won deals
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="panel-dark border-gold">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-300 text-sm font-medium">Pipeline Value</p>
                <p className="text-gold text-3xl font-bold mt-2">
                  ${(pipelineValue / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="bg-gold-gradient p-3 rounded-lg">
                <FileText className="w-6 h-6 text-black-900" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">
                {opportunities.filter(opp => opp.stage !== "Won" && opp.stage !== "Lost").length} active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="panel-dark border-gold">
            <CardContent className="p-6">
              <h2 className="text-gold text-xl font-bold mb-6">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-black-900/50 rounded-lg">
                    <div className="bg-gold-gradient p-2 rounded-full">
                      {activity.type === "Call" && <Phone className="w-4 h-4 text-black-900" />}
                      {activity.type === "Email" && <Mail className="w-4 h-4 text-black-900" />}
                      {activity.type === "Note" && <FileText className="w-4 h-4 text-black-900" />}
                      {activity.type === "Task" && <Calendar className="w-4 h-4 text-black-900" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gold-100 font-medium">{activity.subject}</p>
                      <p className="text-gold-300 text-sm mt-1">{activity.description}</p>
                      <div className="flex items-center mt-2 text-gold-300 text-sm">
                        <span>Gareth Bowers</span>
                        <span className="mx-2">•</span>
                        <span>{format(new Date(activity.createdAt!), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="hr-gold my-6" />
              
              <div className="flex justify-center">
                <Button className="btn-gold-ghost">View All Activities</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pipeline Overview */}
          <Card className="panel-dark border-gold">
            <CardContent className="p-6">
              <h3 className="text-gold text-lg font-bold mb-4">Pipeline Overview</h3>
              <div className="space-y-3">
                {pipelineOverview.map((item) => (
                  <div key={item.stage} className="flex justify-between items-center">
                    <span className="text-gold-300">{item.stage}</span>
                    <span className="badge-gold">{item.count} deals</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card className="panel-dark border-gold">
            <CardContent className="p-6">
              <h3 className="text-gold text-lg font-bold mb-4">Today's Tasks</h3>
              <div className="space-y-3">
                {todaysTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      className="rounded border-gold-600 bg-black-900 text-gold-600"
                      checked={task.completed}
                      readOnly
                    />
                    <span className={`text-sm ${task.completed ? "text-gold-300 line-through" : "text-gold-100"}`}>
                      {task.subject}
                    </span>
                  </div>
                ))}
                {todaysTasks.length === 0 && (
                  <p className="text-gold-300 text-sm">No tasks due today</p>
                )}
              </div>
              <hr className="hr-gold my-4" />
              <Button 
                onClick={() => setLocation("/tasks")}
                className="btn-gold-ghost w-full"
              >
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddLeadModal 
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
      />
    </main>
  );
}
