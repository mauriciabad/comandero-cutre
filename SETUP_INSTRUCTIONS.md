# Setup Instructions for Comandero App

## 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your Supabase URL and anon key from the project settings
3. Create the following tables in SQL Editor:

```sql
-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('waiter', 'cook', 'barman')),
  preferences JSONB DEFAULT '{"notificationsEnabled": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('food', 'drink')),
  color TEXT,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number TEXT NOT NULL,
  created_by TEXT NOT NULL,
  items JSONB NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  drinks_ready_at TIMESTAMP WITH TIME ZONE,
  food_ready_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

4. Enable Row Level Security and create appropriate policies

## 2. Environment Setup

1. Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_PASSWORD_UNSAFE=your_app_password_here
```

2. Add sound files to `/public/sounds/` directory:

- food-ready.mp3
- new-drinks.mp3
- new-food.mp3

You can find royalty-free notification sounds on websites like:

- [Notification Sounds](https://notificationsounds.com/)
- [Mixkit](https://mixkit.co/free-sound-effects/notification/)

## 3. Running the App

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
npm start
```

## 4. Using the App

1. Default password is "comandero" (unless changed in .env.local)
2. Enter your name and select role
3. Create some products first before creating orders

## 5. PWA Setup (Optional)

To make this app work offline as a Progressive Web App:

1. Install next-pwa:

```bash
npm install next-pwa
```

2. Configure `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // Your existing Next.js config
});
```

3. Create a `manifest.json` in the `public` directory
4. Add appropriate icons

## 6. Deployment

The app can be deployed to:

- Vercel (recommended for Next.js apps)
- Netlify
- Any other service that supports Next.js

Remember to set your environment variables on the deployment platform.
