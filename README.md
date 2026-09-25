# Nexora Trade Terminal

Build a premium institutional cryptocurrency exchange FRONTEND DEMO named "NEXORA EXCHANGE".

REFERENCE:
Use the provided NexifyTrade screenshots as the primary visual reference for:
- overall layout
- dark theme
- green/cyan color system
- typography
- spacing
- navigation
- market ticker
- hero composition
- trading widget
- market scanner
- cards
- tables
- exchange dashboard density

IMPORTANT:
Create an ORIGINAL branded implementation.
Do NOT copy NexifyTrade's logo, brand assets, proprietary text, exact identity, or claim association with NexifyTrade.

The final website should feel like a premium combination of:
institutional crypto exchange + modern fintech platform + high-end trading terminal.

==================================================
CORE TECHNOLOGY
==================================================

Use:

- React
- Vite
- TypeScript
- React Router
- Tailwind CSS or clean modular CSS
- Lucide React icons
- Recharts or lightweight SVG charts
- Framer Motion for animations if available

Frontend only.

DO NOT create:
- Next.js
- SSR
- backend
- database
- Supabase
- Firebase
- real authentication
- real crypto wallet
- real deposits
- real withdrawals
- real trading
- real payments
- real investment functionality
- live exchange APIs

Use centralized MOCK DATA.

Everything must work as a frontend demonstration.

==================================================
DESIGN DIRECTION
==================================================

The entire website must use a premium dark institutional exchange aesthetic.

Background:
#05090C

Secondary:
#071015

Cards:
#0B1318

Elevated cards:
#0E181E

Borders:
rgba(255,255,255,0.07)

Primary green:
#00E887

Secondary green:
#00C978

Cyan:
#08D9F5

White:
#F5F7F8

Secondary text:
#8B9AAA

Muted:
#526372

Negative:
#FF3D62

Warning:
#FFC857

Use green/cyan gradients only where visually useful.

DO NOT use:
- purple
- bright white backgrounds
- generic SaaS gradients
- cartoon illustrations
- excessive glassmorphism
- excessive rounded bubbly cards

The UI must feel serious, technical, premium and institutional.

==================================================
TYPOGRAPHY
==================================================

Use Inter or another premium modern sans-serif.

Headings:
700-900 weight.

Hero heading:
very bold.

Financial numbers:
tabular/monospace-friendly styling.

Use tight professional typography similar to modern financial terminals.

==================================================
GLOBAL ANIMATION PHILOSOPHY
==================================================

THIS IS VERY IMPORTANT.

The website must NOT feel static.

Every section should have polished, subtle, premium motion.

Animations must feel like a high-end fintech product.

DO NOT make animations childish, excessive or distracting.

Use:
- Framer Motion
- CSS transitions
- IntersectionObserver where appropriate
- transform/opacity animations
- GPU-friendly transforms
- staggered reveals

Prefer:
transform
opacity
scale
blur
clip-path

Avoid heavy animations that hurt performance.

==================================================
1. CUSTOM MOUSE / CURSOR EFFECT
==================================================

On desktop create a premium custom cursor experience.

Normal cursor:
small glowing cyan/green dot.

Secondary cursor ring:
small transparent circle following the mouse with smooth interpolation.

When hovering interactive elements:

Buttons:
cursor ring expands slightly.

Cards:
cursor gets subtle glow.

Links:
cursor changes to a small magnetic interaction.

Images:
subtle cursor parallax.

Do NOT replace the native cursor in a way that harms usability.

Keep the effect subtle and professional.

Disable custom cursor effects automatically on:
- mobile
- touch devices
- reduced-motion preference

==================================================
2. MAGNETIC BUTTON EFFECT
==================================================

Primary buttons should have a subtle magnetic hover effect.

When mouse moves over CTA:
button shifts 2-5px toward cursor.

Add:
- subtle glow
- gradient movement
- slight scale 1.02
- smooth spring animation

Example buttons:

Get Started
Trade Spot
Trade Futures
Claim Demo Bonus
View Markets

Do NOT overdo the movement.

==================================================
3. MOUSE PARALLAX EFFECT
==================================================

Hero section should have subtle mouse-based parallax.

Desktop only.

Create extremely subtle movement for:

- background glow
- hero trading widget
- decorative grid
- small floating market particles
- accent shapes

