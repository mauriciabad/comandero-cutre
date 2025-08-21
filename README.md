# Comandero App

A real-time order management system for restaurants and bars.

## Features

- **Simple Authentication**: Password-based login with role selection
- **Real-time Order Management**: Create, update, and track orders in real-time
- **Role-based Access**: Different views and permissions for waiters, cooks, and bartenders
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Notifications**: Sound alerts for new orders and ready items
- **Order Tracking**: Monitor preparation time and status

## User Roles

- **Waiters**: Take orders at tables and serve food/drinks
- **Barman**: Prepare drinks, handle payments
- **Cooks**: Prepare food orders

## Technology Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication, Database, Realtime)
- Zustand (State Management)
- shadcn/ui (UI Components)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup

1. Clone the repository

```bash
git clone https://github.com/yourusername/comandero-cutre.git
cd comandero-cutre
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_APP_PASSWORD=your_app_password_here
```

4. Set up your Supabase database tables according to the schema in `lib/supabase.ts`

5. Run the development server

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Schema

Create the following tables in your Supabase dashboard:

### users

- id (uuid, primary key)
- name (text)
- role (text, enum: 'waiter', 'cook', 'barman')
- preferences (json)
- created_at (timestamp with time zone)

### products

- id (uuid, primary key)
- name (text)
- price (numeric)
- type (text, enum: 'food', 'drink', null)
- color (text, nullable)
- emoji (text, nullable)
- created_at (timestamp with time zone)

### orders

- id (uuid, primary key)
- tableNumber (text)
- createdBy (text)
- items (json)
- cancelledAt (timestamp with time zone, nullable)
- paidAt (timestamp with time zone, nullable)
- drinksReadyAt (timestamp with time zone, nullable)
- foodReadyAt (timestamp with time zone, nullable)
- createdAt (timestamp with time zone)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
