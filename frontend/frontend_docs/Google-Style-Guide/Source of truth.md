# Source of Truth

Version: 1.0

---

# Purpose

This document defines the mandatory workflow that must be followed before implementing any frontend feature for Local Expert-Connect.

The objective is to ensure every screen, component, interaction, and API integration is based entirely on verified project artifacts rather than assumptions.

This document is the highest-priority development guideline for AI-assisted frontend generation.

---

# Core Principle

The frontend must represent the backend exactly as implemented.

No feature, field, workflow, permission, or UI interaction may be invented.

Every implementation decision must be traceable to one or more approved project artifacts.

---

# Source Priority

Whenever multiple sources exist, they must be consulted in the following order.

Priority 1

OpenAPI Specification (`api.yaml`)

Defines:

- Available endpoints
- HTTP methods
- Request parameters
- Request body
- Response schema
- Authentication requirements
- Status codes
- Business actions

Never create an API request that is not defined in the OpenAPI specification.

---

Priority 2

SQL Database Schema

Defines:

- Tables
- Relationships
- Primary Keys
- Foreign Keys
- Enumerations
- Constraints

The frontend should understand data relationships but must never bypass backend validation.

---

Priority 3

Backend Implementation

The backend is the implementation of the API contract.

Before implementing a screen:

- Read the Router.
- Read the Controller.
- Read the Service.
- Understand business logic.
- Understand validation rules.
- Understand database operations.

The frontend must match backend behaviour.

---

Priority 4

Authentication Middleware

Before implementing protected pages, determine:

- Which endpoints require authentication.
- Which endpoints are public.
- Which JWT claims are expected.
- Whether a token must be included.

Never assume authentication behaviour.

---

Priority 5

Authorization Middleware

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to do?

Before implementing UI actions:

Verify:

- Buyer permissions
- Expert permissions
- Admin permissions
- Ownership rules
- Restricted actions

Never display actions the current user is not authorized to perform.

---

Priority 6

Software Requirements Specification (SRS)

The SRS explains the business purpose of the feature.

When business behaviour is unclear:

Review the SRS before making implementation decisions.

---

Priority 7

Google Style Guide

The style guide defines:

- Layout
- Components
- Colors
- Typography
- Responsive behaviour
- UX patterns

The style guide must never override backend functionality.

---

# Mandatory Development Workflow

Every frontend feature must follow this sequence.

Step 1

Identify the screen to implement.

↓

Step 2

Locate the related endpoint(s) in the OpenAPI specification.

↓

Step 3

Understand:

- Request body
- Parameters
- Responses
- Status codes
- Security requirements

↓

Step 4

Locate the related SQL tables.

Understand:

- Relationships
- Constraints
- Enumerations

↓

Step 5

Read backend implementation.

Review:

- Router
- Controller
- Service
- Middleware

↓

Step 6

Determine:

- Authentication required?
- Authorization required?
- Business rules?
- Validation?

↓

Step 7

Review existing reusable components.

Never duplicate components.

↓

Step 8

Follow the Google Style Guide.

↓

Step 9

Generate the screen.

↓

Step 10

Connect APIs.

↓

Step 11

Verify:

- Loading state
- Success state
- Empty state
- Validation errors
- Server errors
- Unauthorized state
- Forbidden state

↓

Done.

---

# Rules for API Integration

Always use the OpenAPI specification as the API contract.

Never:

- Invent endpoints.
- Invent parameters.
- Invent request bodies.
- Invent response fields.
- Ignore nullable fields.
- Ignore enums.
- Ignore validation.

If an API does not exist, the corresponding UI feature must not be implemented.

---

# Rules for UI Components

Before creating a new component:

Check whether an existing reusable component already satisfies the requirement.

If yes:

Reuse it.

If no:

Create a reusable component instead of a page-specific component.

Duplicate components are not allowed.

---

# Rules for Forms

Every form field must originate from one of the following:

- OpenAPI request body
- Query parameters
- Path parameters

Never create additional fields.

Never rename backend fields without documented mapping.

---

# Rules for Data Display

Every displayed field must originate from:

- API Response
- Derived UI state

Never display placeholder business data in production components.

---

# Rules for Authentication

Protected pages must:

- Verify JWT existence.
- Redirect unauthenticated users.
- Handle expired sessions.
- Display proper error feedback.

Never expose protected screens without verification.

---

# Rules for Authorization

UI actions must reflect backend permissions.

Examples:

Hide:

- Edit
- Delete
- Cancel
- Accept
- Reject

when the backend would deny those actions.

The frontend must never encourage actions that the backend cannot perform.

---

# Rules for Business Logic

Business logic belongs in the backend.

The frontend is responsible for:

- Presentation
- User interaction
- Input validation
- API communication

Never duplicate backend business rules unless required for user experience.

---

# Rules for Navigation

Navigation should only expose implemented features.

Do not add:

- Placeholder pages
- Dead links
- Unsupported menu items

Every navigation item should correspond to an implemented feature.

---

# Rules for Error Handling

Every API request must handle:

- Loading
- Success
- Validation Error
- Unauthorized
- Forbidden
- Not Found
- Server Error
- Network Failure

Error handling must be consistent across the application.

---

# Rules for Antigravity

Before generating code, Antigravity must confirm:

✓ Related OpenAPI endpoint reviewed.

✓ Related SQL tables understood.

✓ Backend logic reviewed.

✓ Authentication requirements understood.

✓ Authorization rules understood.

✓ Existing reusable components checked.

✓ Design tokens applied.

✓ Responsive behaviour considered.

✓ API integration planned.

Only after all checks are complete should code generation begin.

---

# Stop Conditions

Antigravity must stop and request clarification if:

- An endpoint is missing.
- A response schema is unclear.
- A required permission is undefined.
- A business rule is ambiguous.
- The backend implementation contradicts the OpenAPI specification.

The AI must never guess.

---

# Final Principle

Every frontend element should be explainable by answering the following question:

"Which backend artifact justifies this implementation?"

If no valid answer exists, the implementation should not proceed.
