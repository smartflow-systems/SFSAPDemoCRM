import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLead, useCRM } from "@/contexts/CRMContext";
import { X } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const { user } = useCRM();
  const createLead = useCreateLead();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    source: "Website",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return;
    }

    try {
      await createLead.mutateAsync({
        ...formData,
        status: "New",
        ownerId: user?.id || "",
        tags: [],
      });
      
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        title: "",
        source: "Website",
        notes: "",
      });
      
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="panel-dark border-gold rounded-lg w-full max-w-md mx-4">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-gold text-xl font-bold">Add New Lead</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gold-300 hover:text-gold-100 p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-gold-300 text-sm font-medium mb-2">
                First Name *
              </Label>
              <Input
                type="text"
                className="input-dark"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label className="block text-gold-300 text-sm font-medium mb-2">
                Last Name *
              </Label>
              <Input
                type="text"
                className="input-dark"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-gold-300 text-sm font-medium mb-2">Company</Label>
            <Input
              type="text"
              className="input-dark"
              placeholder="Company name"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
            />
          </div>
          
          <div>
            <Label className="block text-gold-300 text-sm font-medium mb-2">Email *</Label>
            <Input
              type="email"
              className="input-dark"
              placeholder="email@company.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label className="block text-gold-300 text-sm font-medium mb-2">Phone</Label>
            <Input
              type="tel"
              className="input-dark"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          
          <div>
            <Label className="block text-gold-300 text-sm font-medium mb-2">Title</Label>
            <Input
              type="text"
              className="input-dark"
              placeholder="Job title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          
          <div>
            <Label className="block text-gold-300 text-sm font-medium mb-2">Source</Label>
            <Select value={formData.source} onValueChange={(value) => handleChange("source", value)}>
              <SelectTrigger className="input-dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black-900 border-gold-800/30">
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Cold Call">Cold Call</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-gold-300 text-sm font-medium mb-2">Notes</Label>
            <Textarea
              className="input-dark"
              rows={3}
              placeholder="Additional information..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>
          
          <hr className="hr-gold my-6" />
          
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="btn-gold flex-1"
              disabled={createLead.isPending}
            >
              {createLead.isPending ? "Adding..." : "Add Lead"}
            </Button>
            <Button 
              type="button" 
              onClick={onClose} 
              className="btn-gold-ghost flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
