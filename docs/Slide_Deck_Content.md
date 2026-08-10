# EmoBuddy — Slide Deck Content Outline
## Hackathon Pitch Deck | 9 Slides

---

## Slide 1: Cover
**Title:** EmoBuddy 情緒好夥伴
**Subtitle:** A phygital emotion-learning game for children with ASD
**Visual:** EmoBuddy mascot (teal round character), warm cream background with rolling hills
**Bottom:** Try it now → emobuddy-dp2foywlihaj.edgeone.dev | GitHub: erickh826/EmoBuddy

---

## Slide 2: The Problem
**Heading:** Children with ASD struggle to learn and express emotions in traditional ways

**Key Points:**
- 1 in 36 children is diagnosed with ASD (CDC, 2023) — a growing global challenge
- Emotion learning typically relies on eye contact, verbal cues, and social mimicry — all areas of difficulty for ASD children
- Existing apps are passive and screen-only; they don't bridge digital learning with real-world practice
- Parents and teachers lack engaging, low-stimulation tools that respect the child's sensory needs

**Visual:** Simple split — left: frustrated child at screen; right: parent unsure how to help

---

## Slide 3: Our Solution
**Heading:** EmoBuddy bridges the digital game world with real-world interaction

**Key Points:**
- A **top-down 2.5D exploration game** where children navigate maps to collect emotion shards
- Each level ends with a **real-world camera task** — find a red object, a blue object, or a specific item at home
- **Zero pressure design**: no timers, no game over, no wrong answers — every task can be skipped
- **Parent gate**: a 2-second long-press confirms the child completed the real-world task together with a caregiver

**Visual:** Game flow diagram: Map Explore → Collect Shard → Camera Task → Parent Confirm → Level Complete

---

## Slide 4: Product Demo
**Heading:** Three levels, three emotions, one seamless phygital experience

**Layout:** 2×2 screenshot grid
- Top-left: Welcome screen with EmoBuddy mascot
- Top-right: Level 1 "Happy Garden" — 2.5D grid map with player character
- Bottom-left: Camera task modal — "Find a red object!"
- Bottom-right: Certificate screen after completing all 3 levels

**Caption:** Level 1: Happy Garden | Level 2: Calm Forest | Level 3: Brave Hills

---

## Slide 5: Camera Interaction — The Key Innovation
**Heading:** 100% on-device AI detection — no photos, no uploads, zero privacy risk

**Key Points:**
- **Dual detection strategy**: TensorFlow.js COCO-SSD for object recognition + HSL colour analysis as fallback
- All inference runs in the browser — no backend, no camera data leaves the device
- Graceful degradation: Object detection → Colour detection → Manual parent confirmation
- Designed for low-end devices: ROI sampling at 64×64, inference every 500ms, no frame storage

**Visual:** Three-layer fallback diagram: [TF.js Object] → [HSL Colour] → [Manual Confirm]

---

## Slide 6: ASD-Friendly Design Principles
**Heading:** Every design decision reduces sensory load and preserves the child's autonomy

**Key Points (as icon + text pairs):**
- No timers, no game over, no punishment
- Low-saturation colours, no flashing animations
- Supports `prefers-reduced-motion` — animations can be fully disabled
- Every task has a "skip" option — refusal is never a failure
- Camera never auto-starts; child controls when to open it
- Parent confirmation is a shared moment, not a checkpoint

---

## Slide 7: Tech Stack
**Heading:** Production-ready, zero-backend, deployable in 3 days

**Layout:** Clean table or icon grid

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Game Map | DOM + CSS Grid (no Canvas, no Phaser) |
| State Machine | React useReducer |
| AI Detection | TensorFlow.js + COCO-SSD |
| Certificate Export | html-to-image |
| Deployment | EdgeOne (CDN) |
| License | Apache 2.0 |

---

## Slide 8: Roadmap
**Heading:** MVP is live — visual upgrade and richer interactions are next

**Timeline (3 phases):**
- **Now (MVP):** 3 levels, camera interaction, parent gate, certificate
- **Phase 2 (Visual Upgrade):** AI-generated 2.5D tile sprites, per-level theme system, player directional sprites
- **Phase 3 (Expand):** More emotions, teacher dashboard, progress tracking, multilingual support

---

## Slide 9: Team + Call to Action
**Heading:** Built in 3 days. Ready to grow.

**Content:**
- GitHub: github.com/erickh826/EmoBuddy (Apache 2.0 — free for schools and NGOs)
- Live Demo: emobuddy-dp2foywlihaj.edgeone.dev
- Open to: collaboration with special education schools, NGOs, and child development researchers

**Visual:** QR code to live demo + GitHub link
