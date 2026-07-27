# Layout System

Version: 1.0

---

# Purpose

This document defines the structural layout patterns for Local Expert-Connect.

The objective is to ensure every page follows a predictable structure while maintaining flexibility for future expansion.

Layouts should remain consistent across the application to reduce cognitive load and improve usability.

---

# Layout Philosophy

The application uses two primary layout systems.

1. Public Website
2. Authenticated Buyer Application

These layouts must remain visually distinct.

---

# Public Website Layout

Used for:

- Landing Page
- About
- Contact
- Login
- Register
- Public Expert Profiles (Future)

Structure

+--------------------------------------------------+
| Navbar |
+--------------------------------------------------+

| Hero Section |

---

| Categories |

---

| Featured Experts |

---

| How It Works |

---

| Testimonials |

---

| CTA |

---

| Footer |

Rules

- Full-width sections
- Maximum container width: 1280px
- Large vertical spacing
- Marketing-focused
- Minimal distractions

---

# Authenticated Buyer Layout

Used for:

- Dashboard
- Requests
- Offers
- Notifications
- Profile
- Settings

Structure

+-----------------------------------------------------------+

| Sidebar | Header |

| |--------------------------------------------------|

| | Main Content |

| | |

| | |

+-----------------------------------------------------------+

Rules

- Persistent sidebar on desktop
- Collapsible sidebar on tablet
- Drawer navigation on mobile
- Sticky header
- Scroll only the content area

---

# Landing Page

Structure

Navbar

↓

Hero Section

↓

Search Bar

↓

Popular Categories

↓

Featured Experts

↓

How It Works

↓

Why Choose Us

↓

Testimonials

↓

Call To Action

↓

Footer

Primary Goal

Convert visitors into registered buyers.

---

# Login Page

Structure

Logo

↓

Welcome Message

↓

Login Form

↓

Forgot Password

↓

Register Link

Rules

- Centered card
- Minimal distractions
- Single-column layout
- Responsive

---

# Register Page

Structure

Logo

↓

Registration Form

↓

Terms

↓

Create Account Button

↓

Login Link

Rules

- Step-by-step feeling
- Clear validation
- No unnecessary fields

---

# Buyer Dashboard

Structure

Header

↓

Welcome Banner

↓

Statistics Cards

↓

Quick Actions

↓

Recent Requests

↓

Latest Offers

↓

Notifications

Purpose

Provide a complete overview of buyer activity.

---

# Create Request

Structure

Breadcrumb

↓

Page Title

↓

Request Form

↓

Budget Section

↓

Category

↓

Location

↓

Description

↓

Attachments (if supported)

↓

Submit Button

Rules

- Single-column form
- Logical grouping
- Required fields clearly marked

---

# Request List

Structure

Header

↓

Search

↓

Filters

↓

Request Table / Cards

↓

Pagination

Rules

- Default sort: newest first
- Empty state supported
- Responsive table

---

# Request Details

Structure

Breadcrumb

↓

Request Summary Card

↓

Request Information

↓

Offers Section

↓

Timeline

↓

Actions

Rules

- Highlight current status
- Group related information
- Show only available actions

---

# Offers Page

Structure

Search

↓

Offer Cards

↓

Sorting

↓

Pagination

Each Offer Card

Expert Information

↓

Price

↓

Timeline

↓

Rating

↓

Actions

---

# Notifications

Structure

Header

↓

Notification List

↓

Pagination

Rules

Unread notifications should be visually distinguishable.

---

# Profile

Structure

Profile Header

↓

Personal Information

↓

Contact Details

↓

Location

↓

Save Button

---

# Settings

Structure

Sidebar Navigation

↓

General Settings

↓

Account

↓

Password

↓

Notifications

↓

Privacy

Rules

Each settings section should be independent.

---

# Sidebar Structure

Logo

↓

Dashboard

↓

Requests

↓

Offers

↓

Notifications

↓

Profile

↓

Settings

↓

Logout

Do not include links for features that are not implemented.

---

# Header Structure

Breadcrumb

↓

Page Title

↓

Search (where applicable)

↓

User Menu

Avoid excessive header actions.

---

# Card Layout

Every information card should contain

Header

↓

Body

↓

Optional Footer

Maintain consistent padding.

---

# Form Layout

Every form should follow:

Label

↓

Input

↓

Helper Text

↓

Validation Message

Avoid horizontal forms unless necessary.

---

# Table Layout

Tables should support:

Sorting

Filtering

Pagination

Status Badge

Action Column

Responsive scrolling

---

# Empty States

Every empty page should include:

Icon or Illustration

↓

Title

↓

Short Description

↓

Primary Action

Example

"No Requests Yet"

↓

"Create Your First Request"

---

# Error States

Every error page should include:

Friendly Title

↓

Description

↓

Retry Button

↓

Support Link (future)

---

# Responsive Behaviour

Desktop

Sidebar visible

Tables

Multi-column layouts

---

Tablet

Collapsible sidebar

Reduced spacing

Stack statistics

---

Mobile

Drawer navigation

Cards instead of tables where appropriate

Single-column layouts

Sticky bottom actions for long forms if beneficial

---

# Layout Consistency Rules

Maintain consistent:

Page margins

Section spacing

Card spacing

Header spacing

Sidebar width

Container width

Users should feel they are using one cohesive application.

---

# AI Implementation Notes

Before creating a page:

1. Identify whether it is a Public or Buyer layout.
2. Reuse the appropriate layout component.
3. Do not create custom layouts unless justified.
4. Preserve navigation consistency.
5. Ensure responsiveness before adding page-specific content.
6. Populate layouts only with data supported by the backend APIs.