Movement should be approximately:
5-15px maximum.

Different layers should move at different speeds.

Do not distort the actual UI.

==================================================
4. HERO BACKGROUND EFFECT
==================================================

Create a premium animated background.

Use:

very subtle radial green glow
+
cyan glow
+
dark gradient
+
fine grid texture
+
soft floating particles

Background should slowly move.

Add an extremely subtle animated "market data" atmosphere.

No flashy neon cyberpunk look.

It should feel like institutional infrastructure.

==================================================
5. PAGE INITIAL LOADING EXPERIENCE
==================================================

Create a premium initial loading screen.

When the application first loads:

Dark screen.

Centered:

NEXORA EXCHANGE logo

Under logo:
"Initializing Trading Interface"

Animated progress line.

Small status messages:

Initializing market engine...
Loading market data...
Preparing trading interface...
Securing session...
Interface ready.

Use a smooth 1.5-2.2 second animation.

Progress bar:
green → cyan gradient.

Add subtle logo glow.

After loading:
animate the loading screen upward/fade out smoothly.

IMPORTANT:

Do not make users wait unnecessarily.

Use sessionStorage/localStorage so the full intro loading animation only appears on first visit.

On subsequent internal route navigation:
use much faster transition.

==================================================
6. PAGE TRANSITION EFFECT
==================================================

When navigating between pages:

Do NOT instantly replace the entire page.

Use:

fade
+
slight upward movement
+
blur reduction

Duration:
250-450ms.

Example:

Markets → Trade
Trade → Futures
Trade → Account

Keep transitions fast and premium.

==================================================
7. SKELETON LOADING
==================================================

Where data panels appear, use elegant skeleton loaders.

Skeleton style:
dark gray animated shimmer.

Examples:

market table rows
prices
chart
order book
account balances
news cards
launchpad cards

Shimmer should move slowly from left to right.

Never show generic spinning loaders everywhere.

Use skeletons where appropriate.

==================================================
8. SCROLL EXPERIENCE
==================================================

The entire website must use smooth scrolling.

Use:

scroll-behavior: smooth

But also create premium scroll-triggered animations.

As the user scrolls down:

sections should reveal naturally.

Do NOT animate everything simultaneously.

==================================================
9. SECTION REVEAL ANIMATIONS
==================================================

Every major homepage section should animate when entering viewport.

Animation pattern:

opacity:
0 → 1

Y:
40px → 0

blur:
8px → 0

Duration:
600-900ms

Ease:
smooth cubic-bezier / easeOut.

Use IntersectionObserver or Framer Motion whileInView.

==================================================
10. STAGGERED CARD REVEALS
==================================================

For grids:

Card 1:
delay 0ms

Card 2:
delay 80ms

Card 3:
delay 160ms

Card 4:
delay 240ms

Use this for:

ecosystem cards
security cards
news cards
launchpad cards
market cards

Cards should appear like a coordinated system.

==================================================
11. SCROLL PROGRESS
==================================================

Create a very thin progress indicator at the top of the page.

As user scrolls:

0% → 100%

The line progresses across the top.

Use primary green/cyan.

Keep it extremely thin.

==================================================
12. NAVBAR SCROLL EFFECT
==================================================

At page top:

Navbar slightly transparent.

When user scrolls:

navbar becomes more opaque.

Add:
backdrop blur
dark background
subtle border-bottom

Navbar height can reduce slightly.

Transition smoothly.

Do not make navbar jump.

==================================================
13. HERO SCROLL TRANSFORMATION
==================================================

When user starts scrolling from hero:

Hero content should subtly move upward.

Trading widget can move slightly slower.

Background glow moves at a different speed.

Use subtle parallax.

Never hide content unexpectedly.

==================================================
14. MARKET TICKER ANIMATION
==================================================

Ticker should continuously move horizontally.

Use seamless infinite animation.

When user hovers ticker:
pause movement.

On mobile:
allow horizontal swipe.

Prices should have subtle number transition effects.

Positive values:
green flash when updated.

Negative values:
red flash when updated.

Do NOT flash aggressively.

==================================================
15. LIVE NUMBER ANIMATION
==================================================

Financial values should animate smoothly when changing.

Example:

83,737.64
→
83,742.21

Use a subtle number transition.

Do NOT use dramatic rolling counters for every number.

