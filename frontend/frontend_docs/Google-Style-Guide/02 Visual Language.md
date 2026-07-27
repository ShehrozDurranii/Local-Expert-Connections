# Visual Language

Version: 1.0

---

# Purpose

This document defines the core visual language of Local Expert-Connect.

These rules establish the design tokens that every page, component, and screen must follow.

No custom colors, typography, spacing, or shadows should be introduced unless this guide is updated.

---

# Design Principles

Every interface should communicate:

✓ Trust

✓ Simplicity

✓ Professionalism

✓ Clarity

✓ Accessibility

Visual consistency is more important than visual variety.

---

# Color Philosophy

Color should communicate meaning rather than decoration.

Every color must have a purpose.

Use whitespace as the primary visual separator.

Avoid relying on colors alone to communicate important information.

---

# Primary Color

Purpose

Primary buttons

Navigation highlights

Links

Focused elements

Selected states

Brand identity

Recommended

Blue

HEX

#2563EB

Hover

#1D4ED8

Active

#1E40AF

Text on Primary

White

---

# Secondary Color

Purpose

Supporting actions

Secondary buttons

Background accents

Recommended

Slate

HEX

#64748B

---

# Success

Purpose

Completed actions

Approved requests

Successful API responses

HEX

#16A34A

---

# Warning

Purpose

Pending states

Attention required

Incomplete information

HEX

#F59E0B

---

# Error

Purpose

Validation errors

Failed operations

Danger actions

HEX

#DC2626

---

# Information

Purpose

Helpful information

System messages

Guidance

HEX

#0EA5E9

---

# Background Colors

Primary Background

#FFFFFF

Secondary Background

#F8FAFC

Sidebar

#F1F5F9

Cards

#FFFFFF

Dialogs

#FFFFFF

Inputs

#FFFFFF

---

# Text Colors

Primary

#0F172A

Secondary

#475569

Muted

#64748B

Disabled

#94A3B8

Inverse

#FFFFFF

---

# Border Colors

Default

#E2E8F0

Hover

#CBD5E1

Focused

Primary Blue

Error

Red

---

# Status Mapping

Never invent status colors.

Always map backend values consistently.

Example

Draft

↓

Gray

Submitted

↓

Blue

Offered

↓

Orange

Accepted

↓

Green

Cancelled

↓

Red

Closed

↓

Slate

If backend introduces new statuses, update this guide before implementation.

---

# Typography

Primary Font

Inter

Fallback

system-ui

sans-serif

---

# Font Scale

Display

48px

Hero sections

---

Heading 1

36px

Page Titles

---

Heading 2

30px

Section Titles

---

Heading 3

24px

Cards

---

Heading 4

20px

Subsections

---

Body Large

18px

Important content

---

Body

16px

Default

---

Small

14px

Supporting information

---

Caption

12px

Metadata

---

# Font Weight

Regular

400

Medium

500

Semibold

600

Bold

700

Avoid using extra-bold weights.

---

# Line Height

Headings

120%

Body

150%

Paragraphs should remain readable.

Avoid dense text blocks.

---

# Iconography

Library

Lucide React

---

Default Sizes

16

20

24

32

Never mix icon libraries.

Icons should always accompany meaningful actions.

Avoid decorative icons.

---

# Spacing System

Use an 8-point spacing system.

Available spacing values

4

8

12

16

20

24

32

40

48

64

80

96

Avoid arbitrary spacing values.

---

# Border Radius

Small

6px

Inputs

---

Medium

8px

Buttons

---

Large

12px

Cards

---

Extra Large

16px

Dialogs

---

Pill

999px

Badges

Avatars

---

# Shadows

Level 1

Cards

Subtle elevation

---

Level 2

Dropdowns

Hover cards

---

Level 3

Dialogs

Modals

Use shadows sparingly.

Whitespace is preferred over heavy shadows.

---

# Borders

Default

1px

Primary

Never exceed 2px

Avoid decorative borders.

---

# Motion

Animations should feel fast and subtle.

Duration

150ms

200ms

300ms

Use ease-out transitions.

Avoid excessive animations.

---

# Loading

Preferred

Skeleton Loaders

Acceptable

Spinner

Avoid full-page blocking loaders.

---

# Responsive Breakpoints

Mobile

<640px

Tablet

640–1023px

Desktop

1024px+

Large Desktop

1440px+

Desktop is the primary design target.

---

# Grid System

Container

Max Width

1280px

Columns

12

Gutter

24px

Section Padding

80px

---

# Buttons

Primary

Filled

Blue

---

Secondary

Outlined

---

Ghost

Minimal

---

Danger

Red

---

Success

Green

Buttons should never exceed four variants.

---

# Forms

Every form must include

Label

Placeholder

Helper Text (optional)

Validation Message

Focus State

Disabled State

Required Indicator

Never rely solely on placeholders.

---

# Tables

Tables should support

Sorting

Pagination

Responsive overflow

Status badges

Action column

Avoid overcrowded tables.

---

# Empty States

Every empty state should include

Illustration or Icon

Short Title

Helpful Description

Primary Action

Never display empty tables without guidance.

---

# Error States

Every error message should explain

What happened

Why it happened (if known)

What the user can do next

Avoid technical jargon.

---

# Accessibility

Minimum contrast ratio

WCAG AA

Visible keyboard focus

Required

Icons require accessible labels

Required

Semantic HTML

Required

Never use color as the only indicator.

---

# AI Implementation Notes

Antigravity must use these values as design tokens.

Do not introduce additional colors.

Do not introduce custom spacing scales.

Do not use multiple font families.

Do not use multiple icon libraries.

Do not create inconsistent button styles.

Every screen must inherit these tokens.
