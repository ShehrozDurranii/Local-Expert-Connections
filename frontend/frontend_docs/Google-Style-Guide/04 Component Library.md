# Component Library

Version: 1.0

---

# Purpose

This document defines every reusable UI component used throughout the Local Expert-Connect Buyer Application.

The objective is to ensure consistency, maintainability, accessibility, and maximum component reuse.

A component should be created once and reused everywhere.

---

# Component Philosophy

The application follows a component-driven architecture.

Pages should never implement UI directly.

Pages should compose reusable components.

Hierarchy

Page

↓

Section

↓

Component

↓

Primitive

Example

Dashboard

↓

Recent Requests Section

↓

Request Card

↓

Button

Badge

Avatar

---

# Component Creation Rules

Before creating a new component:

1. Search existing components.

2. If an existing component satisfies the requirement,

Reuse it.

3. If no reusable solution exists,

Create a new reusable component.

4. Never create page-specific components unless absolutely necessary.

---

# Component Categories

Foundation

Forms

Navigation

Marketplace

Data Display

Feedback

Layouts

Utilities

---

# Foundation Components

These are the smallest reusable UI elements.

---

## Button

Purpose

Primary user actions.

Variants

Primary

Secondary

Outline

Ghost

Danger

Success

Sizes

Small

Medium

Large

States

Default

Hover

Focused

Pressed

Loading

Disabled

Rules

One primary button per section.

Avoid multiple competing primary actions.

---

## Icon Button

Purpose

Compact actions.

Examples

Search

Edit

Delete

Filter

Share

Rules

Always include an accessible label.

---

## Badge

Purpose

Display short metadata.

Examples

Status

Category

City

Verified

Budget Type

Rules

Badges are informational.

Never use badges as buttons.

---

## Avatar

Purpose

Display user identity.

Fallback

Initials

Future

Profile Image

---

## Divider

Purpose

Separate related content.

Use whitespace first.

---

# Form Components

---

## Text Input

Supports

Placeholder

Helper Text

Validation

Disabled

Required

Focus

Never rely on placeholder as label.

---

## Textarea

Purpose

Descriptions

Service Details

Requirements

Auto-resize preferred.

---

## Select

Purpose

Categories

Cities

Sorting

Status

---

## Search Input

Purpose

Search requests

Search experts

Search offers

Always include search icon.

---

## Checkbox

Purpose

Multiple selection.

---

## Radio Group

Purpose

Single selection.

---

## Toggle Switch

Purpose

Enable

Disable

Settings

---

## File Upload

Purpose

Future attachment support.

---

# Navigation Components

---

## Navbar

Contains

Logo

Navigation

Authentication Buttons

---

## Sidebar

Contains

Dashboard

Requests

Offers

Notifications

Profile

Settings

Logout

Never include unsupported pages.

---

## Breadcrumb

Purpose

Navigation context.

Example

Dashboard

>

Requests

>

Request Details

---

## Pagination

Supports

Previous

Next

Page Numbers

Current Page

---

# Marketplace Components

These components are unique to Local Expert-Connect.

---

## Category Card

Displays

Category Name

Icon

Service Count (Future)

Action

Browse

---

## Request Card

Displays

Request Title

Category

Budget

Location

Status

Created Date

Primary Action

View Details

Never display unsupported actions.

---

## Offer Card

Displays

Expert

Price

Timeline

Rating

Status

Primary Action

View Offer

Future

Accept Offer

Reject Offer

Only display actions supported by backend.

---

## Expert Card

Displays

Expert Name

Profession

Rating

City

Verification

CTA

View Profile

---

## Review Card

Displays

Reviewer

Rating

Review

Date

---

## Statistics Card

Displays

Metric

Value

Trend (Future)

Icon

Examples

Total Requests

Pending Requests

Offers Received

Completed Services

---

# Data Display Components

---

## Table

Supports

Sorting

Filtering

Pagination

Responsive scrolling

Status badges

Action column

---

## Empty State

Contains

Illustration

Title

Description

Primary Action

Example

"No Requests Found"

↓

"Create Request"

---

## Timeline

Purpose

Display request progress.

Future

Offer progress

Service progress

---

## Status Badge

Maps backend enums to consistent UI.

Never invent status values.

Always follow backend enums.

---

# Feedback Components

---

## Toast

Types

Success

Warning

Error

Information

Placement

Top Right

Duration

3–5 seconds

---

## Alert

Purpose

Important messages.

---

## Confirmation Dialog

Used before

Delete

Cancel

Logout

Dangerous actions

---

## Skeleton Loader

Preferred over loading spinner.

Must match the shape of the content being loaded.

---

## Error Message

Must include

Problem

Possible Cause

Recovery Action

---

# Layout Components

---

## Page Header

Contains

Title

Breadcrumb

Primary Action

---

## Section

Contains

Heading

Description (optional)

Content

---

## Card Container

Used across

Dashboard

Profile

Settings

Forms

Maintain consistent padding.

---

# Utilities

Loading Indicator

Status Dot

Separator

Tooltip

Copy Button (Future)

---

# Component Naming Convention

PascalCase

Examples

Button

RequestCard

OfferCard

CategoryCard

StatisticsCard

ProfileHeader

SettingsSection

Never abbreviate component names.

---

# Folder Structure

components/

foundation/

forms/

navigation/

marketplace/

feedback/

layouts/

shared/

Each component should have a single responsibility.

---

# Accessibility

Every component must support

Keyboard navigation

Focus states

ARIA labels where required

Sufficient contrast

Semantic HTML

---

# Performance

Prefer server components where applicable.

Client Components only when interaction is required.

Avoid unnecessary re-renders.

Lazy load heavy components.

---

# Component Reuse Rules

Never duplicate components.

Never create two buttons with identical functionality.

Never create multiple card layouts for the same data.

Prefer composition over duplication.

---

# AI Implementation Notes

Before creating any component:

✓ Search the existing component library.

✓ Confirm no reusable component already exists.

✓ Follow the design tokens.

✓ Follow accessibility rules.

✓ Follow naming conventions.

✓ Keep components small and reusable.

Pages should compose components.

Components should never compose pages.
