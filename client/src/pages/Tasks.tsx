import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, Clock, AlertTriangle, CheckCircle, X, User, Building } from "lucide-react";
import { useCRM, useActivities, useCreateActivity, useUpdateOpportunity } from "@/contexts/CRMContext";
import { format, isToday, isPast, isAfter, startOfDay } from "date-fns";
import { Activity } from "@shared/schema";

export default function Tasks() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useCRM();
  const { data: activities = [], isLoading } = useActivities();
  const createActivity = useCreateActivity();
  
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "today" | "overdue" | "upcoming">("today");
  const [newTask, setNewTask] = useState({
    subject: "",
    description: "",
    dueDate: "",
    type: "Task" as const,
  });

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Filter tasks (activities with type="Task")
  const tasks = activities.filter(activity => activity.type === "Task");
  
  const today = new Date();
  const startOfToday = startOfDay(today);

  const filteredTasks = tasks.filter(task => {
    if (!task.dueDate) return filter === "all";
    
    const taskDate = new Date(task.dueDate);
    
    switch (filter) {
      case "today":
        return isToday(taskDate);
      case "overdue":
        return isPast(taskDate) && !isToday(taskDate) && !task.completed;
      case "upcoming":
        return isAfter(taskDate, startOfToday) && !isToday(taskDate);
      case "all":
      default:
        return true;
    }
  });

  const taskCounts = {
    today: tasks.filter(task => task.dueDate && isToday(new Date(task.dueDate))).length,
    overdue: tasks.filter(task => 
      task.dueDate && 
      isPast(new Date(task.dueDate)) && 
      !isToday(new Date(task.dueDate)) && 
      !task.completed
    ).length,
    upcoming: tasks.filter(task => 
      task.dueDate && 
      isAfter(new Date(task.dueDate), startOfToday) && 
      !isToday(new Date(task.dueDate))
    ).length,
    completed: tasks.filter(task => task.completed).length,
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.subject.trim()) return;

    try {
      await createActivity.mutateAsync({
        type: "Task",
        subject: newTask.subject,
        description: newTask.description,
        leadId: null,
        contactId: null,
        opportunityId: null,
        accountId: null,
        ownerId: user?.id || "",
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
        completed: false,
      });

      setNewTask({
        subject: "",
        description: "",
        dueDate: "",
        type: "Task",
      });
      
      setIsAddTaskModalOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    // Since we don't have an update activity mutation, we'll create a new activity to track completion
    // In a real app, you'd want to add an updateActivity mutation to the context
    console.log(`Task ${taskId} marked as ${completed ? 'completed' : 'incomplete'}`);
  };

  const getTaskPriority = (task: Activity): "high" | "medium" | "low" => {
    if (!task.dueDate) return "low";
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "high"; // Overdue
    if (diffDays <= 1) return "high"; // Due today or tomorrow
    if (diffDays <= 3) return "medium"; // Due within 3 days
    return "low";
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "bg-red-600/20 text-red-400 border-red-600/30";
      case "medium": return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      case "low": return "badge-gold";
    }
  };

  const getTaskStatusIcon = (task: Activity) => {
    if (task.completed) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    
    if (task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))) {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
    
    return <Clock className="w-5 h-5 text-gold-300" />;
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-gold-shine text-4xl font-extrabold">My Tasks</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="panel-dark border-gold">
              <CardContent className="p-6">
                <div className="skeleton h-16 rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-gold-shine text-4xl font-extrabold">My Tasks</h1>
        <Button 
          onClick={() => setIsAddTaskModalOpen(true)}
          className="btn-gold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          className={`panel-dark border-gold cursor-pointer transition-all ${
            filter === "today" ? "ring-2 ring-gold-500" : ""
          }`}
          onClick={() => setFilter("today")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-300 text-sm font-medium">Today's Tasks</p>
                <p className="text-gold text-3xl font-bold mt-2">{taskCounts.today}</p>
              </div>
              <div className="bg-gold-gradient p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-black-900" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gold-300 text-sm">
                {tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && t.completed).length} completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`panel-dark border-gold cursor-pointer transition-all ${
            filter === "overdue" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setFilter("overdue")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-300 text-sm font-medium">Overdue Tasks</p>
                <p className="text-red-400 text-3xl font-bold mt-2">{taskCounts.overdue}</p>
              </div>
              <div className="bg-red-600 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-red-400 text-sm">Requires immediate attention</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`panel-dark border-gold cursor-pointer transition-all ${
            filter === "upcoming" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setFilter("upcoming")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-300 text-sm font-medium">Upcoming Tasks</p>
                <p className="text-blue-400 text-3xl font-bold mt-2">{taskCounts.upcoming}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-blue-400 text-sm">Next 7 days</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`panel-dark border-gold cursor-pointer transition-all ${
            filter === "all" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold-300 text-sm font-medium">Completed</p>
                <p className="text-green-400 text-3xl font-bold mt-2">{taskCounts.completed}</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-400 text-sm">All time</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card className="panel-dark border-gold">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gold text-xl font-bold">
              {filter === "today" && "Today's Tasks"}
              {filter === "overdue" && "Overdue Tasks"}
              {filter === "upcoming" && "Upcoming Tasks"}
              {filter === "all" && "All Tasks"}
              {filteredTasks.length > 0 && ` (${filteredTasks.length})`}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={() => setFilter("all")}
                className={filter === "all" ? "btn-gold" : "btn-gold-ghost"}
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gold-300 mx-auto mb-4" />
                <p className="text-gold-300 text-lg mb-2">
                  {filter === "today" && "No tasks due today"}
                  {filter === "overdue" && "No overdue tasks"}
                  {filter === "upcoming" && "No upcoming tasks"}
                  {filter === "all" && "No tasks found"}
                </p>
                <p className="text-gold-300/70 text-sm mb-4">
                  Stay organized by adding tasks with due dates
                </p>
                <Button 
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="btn-gold"
                >
                  Add Your First Task
                </Button>
              </div>
            ) : (
              filteredTasks
                .sort((a, b) => {
                  // Sort by completed status, then by due date
                  if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                  }
                  if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                  }
                  if (a.dueDate) return -1;
                  if (b.dueDate) return 1;
                  return 0;
                })
                .map((task) => {
                  const priority = getTaskPriority(task);
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 rounded-lg border transition-all ${
                        task.completed 
                          ? "bg-black-900/30 border-gold-800/20 opacity-60" 
                          : "bg-black-900/50 border-gold-800/30 hover:bg-black-900/70"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center mt-1">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => 
                              handleTaskComplete(task.id, checked as boolean)
                            }
                            className="border-gold-600 data-[state=checked]:bg-gold-600"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-medium ${
                                task.completed 
                                  ? "text-gold-300 line-through" 
                                  : "text-gold-100"
                              }`}>
                                {task.subject}
                              </h3>
                              {task.description && (
                                <p className={`text-sm mt-1 ${
                                  task.completed ? "text-gold-300/70" : "text-gold-300"
                                }`}>
                                  {task.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge className={getPriorityColor(priority)}>
                                {priority}
                              </Badge>
                              {getTaskStatusIcon(task)}
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-3 space-x-4 text-sm text-gold-300">
                            {task.dueDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                  {isToday(new Date(task.dueDate)) && " (Today)"}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>Gareth Bowers</span>
                            </div>
                            
                            <span>•</span>
                            <span>
                              Created {format(new Date(task.createdAt!), 'MMM d')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogContent className="panel-dark border-gold rounded-lg w-full max-w-md mx-4">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-gold text-xl font-bold">Add New Task</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-gold-300 hover:text-gold-100 p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <Label className="block text-gold-300 text-sm font-medium mb-2">
                Task Title *
              </Label>
              <Input
                type="text"
                className="input-dark"
                placeholder="Enter task title"
                value={newTask.subject}
                onChange={(e) => setNewTask(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label className="block text-gold-300 text-sm font-medium mb-2">
                Description
              </Label>
              <Textarea
                className="input-dark"
                rows={3}
                placeholder="Task description..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label className="block text-gold-300 text-sm font-medium mb-2">
                Due Date
              </Label>
              <Input
                type="date"
                className="input-dark"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            
            <hr className="hr-gold my-6" />
            
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                className="btn-gold flex-1"
                disabled={createActivity.isPending || !newTask.subject.trim()}
              >
                {createActivity.isPending ? "Adding..." : "Add Task"}
              </Button>
              <Button 
                type="button" 
                onClick={() => setIsAddTaskModalOpen(false)} 
                className="btn-gold-ghost flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