==================================================
16. HERO TRADING WIDGET
==================================================

Create premium trading card matching the reference layout.

Top tabs:

BTC/USDT
ETH/USDT
SOL/USDT
DOGE/USDT

Timeframes:

1m
15m
1h
1D

Large price:
83,737.64

Index Price:
64,275.10 USDT

24h High:
84,106.58

24h Low:
83,626.00

Order book:

BIDS (BUY)

64,280.00
1.452 BTC

64,278.50
0.980 BTC

64,275.00
2.114 BTC

ASKS (SELL)

64,281.50
0.815 BTC

64,283.00
1.890 BTC

64,285.00
0.620 BTC

Use subtle depth bars.

When switching pair:
animate price changes.

When switching timeframe:
animate chart.

==================================================
17. HERO CTA EFFECTS
==================================================

Primary CTA:

Get Started →

Create:
green/cyan gradient
subtle animated shine
magnetic hover
soft shadow
small arrow movement

On hover:
arrow moves 4px right.

Secondary buttons:
small glow on hover.

==================================================
18. MARKET SCANNER
==================================================

Create:

LIVE MARKET SCANNER

Heading:
Explore 300+ Crypto Markets

Description:
Real-time simulated market interface with professional price tracking.

Button:
View Full Market Overview →

Market panel:

All Hot
Top Gainers
100x Derivatives
Layer 1 & DeFi

Search:
Search coin (e.g. BTC, ETH)

Table:

ASSET
LAST PRICE
24H CHANGE
7D TREND
24H HIGH / LOW
QUICK TRADE

Rows:

SOL
FIL
MON
BNB
SUI
HBAR
PEPE
BTC
ETH
DOGE
XRP
ADA
AVAX
LINK
UNI
AAVE
NEAR
ARB
OP
TIA
INJ
RENDER
FET
GRT
THETA
WLD
SHIB
WIF
BONK
etc.

Each row:
- icon
- symbol
- pair
- price
- change
- sparkline
- high/low
- Spot
- Futures

Hover row:

background slightly brightens
left border glow appears
buttons become brighter
sparkline slightly enlarges

Keep effect subtle.

==================================================
19. SPARKLINE ANIMATION
==================================================

Sparklines should animate when entering viewport.

Use SVG path drawing animation.

Green positive trend.

Red negative trend.

When market value updates:
subtle path transition.

==================================================
20. MARKET TABLE SCROLL
==================================================

Desktop:
large table.

Mobile:
transform into compact market cards.

Do NOT force a huge desktop table onto mobile.

Mobile cards should show:

Coin
Price
24h %
Mini chart
Trade button

==================================================
21. ECOSYSTEM SECTION
==================================================

Heading:

Built for Retail & Institutional Traders

Four premium cards:

Spot & Margin

Perpetual Futures

Mining & Earn

Token Launchpad

Each card gets:

subtle hover lift
gradient border glow
icon animation
background radial glow
3D-ish depth

On mouse move:
card should slightly react to cursor position.

Maximum movement:
3-6px.

Keep cards professional.

==================================================
22. 3D CARD TILT EFFECT
==================================================

For selected premium cards only:

security cards
ecosystem cards
launchpad cards

Use subtle 3D tilt.

Maximum:
3 degrees.

Card returns smoothly to normal when mouse leaves.

Disable on mobile.

==================================================
23. SECURITY SECTION
==================================================

Heading:

Enterprise Protection

Cards:

MPC Cold Storage
Hardware 2FA & FIDO2
Anti-DDoS Shielding
Risk Engine

When scrolling into section:

icons animate in sequence.

Shield:
small pulse.

Lock:
subtle rotation.

Network:
small node movement.

Do NOT use cartoon animations.

==================================================
24. VERIFICATION SECTION
==================================================

Create:

Transparent by Design

Show:

100%
Demo Reserve Verification

1:1
Demo Asset Accounting

Audited
UI Verification

Multi-Layer
Security Model

Create animated progress ring.

Ring should animate from:
0 → target

Use green/cyan.

Clearly label everything:

DEMO / SIMULATED

==================================================
25. ONBOARDING SECTION
==================================================

Heading:

Start Trading in 3 Simple Steps

Cards:

01 Create Demo Account
02 Explore Markets
03 Execute Paper Trade

When scrolling:

