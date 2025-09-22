# Overview

This is a full-stack sales dashboard application for analyzing Blinkit sales data. The application allows users to upload CSV files containing sales records and provides comprehensive analytics through interactive charts, data tables, and key performance metrics. The system is built as a single-page application with a clean, modern interface using React and Express.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts library for data visualization components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **File Processing**: Multer middleware for CSV file uploads with memory storage
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Validation**: Zod schemas for request/response validation

## Data Storage Design
- **Schema**: Drizzle ORM with PostgreSQL schema definitions
- **Current Implementation**: Memory-based storage for development
- **Database Ready**: Configured for PostgreSQL with Neon Database integration
- **Data Model**: Sales records with item details, manufacturer info, location data, and transaction metrics

## Development Infrastructure
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development Server**: Integrated Vite dev server with Express API proxy
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Hot Reload**: Full-stack hot module replacement in development

## Key Features
- **CSV Upload**: Drag-and-drop interface with file validation and parsing
- **Analytics Dashboard**: Real-time metrics including revenue, quantity sold, and top performers
- **Interactive Charts**: Multiple chart types (bar, line, area, pie) with dynamic data
- **Data Table**: Sortable, searchable, paginated table with advanced filtering
- **Responsive Design**: Mobile-first design with collapsible sidebar navigation

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connection**: Uses DATABASE_URL environment variable for database connectivity

## UI and Styling
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Modern icon library for consistent iconography
- **Recharts**: React charting library built on D3

## Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **TypeScript**: Full-stack type safety with shared schemas
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## File Processing
- **Multer**: Multipart form data handling for CSV uploads
- **CSV Parsing**: Custom parser with validation and error handling
- **File Validation**: MIME type checking and size limits for security