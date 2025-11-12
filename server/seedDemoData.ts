import { storage } from "./storage";

export async function seedDemoData(userId: string) {
  // Check if data already exists
  const existingAccounts = await storage.getAccounts();
  if (existingAccounts.length > 0) {
    console.log("Demo data already seeded, skipping...");
    return { alreadySeeded: true };
  }

  // Create demo accounts
  const accounts = [
    {
      name: "Peterson & Associates",
      website: "https://peterson-llc.com",
      industry: "Legal Services",
      phone: "(555) 123-4567",
      address: "123 Main St, Business District",
      ownerId: userId,
    },
    {
      name: "Metro Property Group",
      website: "https://metroprop.com",
      industry: "Real Estate",
      phone: "(555) 234-5678",
      address: "456 Commercial Ave, Downtown",
      ownerId: userId,
    },
    {
      name: "Riverside Manufacturing",
      website: "https://riverside-mfg.com",
      industry: "Manufacturing",
      phone: "(555) 345-6789",
      address: "789 Industrial Blvd, Riverside",
      ownerId: userId,
    },
    {
      name: "ABC Heating Solutions",
      website: "https://abcheating.com",
      industry: "HVAC Services",
      phone: "(555) 456-7890",
      address: "321 Service Road, Uptown",
      ownerId: userId,
    },
    {
      name: "Central Shopping Mall",
      website: "https://centralmall.com",
      industry: "Retail/Commercial",
      phone: "(555) 567-8901",
      address: "555 Mall Drive, Central City",
      ownerId: userId,
    },
  ];

  const createdAccounts = [];
  for (const account of accounts) {
    const created = await storage.createAccount(account);
    createdAccounts.push(created);
  }

  // Create demo contacts
  const contacts = [
    {
      firstName: "Michael",
      lastName: "Peterson",
      email: "m.peterson@peterson-llc.com",
      phone: "(555) 123-4567",
      title: "Managing Partner",
      accountId: createdAccounts[0].id,
      ownerId: userId,
    },
    {
      firstName: "Sarah",
      lastName: "Wilson",
      email: "s.wilson@metroprop.com",
      phone: "(555) 234-5678",
      title: "Property Manager",
      accountId: createdAccounts[1].id,
      ownerId: userId,
    },
    {
      firstName: "David",
      lastName: "Chen",
      email: "d.chen@riverside-mfg.com",
      phone: "(555) 345-6789",
      title: "Facilities Director",
      accountId: createdAccounts[2].id,
      ownerId: userId,
    },
  ];

  const createdContacts = [];
  for (const contact of contacts) {
    const created = await storage.createContact(contact);
    createdContacts.push(created);
  }

  // Create demo leads
  const leads = [
    {
      firstName: "Michael",
      lastName: "Peterson",
      email: "m.peterson@peterson-llc.com",
      phone: "(555) 123-4567",
      company: "Peterson & Associates",
      title: "Managing Partner",
      source: "Referral",
      status: "New",
      ownerId: userId,
      notes: "Interested in HVAC maintenance contract for their office building.",
      tags: ["hvac", "commercial", "high-value"],
    },
    {
      firstName: "Sarah",
      lastName: "Wilson",
      email: "s.wilson@metroprop.com",
      phone: "(555) 234-5678",
      company: "Metro Property Group",
      title: "Property Manager",
      source: "Website",
      status: "Qualified",
      ownerId: userId,
      notes: "Managing multiple commercial properties, needs comprehensive facility management.",
      tags: ["facility-management", "multi-property"],
    },
    {
      firstName: "David",
      lastName: "Chen",
      email: "d.chen@riverside-mfg.com",
      phone: "(555) 345-6789",
      company: "Riverside Manufacturing",
      title: "Facilities Director",
      source: "Cold Call",
      status: "Proposal",
      ownerId: userId,
      notes: "Industrial plumbing upgrade needed urgently.",
      tags: ["industrial", "plumbing", "urgent"],
    },
    {
      firstName: "Jennifer",
      lastName: "Martinez",
      email: "j.martinez@techstartup.com",
      phone: "(555) 678-9012",
      company: "Tech Startup Inc",
      title: "Office Manager",
      source: "Website",
      status: "New",
      ownerId: userId,
      notes: "New office space needs complete HVAC installation.",
      tags: ["hvac", "new-construction"],
    },
  ];

  const createdLeads = [];
  for (const lead of leads) {
    const created = await storage.createLead(lead);
    createdLeads.push(created);
  }

  // Create demo opportunities
  const opportunities = [
    {
      name: "Peterson & Associates HVAC Contract",
      accountId: createdAccounts[0].id,
      contactId: createdContacts[0].id,
      leadId: createdLeads[0].id,
      amount: 25000,
      stage: "Qualification",
      probability: 30,
      closeDate: new Date("2025-01-30"),
      ownerId: userId,
      description: "Annual HVAC maintenance contract for office building",
      nextAction: "Send detailed proposal",
      nextActionDate: new Date("2025-01-15"),
    },
    {
      name: "Metro Property Group Facility Management",
      accountId: createdAccounts[1].id,
      contactId: createdContacts[1].id,
      leadId: createdLeads[1].id,
      amount: 85000,
      stage: "Proposal",
      probability: 60,
      closeDate: new Date("2025-02-15"),
      ownerId: userId,
      description: "Comprehensive facility management for 5 commercial properties",
      nextAction: "Schedule site visits",
      nextActionDate: new Date("2025-01-20"),
    },
    {
      name: "Riverside Manufacturing Plumbing Upgrade",
      accountId: createdAccounts[2].id,
      contactId: createdContacts[2].id,
      leadId: createdLeads[2].id,
      amount: 125000,
      stage: "Negotiation",
      probability: 75,
      closeDate: new Date("2025-01-25"),
      ownerId: userId,
      description: "Complete industrial plumbing system upgrade",
      nextAction: "Present final proposal",
      nextActionDate: new Date("2025-01-22"),
    },
    {
      name: "Central Shopping Mall HVAC Overhaul",
      accountId: createdAccounts[4].id,
      contactId: null,
      leadId: null,
      amount: 275000,
      stage: "Proposal",
      probability: 50,
      closeDate: new Date("2025-03-01"),
      ownerId: userId,
      description: "Complete HVAC system replacement for shopping mall",
      nextAction: "Technical review meeting",
      nextActionDate: new Date("2025-01-30"),
    },
    {
      name: "ABC Heating Solutions Partnership",
      accountId: createdAccounts[3].id,
      contactId: null,
      leadId: null,
      amount: 45000,
      stage: "Won",
      probability: 100,
      closeDate: new Date("2024-12-15"),
      ownerId: userId,
      description: "Residential service contract partnership",
      nextAction: "Contract execution",
      nextActionDate: new Date("2025-01-10"),
    },
  ];

  const createdOpportunities = [];
  for (const opportunity of opportunities) {
    const created = await storage.createOpportunity(opportunity);
    createdOpportunities.push(created);
  }

  // Create demo activities
  const activities = [
    {
      type: "Call",
      subject: "Called Peterson & Associates",
      description: "Discussed HVAC maintenance contract renewal. Follow-up needed with detailed proposal.",
      leadId: createdLeads[0].id,
      contactId: createdContacts[0].id,
      opportunityId: createdOpportunities[0].id,
      accountId: createdAccounts[0].id,
      ownerId: userId,
      dueDate: null,
      completed: true,
    },
    {
      type: "Email",
      subject: "Email sent to Riverside Manufacturing",
      description: "Proposal for industrial plumbing upgrade project with technical specifications.",
      leadId: createdLeads[2].id,
      contactId: createdContacts[2].id,
      opportunityId: createdOpportunities[2].id,
      accountId: createdAccounts[2].id,
      ownerId: userId,
      dueDate: null,
      completed: true,
    },
    {
      type: "Note",
      subject: "New lead: Metro Property Group",
      description: "Commercial facility management opportunity for multiple properties. High value potential.",
      leadId: createdLeads[1].id,
      contactId: createdContacts[1].id,
      opportunityId: null,
      accountId: createdAccounts[1].id,
      ownerId: userId,
      dueDate: null,
      completed: true,
    },
    {
      type: "Task",
      subject: "Follow up with ABC Heating",
      description: "Check on contract execution status and next steps.",
      leadId: null,
      contactId: null,
      opportunityId: createdOpportunities[4].id,
      accountId: createdAccounts[3].id,
      ownerId: userId,
      dueDate: new Date("2025-01-12"),
      completed: false,
    },
    {
      type: "Task",
      subject: "Send proposal to Tech Startup",
      description: "Prepare and send detailed HVAC proposal for new office space.",
      leadId: createdLeads[3].id,
      contactId: null,
      opportunityId: null,
      accountId: null,
      ownerId: userId,
      dueDate: new Date("2025-01-14"),
      completed: false,
    },
    {
      type: "Task",
      subject: "Review Peterson contract",
      description: "Review annual maintenance contract terms and pricing.",
      leadId: createdLeads[0].id,
      contactId: createdContacts[0].id,
      opportunityId: createdOpportunities[0].id,
      accountId: createdAccounts[0].id,
      ownerId: userId,
      dueDate: new Date("2025-01-10"),
      completed: true,
    },
  ];

  for (const activity of activities) {
    await storage.createActivity(activity);
  }

  console.log("✓ Demo data seeded successfully");
  return {
    accounts: createdAccounts.length,
    contacts: createdContacts.length,
    leads: createdLeads.length,
    opportunities: createdOpportunities.length,
    activities: activities.length,
  };
}