01 appears
then connector line draws
then 02 appears
then connector line
then 03 appears

Use elegant timeline animation.

==================================================
26. DEVICE SECTION
==================================================

Heading:

Trade Anywhere, Anytime

Show:
desktop terminal
tablet
mobile phone

Use subtle floating animation.

Desktop mockup:
slow 3-5px vertical movement.

Mobile mockup:
slight opposite movement.

Create soft shadows and glow.

Buttons:
Download iOS
Download Android
Desktop App

Click opens demo modal.

==================================================
27. NEWS SECTION
==================================================

Three news cards.

On scroll:
stagger reveal.

On hover:
image/content moves 2-4px.

Arrow moves right.

==================================================
28. FAQ SECTION
==================================================

Accordion.

When opening:
height animation
opacity animation
icon rotates 180 degrees

Only one accordion may remain open if appropriate.

==================================================
29. FOOTER
==================================================

Large premium dark footer.

When footer enters viewport:

columns fade upward.

Social icons get subtle hover effect.

Newsletter input has glowing focus state.

==================================================
30. SPOT TRADING PAGE
==================================================

Route:

/trade/:pair

Full professional exchange terminal.

Top:

pair
price
change
high
low
volume

Main:

candlestick chart.

Controls:

1m
5m
15m
1h
4h
1D

Chart should animate on load.

Use realistic mock OHLC data.

Chart interactions:
hover tooltip
crosshair
smooth transitions

Right:
Order Book.

Bottom:
Buy/Sell.

Tabs:
Limit
Market
Stop Limit

Buttons:
Paper Buy
Paper Sell

On click:

button briefly enters loading state.

Then:
success check animation.

Toast:
"Paper order submitted"

==================================================
31. FUTURES PAGE
==================================================

Route:

/futures

Top:

BTC/USDT
Mark Price
Index Price
Funding Rate
24h Change

Main chart.

Order panel:

Long
Short

Cross
Isolated

Leverage:

1x
5x
10x
25x
50x
75x
100x

Show:

Position Size
Entry Price
Mark Price
Liquidation Price
Unrealized PnL
ROE

Use animated values.

All demo only.

==================================================
32. MARKETS PAGE
==================================================

Route:

/markets

Heading:

Crypto Markets

Search.

Filters.

Large market table.

Sortable columns.

Hover effects.

Clicking an asset:
transition to trading page.

==================================================
33. EARN PAGE
==================================================

Route:

/earn

Hero:

Mining & Earn

Cards:

BTC Mining Demo
ETH Earn Demo
USDT Yield Demo
Stablecoin Vault Demo

Each card:

APY
Duration
Minimum
Capacity
Progress

Progress bars animate when entering viewport.

==================================================
34. LAUNCHPAD
==================================================

Route:

/launchpad

Project cards.

Each card:

logo
project
status
token price
subscription progress
start/end
allocation

Progress bar animation.

Click:
project detail modal/page.

==================================================
35. AUTH PAGES
==================================================

Routes:

/login
/register
/forgot-password

Use premium centered authentication layouts.

Animated background grid.

Subtle green/cyan glow.

Form fields:

focus glow
smooth border transition
error shake only when actual invalid input
success check animation

Do not over-animate.

==================================================
36. ACCOUNT DASHBOARD
==================================================

Route:

/account

Sidebar:

Overview
Assets
Deposit Demo
Withdraw Demo
Orders
Trade History
Security
KYC Demo
Notifications
Affiliate

Main:

Total Demo Balance
24h PnL
Available Balance
Frozen Balance

Cards animate on load.

Numbers count smoothly once.

Charts reveal from left to right.

==================================================
37. DEPOSIT DEMO
==================================================

Route:

/deposit

Tabs:

Crypto Demo
Fiat Demo

Crypto:

Asset
Network
Demo Address
QR placeholder

Clearly show:

DEMO ADDRESS — NO REAL FUNDS

When copying:
animated check.

==================================================
38. WITHDRAW DEMO
==================================================

Route:

/withdraw

Asset
Address
Amount
Network

Show:

Available Demo Balance
Network Fee
Estimated Arrival

Button:

Submit Demo Withdrawal

Click:
confirmation modal.

==================================================
39. KYC DEMO
==================================================

Route:

/kyc

Steps:

Personal Information
Identity Document
Selfie
Review

