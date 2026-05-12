# Pet Tracking System - Frontend Client

Modern, high-performance web interface built with Next.js (App Router), React 19, TypeScript, and Tailwind CSS. Designed to deliver an intuitive dashboard and digital representation of physical Pet Passports.

## Features
- **Responsive Layouts**: Designed beautifully for mobile, tablet, and widescreen desktop viewing.
- **Centralized API Integration**: Built-in, clean Axios setup (`src/lib/axios.ts`) configured to talk directly to our Express microservice backend.
- **Digital Pet Passport UI**: Rich visualizations that present complex microchip strings, vaccination intervals, and clinical trails cleanly.

## Technology Stack
- **Framework**: Next.js (v16+)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **HTTP Client**: Axios

## Getting Started

### Installation
Install project packages:
```bash
npm install
```

### Environment Configuration
Create a `.env.local` file in the root directory to point to your running backend service:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### Local Development Server
Start the Next.js fast-refresh development environment:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

## Project Structure
```text
src/
├── app/             # App Router layout, page components, and global CSS
└── lib/             # Utility helpers and API singletons (Axios client)
```
