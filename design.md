# Design System & Implementation Specification
**Project:** Web3 Labs Platform  
**Inspiration:** [ChainGPT Labs](https://labs.chaingpt.org/)  
**Version:** 1.0.0  
**Status:** Active  

---

## 1. Design Vision & Aesthetic Direction

The design bridges high-performance Web3 infrastructure with a futuristic cyber-industrial laboratory aesthetic. It embodies the precision, transparency, and high-energy innovation of top-tier Web3 incubators (ChainGPT Labs, Paradigm, Binance Labs), featuring:

- **Clean Cyber-Lab Canvas:** Crisp architectural light neutral background with subtle technical grid coordinates, paired with an optional dark incubation chamber mode.
- **Precision Technical Grid:** Hairline borders, crosshairs (`+`), technical corner brackets (`┌ ┐ └ ┘`), and vivid orange status squares (`■`) at intersections.
- **Cyber Display Typography:** Bold, modular geometric sci-fi lettering for hero headlines ("BACKING BUILDERS", "BEYOND CAPITAL", "INCUBATION", "PORTFOLIO", "FAQ", "LABS").
- **Terminal & Monospace Hierarchy:** Code-inspired uppercase labels (`■ Supercharging Web3 Builders`, `TBA Funds Raised`, `[ 14 ] ALL PROJECTS`).
- **Incubation Pod & 3D Interactive Mascot:** Floating robotic assistant in a pressurized glass incubation tube with an amber-orange glowing bezel and dynamic eye tracking.
- **Beveled & Chamfered Edge System:** Cyber-cut corners on buttons (`APPLY NOW`, `APPLY FOR INCUBATION`, `BIO +`) using CSS polygon clip-paths.

---

## 2. Color Palette & Token System

### 2.1 Cyber-Lab Light Mode (Primary Signature)
| Token | Hex Value | Application |
|---|---|---|
| `--bg-lab` | `#F0F2F5` / `#ECECEC` | Page background canvas |
| `--surface-card` | `#FFFFFF` | Technical cards and module surfaces |
| `--surface-muted` | `#E3E6EB` | Inner data wells, stat badges |
| `--border-hairline` | `rgba(0, 0, 0, 0.08)` / `#D8DCE3` | 1px precision grid dividers |
| `--border-accent` | `rgba(255, 91, 0, 0.3)` | Highlighted card borders |
| `--accent-orange` | `#FF5B00` / `#FF5500` | Primary action buttons, status dots, tags |
| `--accent-glow` | `rgba(255, 91, 0, 0.25)` | Capsule glow, button drop shadows |
| `--text-primary` | `#0E1013` | Headlines, titles, strong emphasis |
| `--text-secondary` | `#4F5565` | Monospace tags, descriptions, body |
| `--text-dim` | `#8B93A4` | Technical timestamps, coordinates |

### 2.2 Cyber-Dark / Incubation Chamber Mode
| Token | Hex Value | Application |
|---|---|---|
| `--bg-dark` | `#0A0B0D` / `#121316` | Main dark background |
| `--surface-dark` | `#16181D` | Elevated modules |
| `--border-dark` | `rgba(255, 255, 255, 0.08)` | Grid dividers |
| `--accent-orange` | `#FF5B00` | High-contrast neon accent |
| `--text-dark-primary`| `#FFFFFF` | Headlines |
| `--text-dark-dim` | `#6C7383` | Secondary text |

---

## 3. Typography Architecture

1. **Cyber Display Heading Font:**
   - **Characteristics:** Futuristic, blocky, modular, architectural curves.
   - **Applications:** Hero headings (`ROW BACKING`, `BEYOND CAPITAL`, `INCUBATION`, `PORTFOLIO`, `MEDIA PRESENCE`, `FAQ`, giant footer `LABS`).
   - **Font Families:** Custom Sci-Fi SVG/CSS display components, Orbitron / Bruno Ace / Syne / Chakra Petch.

2. **Technical Monospace Code Font:**
   - **Characteristics:** Fixed-width, crisp, alphanumeric clarity.
   - **Applications:** Navigation categories, section indexers (`01`, `02`), stats (`TBA Funds Raised`), status tags (`✔ AI`, `✔ DeFi`, `✔ DePIN`, `✔ L1/L2`), corner coordinates.
   - **Font Families:** `IBM Plex Mono`, `Geist Mono`, `Space Mono`.

3. **Modern Sans-Serif Body:**
   - **Applications:** Explanatory copy, bios, article summaries.
   - **Font Families:** `Inter`, `Geist Sans`, system fallbacks.

---

## 4. Key Components & Layout Breakdown

### 4.1 Header & Cyber Navigation
- **Floating Cut-Corner Bar:** Frosted glass backing with beveled chamfers (`clip-path: polygon(...)`).
- **Brand Identity:** Cyber robotic mascot logo + stylized uppercase logotype `CHAIN LABS`.
- **Nav Links:** `Our Programs`, `Portfolio`, `Events`, `Team`, `FAQ`, `Reviews`, `Ecosystem`.
- **Right Command Bar:**
  - Fast search / theme switch toggle.
  - Chamfered Orange CTA Button: `APPLY NOW` with diagonal slice corners.
- **Floating Vertical Bar:** Sticky right-side panel with crosshair icon and vertical social links (X, Telegram, Medium, LinkedIn).

### 4.2 Hero Section: "BACKING TOMORROW"
- **Grid Canvas:** Hairline grid lines forming equal columns with orange coordinate points at the intersections.
- **Top Label:** `■ BACKING TOMORROW` in crisp monospace.
- **Massive Cyber Headline:** Modular display typography `ROW BACKING` / `BACKING BUILDERS`.
- **Lead Text:** *"Backing the very best web3 builders — transforming visionary ideas into real-world growth."*
- **Action CTA:** Dual actions — Primary `APPLY FOR INCUBATION` (chamfered orange) & Secondary `EXPLORE ECOSYSTEM`.
- **Interactive Center Incubation Capsule:**
  - Glass cylindrical incubation pod with top and bottom metallic caps.
  - Floating 3D robotic mascot inside with glowing yellow/amber face bezel, blinking eyes, and gentle idle bobbing animation.
  - Corner bracket indicator card with rotating isometric 3D geometry.
- **Partner Trust Marquee / Grid:**
  - Sleek segmented bottom bar: `OUR PARTNERS: < >` with marquee or clean multi-cell display of industry titans: Chainlink, TRON, BNB Chain, OKX, Polygon, Arbitrum.

### 4.3 "BEYOND CAPITAL" — Supercharging Web3 Builders
- **Dual Column Architecture:**
  - **Left Section:** `■ Supercharging Web3 Builders` with interactive orange checklist pill selectors:
    - `✔ AI` (Artificial Intelligence & ML)
    - `✔ DeFi` (Decentralized Finance & AMMs)
    - `✔ DePIN` (Decentralized Physical Infrastructure)
    - `✔ L1/L2` (Scalable Execution Layers)
  - **Right Section:** `■ Smart Capital — Our ecosystem support` with numbered cards:
    - `01 Incubation & Acceleration Program` (isometric 3D cross icon)
    - `02 Investment & Funding` (isometric 3D stepped block icon)

### 4.4 "INCUBATION" — End-to-End Support
- **Left Cards:** `02 Treasury Building`, `03 Strategic Partnerships`.
- **Center Focus:** Vertical glass conduit carrying encrypted data packets and energy pulses.
- **Right Narrative:** *"We do the impossible. In web3, it takes an entire ecosystem to transform ideas into industry leaders. With strategic funding, GTM support, and top-tier partnerships — we set you up for unparalleled growth."*

### 4.5 "PORTFOLIO" — Incubations & Projects
- **Status Header:** `■ Our Incubations`, massive `PORTFOLIO` display typography, `All Projects [ 14 ] ->`.
- **Connected Pipeline Schematic:** Visual conduit tubing connecting active network nodes and robot heads.
- **Project Cards (Lumoz, Hana, Atlas, Decrypto, Web3 BMSIT, etc.):**
  - Project identity logo and badges.
  - Four-quadrant metric matrix: `TBA Funds Raised`, `TBA Social Growth`, `TBA ATH ROI`, `TBA Partnerships`.
  - Chamfered circle or arrow link to live app / detail drawer.

### 4.6 Team Section — Technical Dossiers
- Clean cyber cards with 4 corner tick marks `┌ ┐ └ ┘`.
- High-contrast black and white team portrait photography with subtle zoom on hover.
- Identity: Monospace name, uppercase designation (`INCUBATION DIRECTOR`, `ADMINISTRATION`, `PROGRAM MANAGER`, `VC NETWORK MANAGER`).
- Expandable `BIO +` trigger opening smooth accordions or modal dossiers.

### 4.7 FAQ Section — Technical Knowledge Base
- Prominent `FAQ` display heading with isometric molecular icon.
- `■ Most Common Questions — No worries, here you can find all the answers`.
- Interactive cyber accordion with monospace numbering and smooth disclosure animations.

### 4.8 Residency Banner & Giant Footer
- High-impact orange cyber-residency module: "WE BACK BUILDERS" with retro CRT monitor visual, value pillars (`> Hands-on support`, `> Real network access`, `> Customized growth plan`).
- Giant typographic footer: Massive letters `LABS` / `WEB3` spanning edge-to-edge.
- Terminal copyright data line, links to documentation and Help Center.

---

## 5. Animations & Micro-Interactions

| Animation Name | Trigger | Effect Description |
|---|---|---|
| `scanline` | Continuous | 1px horizontal subtle luminous scan sweep across cards |
| `capsuleBob` | Idle | Smooth sinusoidal levitation of 3D mascot within incubation chamber |
| `tickerFlow` | Continuous | Infinite linear ticker stream for partner logos and announcement marquee |
| `scrambleText` | On Hover / Load | Fast alphanumeric decryption effect (`0x◆9f▲`) settling into final text |
| `cornerExpand` | Hover | Corner brackets `┌ ┐` subtly shift outward by 2px on interactive cards |
| `pulseDot` | Continuous | Orange coordinate dots gently breathe between 0.6 and 1.0 opacity |

---

## 6. Admin Portal Specifications (`/admin`)

### 6.1 Security & Access Gate
- **Hidden Route:** `/admin` is not exposed in public navigation menus.
- **Passcode Protection Screen:**
  - Sleek Cyber-Lock Terminal interface (`ACCESS KEY REQUIRED`).
  - Secure verification against authorized admin credentials (environment variable `ADMIN_PASSWORD` or secure fallback token).
  - Remembers authenticated session in cookie / local storage.

### 6.2 Administrative Capabilities (Full Customization)
1. **Events Management:**
   - Add new events (Title, Subtitle, Date, Start Date, Location, Prize, Tags, Sponsors, Chain, Banner Image).
   - Edit existing events in real-time.
   - Toggle status (`open` / `soon` / `closed`).
   - Dynamic registration form field builder (text, email, number, select).
   - Delete events.
2. **Team Members Management:**
   - Add new team members (Name, Role, Department, Bio/Description, Hierarchy, Socials, Photo upload).
   - Edit member info and change sort order / hierarchy.
   - Delete team members.
3. **Site Content & Metrics Management:**
   - Update Hero statistics (Total Incubations, Capital Raised, Partners Count).
   - Manage Announcement Ticker and FAQ questions & answers.
   - Preview live changes immediately without rebuilds.

### 6.3 Technical Guarantees
- Existing Supabase database tables, schemas, and public client hooks remain 100% intact and backward-compatible.
- All actions run safely on server and client with fallback states for local development.