Create step progress animation.

Clearly state:

"Demo KYC — no documents are uploaded or stored."

==================================================
40. AFFILIATE
==================================================

Route:

/affiliate

Show:

Referral Link
Clicks
Demo Referrals
Demo Rewards
Conversion Rate

Use animated statistic cards.

Network visualization should gently animate.

==================================================
41. NEWS
==================================================

Route:

/news

Categories:

Platform
Security
Markets
Product Updates

Search.

Cards.

Page transitions.

==================================================
42. FEES
==================================================

Route:

/fees

Tabs:

Spot
Futures
VIP

Professional pricing table.

Animate tab transitions.

==================================================
43. SECURITY PAGE
==================================================

Route:

/security

Sections:

Account Security
Asset Architecture
2FA
Withdrawal Protection
Risk Controls
System Monitoring

Use scroll-triggered timeline.

==================================================
44. MOBILE EXPERIENCE
==================================================

Mobile must NOT be a compressed desktop layout.

Create dedicated mobile UX.

Bottom navigation:

Home
Markets
Trade
Earn
Account

Mobile trading:

Price
Chart
Buy/Sell
Order Book collapsible
Positions

Mobile animation must be lighter.

Disable:
custom cursor
3D tilt
mouse parallax

Keep:
page transitions
scroll reveals
button animations
skeletons
micro-interactions

==================================================
45. REDUCED MOTION
==================================================

Respect:

prefers-reduced-motion

If enabled:

disable:
parallax
cursor effects
3D tilt
large transitions

Keep only minimal opacity transitions.

==================================================
46. PERFORMANCE
==================================================

IMPORTANT:

Animations must not destroy performance.

Use:

transform
opacity
will-change only where needed

Avoid:

large continuously running JavaScript loops
heavy canvas effects
massive particle systems
layout-triggering animations

Use CSS animations where possible.

Lazy-load large sections where appropriate.

Charts should not continuously rerender unnecessarily.

==================================================
47. LOADING STATES
==================================================

Every async-looking UI interaction should have polished feedback.

Examples:

Button loading:
small animated spinner

Table:
skeleton rows

Chart:
chart skeleton

Card:
shimmer

Page:
transition

Success:
green check

Error:
red alert

Never leave users wondering whether a click worked.

==================================================
48. TOAST SYSTEM
==================================================

Create reusable toast notifications.

Success:
green accent

Info:
cyan

Warning:
yellow

Error:
red

Example:

"Paper order submitted"

"Demo address copied"

"Preferences saved"

"Demo withdrawal submitted"

Toasts:
slide from bottom/right
fade
auto-dismiss

==================================================
49. MODALS
==================================================

Premium dark modal.

Background:
blur + dark overlay.

Modal:
scale 0.96 → 1
opacity 0 → 1

Close:
smooth reverse.

Use for:

download app
trade confirmation
project details
demo withdrawal
demo deposit
security notices

==================================================
50. GLOBAL HOVER SYSTEM
==================================================

Interactive elements should have consistent hover behavior.

Buttons:
slight scale + glow

Cards:
slight elevation

Links:
color transition

Icons:
small movement

Table rows:
background highlight

Inputs:
border glow

Tabs:
animated active indicator

Do not make every element glow.

==================================================
51. ACTIVE NAVIGATION
==================================================

Navbar active item:

animated underline.

Underline should smoothly move between active links rather than instantly appearing.

Mobile navigation:

active icon gets green accent
small glow
label becomes brighter.

==================================================
52. MOCK MARKET ENGINE
==================================================

Create centralized market data.

Each asset:

symbol
name
price
change24h
high24h
low24h
volume
sparkline
category

Example:

BTC 83737.64
ETH 2685.84
SOL 120.3795
BNB 773.41
XRP 1.56118
DOGE 0.096909
LINK 13.7683
AAVE 153.4173
NEAR 4.9811
SUI 1.0955

Prices may change slightly every 3-5 seconds.

Use controlled random variation.

Do not connect to live financial APIs.

==================================================
53. REUSABLE COMPONENTS
==================================================

Create:

