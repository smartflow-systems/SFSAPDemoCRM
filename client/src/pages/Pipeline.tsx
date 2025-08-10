import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCRM, useOpportunities, useUpdateOpportunity } from "@/contexts/CRMContext";
import { Opportunity } from "@shared/schema";
import { format } from "date-fns";

// Sortable Card Component
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isWon = opportunity.stage === "Won";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg border cursor-grab active:cursor-grabbing ${
        isWon ? "bg-black-900/70 border-green-600/30" : "bg-black-900/70 border-gold-800/30"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-gold-100 font-medium text-sm">{opportunity.name}</h4>
        <span className={`text-xs font-bold ${isWon ? "text-green-400" : "text-gold"}`}>
          ${(opportunity.amount / 1000).toFixed(0)}K
        </span>
      </div>
      <p className="text-gold-300 text-xs mb-3">{opportunity.description}</p>
      <div className="flex items-center justify-between">
        <span className="badge-gold text-xs">Gareth B.</span>
        <span className={`text-xs ${isWon ? "text-green-400" : "text-gold-300"}`}>
          {isWon ? "Closed" : opportunity.nextActionDate ? 
            `Due: ${format(new Date(opportunity.nextActionDate), 'MMM d')}` : 
            "No due date"
          }
        </span>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useCRM();
  const { data: opportunities = [], isLoading } = useOpportunities();
  const updateOpportunity = useUpdateOpportunity();
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const stages = [
    { id: "New", title: "New", color: "border-gold" },
    { id: "Qualified", title: "Qualified", color: "border-gold" },
    { id: "Proposal", title: "Proposal", color: "border-gold" },
    { id: "Won", title: "Won", color: "border-green-600" },
  ];

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the opportunity being dragged
    const activeOpportunity = opportunities.find(opp => opp.id === activeId);
    if (!activeOpportunity) return;

    // Determine the new stage
    let newStage = activeOpportunity.stage;
    
    // Check if dropped on a stage column
    if (stages.some(stage => stage.id === overId)) {
      newStage = overId;
    } else {
      // Find the stage of the item we dropped on
      const overOpportunity = opportunities.find(opp => opp.id === overId);
      if (overOpportunity) {
        newStage = overOpportunity.stage;
      }
    }

    // Update opportunity stage if it changed
    if (newStage !== activeOpportunity.stage) {
      updateOpportunity.mutate({
        id: activeId,
        data: { stage: newStage }
      });
    }

    setActiveId(null);
  };

  const activeOpportunity = activeId ? opportunities.find(opp => opp.id === activeId) : null;

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-gold-shine text-4xl font-extrabold">Sales Pipeline</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {stages.map((stage) => (
            <Card key={stage.id} className="panel-dark border-gold rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gold font-bold">{stage.title}</h3>
                  <span className="badge-gold skeleton w-8 h-5"></span>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-24 rounded-lg"></div>
                  ))}
                </div>
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
        <h1 className="text-gold-shine text-4xl font-extrabold">Sales Pipeline</h1>
        <div className="flex space-x-3">
          <Button className="btn-gold">
            <Plus className="w-5 h-5 mr-2" />
            Add Opportunity
          </Button>
          <Button className="btn-gold-ghost">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const stageOpportunities = getOpportunitiesByStage(stage.id);
            
            return (
              <Card key={stage.id} className={`panel-dark ${stage.color} rounded-lg kanban-column`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gold font-bold">{stage.title}</h3>
                    <span className="badge-gold">{stageOpportunities.length}</span>
                  </div>
                  
                  <SortableContext
                    items={stageOpportunities.map(opp => opp.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div 
                      className="space-y-3 min-h-[400px]"
                      data-stage={stage.id}
                    >
                      {stageOpportunities.map((opportunity) => (
                        <OpportunityCard
                          key={opportunity.id}
                          opportunity={opportunity}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DragOverlay>
          {activeOpportunity && (
            <OpportunityCard opportunity={activeOpportunity} />
          )}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
