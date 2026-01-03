---
description: Repository Information Overview
alwaysApply: true
---

# E-commerce Platform Information

## Repository Summary
Full-stack e-commerce platform with Qwik frontend and Payload CMS backend. Features product catalog with variants, PWA capabilities, Zitadel authentication, and Matrix real-time chat integration.

## Repository Structure
- **src/**: Qwik frontend application with routes, components, and utilities
- **payload-qwik/**: Next.js-based Payload CMS backend with admin interface
- **public/**: Static assets including PWA manifest and service worker
- **Documentation**: Comprehensive guides for setup, troubleshooting, and deployment

### Main Repository Components
- **Frontend**: Qwik-based progressive web application
- **Backend**: Payload CMS with MongoDB for content management
- **Authentication**: Zitadel OAuth integration
- **Chat System**: Matrix homeserver integration
- **PWA Support**: Service worker and manifest configuration

## Projects

### Frontend (Qwik Application)
**Configuration File**: package.json

#### Language & Runtime
**Language**: TypeScript  
**Runtime Version**: Node.js ^18.17.0 || ^20.3.0 || >=21.0.0  
**Build System**: Vite 7.2.6  
**Package Manager**: pnpm

#### Dependencies
**Main Dependencies**:
- @builder.io/qwik ^1.18.0
- @builder.io/qwik-city ^1.18.0

**Development Dependencies**:
- TypeScript 5.4.5
- Vite 7.2.6 with Qwik optimizer
- ESLint 9.32.0 with Qwik plugin
- Prettier 3.6.2
- Concurrently 9.2.1

#### Build & Installation
```bash
# Install dependencies
pnpm install

# Development (frontend + backend)
pnpm run dev

# Development (frontend only)
pnpm run dev.frontend

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Code formatting
pnpm run fmt

# Linting
pnpm run lint
```

#### Testing
**Framework**: Not configured (no test scripts in frontend)
**Linting**: ESLint with Qwik-specific rules

### Backend (Payload CMS)
**Configuration File**: payload-qwik/package.json

#### Language & Runtime
**Language**: TypeScript  
**Runtime Version**: Node.js ^18.20.2 || >=20.9.0  
**Framework**: Next.js 15.4.10 with Payload CMS 3.69.0  
**Package Manager**: pnpm ^9 || ^10

#### Dependencies
**Main Dependencies**:
- payload 3.69.0
- @payloadcms/next 3.69.0
- @payloadcms/richtext-lexical 3.69.0
- @payloadcms/db-mongodb 3.69.0
- next 15.4.10
- react 19.2.1

**Development Dependencies**:
- @playwright/test 1.56.1
- vitest 3.2.3
- @testing-library/react 16.3.0
- TypeScript 5.7.3

#### Build & Installation
```bash
cd payload-qwik
pnpm install

# Development
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Generate types
pnpm run generate:types
```

#### Docker
**Dockerfile**: payload-qwik/Dockerfile  
**Base Image**: node:22.17.0-alpine  
**Configuration**: Multi-stage build with Next.js standalone output, runs on port 3000

#### Testing
**Framework**: Vitest for unit tests, Playwright for E2E  
**Test Location**: tests/e2e/ for Playwright tests  
**Configuration**: vitest.config.mts, playwright.config.ts  

**Run Commands**:
```bash
# All tests
pnpm run test

# Unit tests
pnpm run test:int

# E2E tests
pnpm run test:e2e
```