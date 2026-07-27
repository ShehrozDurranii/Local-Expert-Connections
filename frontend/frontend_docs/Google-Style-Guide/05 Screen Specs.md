# Screen Specifications

Version: 1.0

---

# Purpose

This document defines every Buyer Portal screen of Local Expert-Connect.

Each screen specification explains:

- Purpose
- Layout
- Components
- API dependencies
- Authentication requirements
- User actions
- Empty states
- Error states
- Responsive behaviour

The OpenAPI specification (`api.yaml`) and backend implementation remain the source of truth for all API contracts.

This document only defines how backend data should be presented to users.

---

# Screen Design Principles

Every screen must answer three questions within five seconds.

1. Where am I?

2. What information am I seeing?

3. What action should I take next?

---

# Global Buyer Layout

Every authenticated Buyer page uses the same layout.

Desktop

+--------------------------------------------------------------+
| Sidebar | Header |
| |----------------------------------------------------|
| | |
| | Main Content |
| | |
| | |
+--------------------------------------------------------------+

Rules

• Sidebar remains visible on desktop.

• Header remains sticky.

• Only the content area scrolls.

• Page width follows the Layout System document.

---

# Screen Template

Every screen specification follows this structure.

Purpose

↓

Authentication

↓

Authorization

↓

Layout

↓

Components

↓

API Dependencies

↓

User Actions

↓

Validation

↓

Loading

↓

Empty State

↓

Error State

↓

Responsive Behaviour

1 Landing Page:
Purpose

Introduce Local Expert-Connect and convert visitors into registered buyers.

Authentication

Public

Layout

Navbar

↓

Hero Section

↓

Search Services

↓

Popular Categories

↓

How It Works

↓

Featured Experts (Future)

↓

Testimonials

↓

Call To Action

↓

Footer

Primary Components

Navbar

Hero

Search Bar

Category Cards

CTA Banner

Footer

Primary Actions

Register

Login

Browse Categories

Responsive

Desktop

Tablet

Mobile

2 Login:
Purpose

Authenticate Buyer.

Authentication

Public

Components

Logo

Welcome Text

Email

Password

Remember Me

Forgot Password

Login Button

Register Link

API

Use the Login endpoint defined in OpenAPI.

JWT

Store returned JWT.

Redirect

Dashboard

Loading

Disable Login Button

Show Spinner

Validation

Email

Password

Display backend validation messages.

3 Register:
Purpose

Create Buyer Account.

Authentication

Public

Components

Registration Form

Terms

Register Button

Login Link

API

Register endpoint

Success

Redirect Login

Validation

Display backend validation.

Never duplicate backend validation logic.

4 Buyer Dashboard:
Purpose

Provide the Buyer with an overview of their activity.

Authentication

JWT Required

Layout

Header

↓

Welcome Banner

↓

Statistics Cards

↓

Recent Requests

↓

Latest Offers

↓

Notifications

Components

Page Header

Statistics Cards

Request Cards

Offer Cards

Notification List

API

Read OpenAPI.

Determine all dashboard endpoints.

Do not invent statistics.

Only display data returned by backend.

Primary Actions

Create Request

View Request

View Offers

View Notifications

Loading

Skeleton Cards

Empty

Friendly dashboard illustration

"Create your first request."

Responsive

Statistics stack vertically on mobile.

5 Request List:
Purpose

Display all Buyer Requests.

Authentication

JWT Required

Layout

Header

↓

Search

↓

Filters

↓

Request List

↓

Pagination

Components

Search Input

Filter Dropdowns

Request Card

Status Badge

Pagination

API

Use Request endpoints from OpenAPI.

Display

Title

Category

Budget

City

Status

Created Date

Primary Actions

View Details

Create Request

Pagination

Use backend pagination if available.

Empty State

"No requests found."

Primary CTA

Create Request

6 Create Request:
Purpose

Create a new Buyer Request.

Authentication

JWT Required

Components

Breadcrumb

↓

Request Form

↓

Submit Button

Fields

Do NOT invent fields.

Read request body directly from OpenAPI.

Validation

Backend remains source of truth.

Display backend validation messages.

Success

Toast

Redirect Request Details or Request List depending on backend behaviour.

7 Request Details:
Purpose

Display one Buyer Request.

Authentication

JWT Required

Components

Request Summary

Description

Budget

Category

Status

Timeline

Offers Section

Actions

API

Read GET Request Details endpoint.

Display every response field.

Do not hide supported fields.

Actions

Determine available actions from backend.

Examples

Cancel Request

Edit Draft

View Offers

Only display actions allowed by backend.

8 Buyer Profile:
Purpose

Manage Buyer profile.

Authentication

JWT Required

Components

Profile Card

Personal Information

Contact Information

Location

Save Button

API

Profile endpoints.

Display backend fields only.

Success

Toast

Validation

Backend validation.

Responsive

Single-column form on mobile.

9 Notification:
Purpose

Display Buyer notifications.

Authentication

JWT Required

Components

Notification List

Unread Badge

Pagination

Loading

Skeleton Notifications

Empty

"No notifications."

Actions

Open Notification

Mark Read (if backend supports)

10 Settings:
Purpose

Manage account settings.

Authentication

JWT Required

Sections

General

Security

Notifications

Privacy

API

Read supported settings endpoints.

Never implement unsupported settings.

UNIVERSAL RULES:
Every screen must include:

✓ Loading State

✓ Empty State

✓ Error State

✓ Responsive Behaviour

✓ API Integration

✓ Authentication Check

✓ Authorization Awareness

✓ Reusable Components

✓ Consistent Layout

✓ Accessibility

Every displayed field must originate from the OpenAPI response.

Every user action must correspond to an implemented backend endpoint.

No placeholder functionality may be implemented.
