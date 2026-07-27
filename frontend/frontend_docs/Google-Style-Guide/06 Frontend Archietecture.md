# Frontend Architecture

Version: 1.0

---

# Purpose

This document defines the architecture of the Local Expert-Connect Buyer Web Application.

Its objective is to ensure that every developer and AI-assisted tool follows a consistent project structure, naming convention, state management strategy, and code organization.

The frontend should be scalable, maintainable, and easy to extend as new Buyer, Expert, and Admin features are added.

---

# Technology Stack

Framework

- Next.js (App Router)

Language

- JavaScript

Styling

- Tailwind CSS

UI Library

- shadcn/ui

Icons

- Lucide React

Forms

- React Hook Form

Validation

- Zod

HTTP Client

- Axios

Notifications

- Sonner (or approved alternative)

Authentication

- JWT

Backend

- Express.js REST API

---

# Project Structure

frontend/

├── app/
│
├── components/
│
├── services/
│
├── hooks/
│
├── lib/
│
├── types/
│
├── utils/
│
├── constants/
│
├── styles/
│
├── public/
│
└── docs/

Every folder has a single responsibility.

---

# App Directory

The App Router is responsible for routing only.

Do not place reusable business logic inside page files.

Example

app/

login/

register/

dashboard/

requests/

create/

[id]/

offers/

profile/

settings/

loading.js

error.js

layout.js

page.js

---

# Components Directory

Components must be reusable.

Organize by domain.

components/

foundation/

forms/

navigation/

marketplace/

feedback/

layouts/

shared/

examples

Button

Input

Navbar

Sidebar

RequestCard

OfferCard

StatisticsCard

CategoryCard

ProfileCard

NotificationItem

---

# Services

The services folder is responsible for backend communication.

services/

api.js

auth.service.js

request.service.js

offer.service.js

profile.service.js

notification.service.js

category.service.js

Each service communicates with one backend module.

Never call Axios directly inside page components.

---

# Hooks

Reusable React hooks belong here.

hooks/

useAuth.js

useRequests.js

useProfile.js

useNotifications.js

usePagination.js

useDebounce.js

Hooks should contain reusable client-side logic.

---

# Lib

Contains framework configuration.

Examples

axios instance

token helpers

date formatting

constants

Do not place UI logic here.

---

# Utils

Utility functions.

Examples

currency formatter

date formatter

string helpers

status mapping

Utilities should remain pure.

---

# Constants

Contains static application constants.

Examples

Routes

Role Names

Status Colors

Sidebar Navigation

Never duplicate constants across files.

---

# Types

Reserved for future TypeScript migration.

May temporarily contain:

API response documentation

Shared object structures

Enum references

---

# Styles

Global styles only.

Do not create page-specific CSS.

Use Tailwind utilities whenever possible.

---

# Public

Contains

logos

icons

illustrations

images

Do not store user-uploaded files.

---

# Layout Hierarchy

Root Layout

↓

Public Layout

↓

Buyer Layout

↓

Screen

↓

Section

↓

Component

↓

Primitive

---

# Component Hierarchy

Pages should assemble Sections.

Sections assemble Components.

Components assemble Foundation Components.

Example

Dashboard

↓

Recent Requests Section

↓

Request Card

↓

Badge

↓

Button

Never skip hierarchy.

---

# Server Components

Default to Server Components.

Use Client Components only when interaction is required.

Examples requiring Client Components

Forms

Dropdowns

Dialogs

Search

Filters

Pagination

Interactive tables

Everything else should remain Server Components when possible.

---

# State Management

Prefer local component state.

Use React Context only for:

Authentication

Theme (future)

Avoid global state libraries unless justified.

---

# API Strategy

Every backend module has its own service.

Example

request.service.js

Contains

getRequests()

getRequest()

createRequest()

cancelRequest()

Do not mix unrelated endpoints.

---

# Authentication

JWT is managed centrally.

Login Flow

Login

↓

Receive JWT

↓

Store securely

↓

Attach Authorization header

↓

Access protected routes

↓

Logout

↓

Remove JWT

↓

Redirect Login

Protected pages must verify authentication before rendering.

---

# Authorization

Frontend should reflect backend permissions.

Do not render actions that the authenticated Buyer is not allowed to perform.

Backend remains the final authority.

---

# Error Handling

Every screen must support

Loading

Empty

Error

Unauthorized

Forbidden

Network Error

Never leave users without feedback.

---

# Naming Conventions

Components

PascalCase

RequestCard

ProfileCard

OfferCard

Hooks

camelCase

useRequests

useProfile

Utilities

camelCase

formatCurrency

formatDate

Routes

lowercase

/dashboard

/profile

/settings

---

# File Naming

Use descriptive names.

Good

request.service.js

buyer-sidebar.jsx

statistics-card.jsx

Bad

service.js

card.jsx

helper.js

---

# Imports

Prefer absolute imports when configured.

Avoid deep relative imports.

Good

@/components/forms/Input

Bad

../../../../components/forms/Input

---

# Reusability Rules

Never duplicate components.

Never duplicate API calls.

Never duplicate validation logic.

Always extract reusable code.

---

# Forms

Every form should use

React Hook Form

-

Zod

Backend validation messages should always be displayed when available.

---

# API Responses

Frontend should never assume response structure.

Always follow the OpenAPI specification.

Gracefully handle

null

empty arrays

optional fields

---

# Performance

Lazy load large components.

Optimize images.

Avoid unnecessary client components.

Avoid duplicate API requests.

Prefer reusable server-rendered layouts.

---

# Accessibility

Every interactive element must be keyboard accessible.

Provide

Labels

Focus states

ARIA attributes where required

Maintain WCAG AA contrast.

---

# Responsive Design

Desktop First

↓

Tablet

↓

Mobile

No functionality should disappear because of screen size.

Only layouts should adapt.

---

# Code Quality

Follow ESLint.

Follow Prettier.

Use Husky pre-commit hooks.

Never bypass linting.

Small focused commits are preferred.

---

# AI Development Workflow

For every new feature, Antigravity must follow this sequence:

1. Read the related OpenAPI specification.
2. Review the related backend implementation.
3. Identify required authentication and authorization.
4. Check the Google Style Guide.
5. Reuse existing layouts.
6. Reuse existing components.
7. Create new components only if necessary.
8. Connect to backend services.
9. Handle loading, empty, success, and error states.
10. Ensure responsive behaviour.
11. Ensure accessibility.
12. Run linting and formatting before completion.

---

# Definition of Done

A frontend feature is considered complete only when:

✓ Matches the OpenAPI specification.

✓ Uses existing architecture.

✓ Reuses components.

✓ Passes ESLint and Prettier.

✓ Is responsive.

✓ Is accessible.

✓ Handles all API states.

✓ Uses authenticated requests where required.

✓ Displays backend data correctly.

✓ Contains no placeholder functionality.

The frontend must always remain a faithful representation of the implemented backend.
