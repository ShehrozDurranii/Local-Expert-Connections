# Local Expert-Connect

# Google Style Guide

**Version:** 1.0  
**Status:** Approved  
**Owner:** FYP Team

---

# Purpose

The Local Expert-Connect Google Style Guide defines the visual language, user experience principles, design standards, component rules, and frontend implementation guidelines for the Buyer Web Application.

Its primary objective is to ensure that every frontend screen follows a single, consistent design system rather than being implemented independently.

This guide serves as the official reference for developers and AI-assisted tools (Antigravity) during frontend development.

---

# Project Overview

Local Expert-Connect is a modern service marketplace that connects buyers with trusted local experts.

The current project scope focuses on the Buyer Portal. The overall system architecture has been designed to support future Expert and Admin portals without requiring major architectural changes.

The application follows an API-first development methodology, where every frontend feature is built on top of verified backend functionality.

---

# Objectives

This guide aims to:

- Establish a consistent visual identity.
- Define reusable UI components.
- Standardize layouts and spacing.
- Improve user experience.
- Prevent inconsistent frontend implementation.
- Ensure complete alignment with backend APIs.
- Reduce AI-generated inconsistencies.
- Support future scalability.

---

# Project Scope

### Current Scope

- Buyer Authentication
- Buyer Dashboard
- Buyer Profile
- Buyer Request Management
- Offers
- Notifications
- Reviews
- Settings

### Future Scope

- Expert Portal
- Administrator Portal
- Real-time Messaging
- Payment Integration
- Recommendation Engine
- Analytics Dashboard

Future features should not influence the current Buyer UI unless explicitly defined in the project requirements.

---

# Development Philosophy

The project follows an API-first architecture.

Frontend implementation begins only after:

1. API contract is finalized.
2. Database schema is verified.
3. Backend implementation is completed.
4. Manual API testing is successful.

The frontend must represent backend capabilities exactly as implemented.

---

# Source of Truth

The following artifacts define the product.

Priority order:

1. OpenAPI Specification (`api.yaml`)
2. SQL Database Schema
3. Express.js Backend Implementation
4. Authentication Middleware
5. Authorization Middleware
6. Software Requirements Specification (SRS)
7. Google Style Guide

Whenever conflicts exist, the higher-priority artifact takes precedence.

No UI should contradict backend behavior.

---

# AI Development Policy

Antigravity must never generate UI based on assumptions.

Before implementing any screen, it must:

- Read the related OpenAPI endpoint(s).
- Understand request parameters.
- Understand response schema.
- Review authentication requirements.
- Review authorization rules.
- Verify related database entities.
- Review backend business logic.
- Reuse existing UI components.
- Follow this style guide.

Any undefined behavior must be flagged rather than invented.

---

# Design Philosophy

The application should communicate:

- Trust
- Professionalism
- Simplicity
- Reliability
- Community
- Accessibility

The interface should feel modern, minimal, and welcoming while remaining efficient for task-oriented workflows.

---

# Design Inspiration

The approved visual inspiration comes from three Wix templates selected for this project.

### Reference 01

Primary inspiration for:

- Landing Page
- Navigation Bar
- Hero Section
- Footer
- Overall whitespace
- Marketing sections

---

### Reference 02

Primary inspiration for:

- Marketplace layout
- Category browsing
- Search experience
- Expert listing
- Card hierarchy

---

### Reference 03

Primary inspiration for:

- Buyer Dashboard
- Sidebar
- Statistics cards
- Tables
- Forms
- Professional SaaS layout

These references define visual direction only.

Exact layouts, branding, or assets must never be copied.

---

# Technology Stack

## Frontend

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Hook Form
- Zod
- Axios

## Backend

- Express.js
- MySQL
- JWT Authentication
- OpenAPI 3.x

---

# Repository Structure

The design guide should remain version-controlled alongside the project.

```
docs/
    Google-Style-Guide/
```

All future design decisions should update this guide.

---

Appendices

- Wix Reference Mapping
- Design Tokens
- Frontend Checklist

---

# Success Criteria

This guide is considered successful when:

- Every Buyer screen follows a consistent design language.
- Every UI component is reusable.
- Every frontend action maps to an implemented backend endpoint.
- Every displayed field originates from the API contract.
- Antigravity can generate professional frontend code without inventing functionality.
- Developers can build new screens while maintaining consistency.

---

# Revision Policy

The Google Style Guide is a living document.

Whenever backend functionality, APIs, business rules, or UI standards evolve, the corresponding sections of this guide must be updated.

Outdated documentation should never remain as the source of truth.
