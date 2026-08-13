# Design Specification: Premium Editorial & Literary System

## 1. Design Direction & Vibe
Inspired by boutique literary publishers (Stripe Press, Faber & Faber, Penguin Modern Classics) and high-end digital reading applications (Apple Books, ReadCV). Warm cream parchment, bespoke serif display headlines, tactile book shadows, and reading-first hierarchy.

## 2. Color Palette & Token Hierarchy

### Light Theme (Default - Warm Editorial Parchment)
- **Background Base (`--color-bg`)**: `#FAF7F2` (Warm Bone / Unbleached Linen)
- **Surface (`--color-surface`)**: `#FFFFFF` (Crisp Pure Paper)
- **Surface Hover (`--color-surface-hover`)**: `#F4EFEA` (Warm Sand)
- **Surface Muted / Card (`--color-card-bg`)**: `rgba(255, 255, 255, 0.90)`
- **Primary Ink (`--color-primary`)**: `#181512` (Deep Charcoal Ink)
- **Primary Hover (`--color-primary-hover`)**: `#2C2621`
- **Terracotta Accent (`--color-accent`)**: `#9A4E27` (Burnt Sienna / Terracotta)
- **Terracotta Accent Hover (`--color-accent-hover`)**: `#7D3E1E`
- **Terracotta Soft Tint (`--color-accent-soft`)**: `#F5EBE4`
- **Terracotta Border (`--color-accent-border`)**: `rgba(154, 78, 39, 0.22)`
- **Warm Gold Accent (`--color-gold`)**: `#C28236` (Foil Stamping Gold)
- **Forest Green (`--color-forest`)**: `#2D5A3F` (Deep Botanical Green)
- **Text Primary (`--color-text`)**: `#181512`
- **Text Secondary (`--color-text-secondary`)**: `#5C554D`
- **Muted (`--color-muted`)**: `#8C8277`
- **Border Base (`--color-border`)**: `#E8E2D9`
- **Border Strong (`--color-border-strong`)**: `#D4CBBF`

### Dark Theme (Dark Velvet & Obsidian Ink)
- **Background Base (`--color-bg`)**: `#121110` (Dark Roasted Espresso)
- **Surface (`--color-surface`)**: `#1A1816` (Deep Charcoal Slate)
- **Surface Hover (`--color-surface-hover`)**: `#24211D`
- **Surface Muted / Card (`--color-card-bg`)**: `rgba(26, 24, 22, 0.88)`
- **Primary Ink (`--color-primary`)**: `#F6F2EA` (Soft Warm Bone)
- **Terracotta Accent (`--color-accent`)**: `#E28E5C` (Warm Amber Terracotta)
- **Terracotta Accent Hover (`--color-accent-hover`)**: `#F4A576`
- **Terracotta Soft Tint (`--color-accent-soft`)**: `rgba(226, 142, 92, 0.14)`
- **Terracotta Border (`--color-accent-border`)**: `rgba(226, 142, 92, 0.28)`
- **Text Primary (`--color-text`)**: `#F6F2EA`
- **Text Secondary (`--color-text-secondary`)**: `#AFA79C`
- **Muted (`--color-muted`)**: `#7D756C`
- **Border Base (`--color-border`)**: `#2C2823`
- **Border Strong (`--color-border-strong`)**: `#423C35`

## 3. Typography Scale
- **Display & Headings**: `'Newsreader', Georgia, 'Times New Roman', serif`
  - High editorial character, optical optical sizing (`opsz`), delicate italics.
  - Letter-spacing: `-0.02em` to `-0.01em`
- **Body & Interface**: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
  - Precise geometry, high legibility at 12px–18px.
  - Letter-spacing: `-0.01em`
- **Identifiers, Formats, & Metadata**: `'JetBrains Mono', monospace`
  - Crisp tabular numbers, ISBN, currency formatting.

## 4. Elevation, Shadow & Tactile Book Physics
- **Book Cover Elevation**: `0 12px 32px -4px rgba(24, 21, 18, 0.18), 0 4px 10px -2px rgba(24, 21, 18, 0.08)`
- **Book Spine Crease**: Left-side vertical shadow gradient simulating binding curvature (`linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 4%, transparent 12%)`)
- **Parchment Surface Blur**: `backdrop-filter: blur(16px) saturate(180%)`
- **Ledge Shelf Depth**: Frosted amber glass shelf with warm diffuse underlight.

## 5. Component Interaction Guidelines
- **Buttons**: Tactile button surfaces with subtle micro-scale on click (`scale(0.98)`), smooth focus rings (`--color-accent` with 3px offset).
- **Cards**: Lift transition (`translateY(-6px)`) with realistic shadow expansion.
- **Reader Engine**: Uninterrupted column width (optimal reading line length 65-75 characters), adjustable font sizes (14px–28px), drop caps on opening paragraphs, sepia/dark/light theme tokens.
