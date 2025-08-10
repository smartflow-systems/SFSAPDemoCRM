# Overview

Smart Flow Systems CRM is a lightweight, production-ready customer relationship management web application built for home services industry. The application features a dark brown and black theme with shiny metallic gold accents, providing an elegant and professional interface for managing leads, opportunities, accounts, contacts, and customer activities.

The system is designed as a demo-first CRM with pre-loaded realistic data, making it immediately usable for prospects and sales demonstrations. It includes core CRM functionality like Kanban pipeline management, lead tracking, task management, and comprehensive reporting dashboards.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with Vite as the build tool and development server
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API combined with TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom styling using Tailwind CSS
- **Drag & Drop**: @dnd-kit for Kanban board functionality
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design system featuring dark brown/black backgrounds and metallic gold accents

## Backend Architecture
- **Server**: Express.js with TypeScript
- **API Design**: RESTful endpoints under `/api` prefix
- **Data Layer**: In-memory storage with interface-based abstraction for future database integration
- **Development**: Hot module replacement with Vite middleware integration
- **Error Handling**: Centralized error middleware with structured JSON responses

## Data Storage Design
The application uses an in-memory storage system with a well-defined interface (`IStorage`) that abstracts data operations. This design allows for easy migration to persistent storage solutions like PostgreSQL with Drizzle ORM (already configured but not actively used).

**Core Entities**:
- Users (with role-based access control)
- Accounts (companies/organizations)  
- Contacts (individual people within accounts)
- Leads (potential customers)
- Opportunities (qualified deals with sales stages)
- Activities (notes, calls, emails, tasks)

**Data Relationships**:
- Hierarchical structure: Accounts → Contacts → Opportunities
- Lead conversion flow: Leads → Opportunities
- Activity tracking across all entity types

## Authentication & Authorization
- Demo-based authentication with predefined user (Gareth Bowers)
- Role-based access control structure (Admin, Manager, Sales Rep)
- Session management ready for production implementation
- No real authentication barriers in demo mode for immediate access

## Design System
- **Primary Colors**: Dark brown (#4B2E2E), Near-black (#0A0A0A)
- **Accent Colors**: Metallic gold gradient system with multiple shades
- **Typography**: Inter font family for modern, readable interface
- **Component Styling**: CSS custom properties with Tailwind utility classes
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts

## Performance Optimizations
- **Code Splitting**: Vite handles automatic code splitting
- **Query Optimization**: TanStack Query for efficient data fetching and caching
- **Bundle Optimization**: ESBuild for production builds
- **Development Speed**: Hot module replacement and fast refresh

## Demo Data Strategy
The application includes comprehensive seed data covering:
- 30+ demo accounts across various industries
- 60+ leads with realistic source attribution
- 25+ opportunities across sales pipeline stages  
- 120+ activities with timestamps and due dates
- Realistic business scenarios and data relationships

# External Dependencies

## Core Framework Dependencies
- **React 18**: Modern React with concurrent features
- **Vite**: Fast development server and build tool
- **Express.js**: Node.js web framework for API server
- **TypeScript**: Static type checking across full stack

## UI and Styling
- **Radix UI**: Accessible primitive components (@radix-ui/*)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **@dnd-kit**: Drag and drop functionality

## State Management & Data Fetching  
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation and schema definition

## Database & ORM (Configured but Not Active)
- **Drizzle ORM**: TypeScript ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **PostgreSQL**: Relational database (configured via DATABASE_URL)

## Development Tools
- **TSX**: TypeScript execution for development
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Autoprefixer

## Utility Libraries
- **date-fns**: Modern date manipulation library
- **clsx & tailwind-merge**: Conditional CSS class management
- **nanoid**: URL-safe unique ID generation
- **class-variance-authority**: Component variant management

The architecture is designed for easy deployment to platforms like Replit, with environment-based configuration and a single-command startup process.