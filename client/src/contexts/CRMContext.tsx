import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Lead, Opportunity, Activity, Account, Contact } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CRMContextType {
  user: { id: string; fullName: string; email: string } | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Demo user login
  const login = () => {
    const demoUser = {
      id: "demo-user-gareth",
      fullName: "Gareth Bowers",
      email: "gareth.bowers@smartflowsystems.com"
    };
    setUser(demoUser);
    localStorage.setItem("crm-user", JSON.stringify(demoUser));
    
    // Initialize demo data
    initDemoData();
    
    toast({
      title: "Welcome to Smart Flow Systems CRM",
      description: "Signed in as Gareth Bowers",
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm-user");
    queryClient.clear();
  };

  // Initialize demo data
  const initDemoData = async () => {
    try {
      await apiRequest("POST", "/api/init-demo", {});
    } catch (error) {
      console.error("Failed to initialize demo data:", error);
    }
  };

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem("crm-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}

// Custom hooks for CRM data
export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: true,
  });
}

export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ["/api/leads", id],
    enabled: !!id,
  });
}

export function useOpportunities() {
  return useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
    enabled: true,
  });
}

export function useActivities() {
  return useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: true,
  });
}

export function useLeadActivities(leadId: string) {
  return useQuery<Activity[]>({
    queryKey: ["/api/activities/lead", leadId],
    enabled: !!leadId,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: Omit<Lead, "id" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/leads", lead);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead Created",
        description: "New lead has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Opportunity> }) => {
      const response = await apiRequest("PATCH", `/api/opportunities/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Opportunity Updated",
        description: "Opportunity has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update opportunity.",
        variant: "destructive",
      });
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (activity: Omit<Activity, "id" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/activities", activity);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Activity Added",
        description: "Activity has been logged successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create activity.",
        variant: "destructive",
      });
    },
  });
}
