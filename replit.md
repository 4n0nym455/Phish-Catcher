# Overview

PhishCatcher is an AI-powered cybersecurity platform designed to detect and analyze phishing threats across multiple attack vectors. The application provides comprehensive security scanning capabilities including email analysis, URL checking, file scanning, and data breach monitoring. Built as a full-stack web application, it offers real-time threat detection with intelligent ML analysis and detailed security reporting for organizations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, using Wouter for client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Build System**: Vite for fast development and optimized production builds
- **Authentication**: Session-based authentication integrated with frontend routing

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration with Passport.js and express-session
- **File Handling**: Multer middleware for secure file uploads with type validation
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Data Storage Solutions
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Session Storage**: Database-backed sessions for scalable authentication
- **File Storage**: In-memory processing for uploaded files with size limits

## Security Features
- **Multi-vector Scanning**: Email content analysis, URL reputation checking, file malware detection
- **Threat Classification**: Risk scoring system with threat levels (safe, low, medium, high, critical)
- **ML Analysis**: Mock machine learning models for phishing detection and content analysis
- **Breach Monitoring**: Email breach checking and historical breach data tracking

## Database Schema Design
- **User Management**: User profiles with role-based access (user/admin)
- **Scan Operations**: Comprehensive scan tracking with results and metadata
- **Threat Intelligence**: Threat detection results with detailed findings
- **Reporting System**: Security report generation and historical analysis
- **Breach Data**: Breach incident tracking linked to user accounts

## API Structure
- **RESTful Design**: Standard HTTP methods with JSON request/response format
- **Authentication Middleware**: Protected routes with session validation
- **File Upload Endpoints**: Secure multipart form handling for file analysis
- **Real-time Processing**: Synchronous scan processing with immediate results
- **Error Handling**: Centralized error middleware with appropriate HTTP status codes

# External Dependencies

- **Database**: PostgreSQL via Neon serverless for cloud-native scaling
- **Authentication Provider**: Replit OAuth for user identity management
- **Development Tools**: Replit-specific plugins for runtime error handling and debugging
- **UI Libraries**: Radix UI primitives for accessible component foundations
- **ML/AI Services**: Placeholder for future integration with threat detection APIs
- **Session Management**: PostgreSQL session store for distributed session handling