StatusBar
MainNavbar
MobileNavbar
MarketTicker
ScrollProgress
PageLoader
PageTransition
CustomCursor
HeroSection
HeroTradingWidget
StatStrip
MarketScanner
MarketTable
MarketRow
Sparkline
PriceChart
OrderBook
TradingPanel
AssetCard
SecurityCard
OnboardingSteps
DeviceSection
NewsCard
FAQAccordion
Footer
AuthLayout
DashboardSidebar
BalanceCard
OrderHistory
NotificationPanel
AffiliateStats
Modal
Toast
Skeleton
AnimatedNumber
MagneticButton
TiltCard

Keep components reusable.

==================================================
54. HOMEPAGE ORDER
==================================================

Homepage MUST contain all of these sections in this order:

1. Global Loading Experience
2. Status Bar
3. Main Navigation
4. Market Ticker
5. Hero
6. Hero Trading Widget
7. Statistics
8. Market Scanner
9. Ecosystem
10. Transparent / Demo Verification
11. Security Architecture
12. 3-Step Onboarding
13. Device/App Section
14. News
15. FAQ
16. Footer

Do not remove sections.

==================================================
55. VISUAL QUALITY
==================================================

The final design should have:

- premium spacing
- excellent typography
- consistent card heights
- strong visual hierarchy
- sophisticated dark colors
- subtle green/cyan glow
- clean borders
- professional charts
- dense but readable market tables
- smooth scrolling
- polished micro-interactions
- cinematic but restrained page transitions

The site should feel expensive.

==================================================
56. STRICT UI RULES
==================================================

Do NOT:

- change the main dark theme
- use purple
- use random colors
- use generic stock illustrations
- use cartoon icons
- remove the trading widget
- remove market scanner
- remove ecosystem section
- remove security section
- remove onboarding
- remove FAQ
- remove footer
- create backend
- add unnecessary architecture
- add real crypto functionality
- add real financial transactions
- add real investment functionality
- claim real reserves
- claim real regulation
- claim real licenses
- claim real customers
- claim real trading volume
- claim real security certifications

Everything financial must be clearly:

DEMO
SIMULATED
PAPER TRADING

==================================================
57. RESPONSIVE QUALITY
==================================================

Desktop:
maximum premium experience.

Tablet:
intelligently collapse columns.

Mobile:
dedicated mobile experience.

Check:

320px
375px
390px
430px
768px
1024px
1280px
1440px
1920px

No horizontal overflow.

No broken cards.

No text clipping.

No overlapping navigation.

==================================================
58. FINAL QA
==================================================

Before finishing:

TEST EVERY ROUTE.

Test:

/
 /markets
 /trade/BTC-USDT
 /futures
 /earn
 /launchpad
 /login
 /register
 /forgot-password
 /account
 /deposit
 /withdraw
 /kyc
 /notifications
 /affiliate
 /news
 /fees
 /security

Also test:

- navbar
- mobile navbar
- ticker
- market search
- filters
- sorting
- asset navigation
- chart controls
- Buy/Sell demo
- modals
- toast notifications
- copy buttons
- accordions
- login demo
- register demo
- dashboard
- deposit demo
- withdrawal demo
- FAQ
- all CTAs

==================================================
59. FINAL MOTION QA
==================================================

Verify:

✓ Initial loader works
✓ Page transitions work
✓ Scroll reveal works
✓ Stagger animations work
✓ Navbar scroll effect works
✓ Scroll progress works
✓ Cursor effect works on desktop
✓ Cursor disabled on mobile
✓ Magnetic buttons work
✓ Card hover works
✓ 3D tilt works only on supported desktop
✓ Hero parallax works
✓ Ticker animation works
✓ Number transitions work
✓ Skeleton loading works
✓ Chart animations work
✓ Modal transitions work
✓ Toast transitions work
✓ Reduced-motion mode works

Animations must remain smooth and never block interaction.

==================================================
FINAL RESULT
==================================================

Build the COMPLETE website now.

The result should be a highly polished, premium, modern institutional crypto exchange FRONTEND DEMO.

The visual language should strongly match the supplied reference screenshots:

dark
professional
green/cyan
institutional
high-density
premium
technical
modern

But the branding must be original:

NEXORA EXCHANGE

The website should feel like a real high-end exchange interface while remaining clearly a DEMO / SIMULATED frontend.

DO NOT ask unnecessary clarification questions.

Build the complete experience.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nexustradeapp.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bc6d0d96-f0e7-4a9c-ab7c-cb027bbc94ab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
