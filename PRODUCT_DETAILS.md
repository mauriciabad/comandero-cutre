# Comandero App: Bar Order Management System

## Core Features

All UI must be in Spanish (from Spain).

### User Management

- **Authentication**: Simple password-based login (no username)
- **User Types**:
  - Waiters: Take orders and bring food/drinks to the table (mobile)
  - Barman: Prepare drinks, handle payments (tablet)
  - Cooks: Prepare food orders (mobile)
- **User Settings**: Name, role selection, preferences

### Order Management

- **Create Orders**: Add items by table number
- **Track Status**: cancelled, drinks served, food served, paid
- **Real-time Updates**: Orders appear/disappear automatically
- **Timing**: Stopwatch for preparation time
- **Filtering**: By type (food/drink)
- **Notifications**: Sound alerts for relevant staff (waiter: food ready, barman: new drink order, cook: new food order)
- **Edit Orders**: Modify quantities, add notes, remove items

### Product Management

- **Product Catalog**: Searchable list of items
- **Add New Products**: On-the-fly during order creation
- **Categorization**: Food vs. drinks
- **Customization**: Colors, emoji for quick visual identification

## Screens & Workflows

### Login Screen

- Password entry (shared password for venue)
- Name input
- Role selection (waiter/cook/barman)

### Home Screen (Active Orders)

- **Order Cards**:
  - Table number
  - Items with quantities
  - Waiting time stopwatch
  - Preparation timer
  - Status indicators
  - Quick action buttons (mark ready, etc.)
- **Filters**: All/Food/Drinks
- **Sorting**: By oldest, table, status
- Mute notifications
- Online status/last updated
- User name -> link to user settings

### New Order Flow

- Table selection
- Product search/selection with quantities
- Add notes per product
- Quick-create new products
- Order summary & confirmation

### Order Detail/Edit Screen

- **View Modes**: All items, food only, drinks only
- **Status Controls**: Mark ready, served, paid, cancelled
- **Edit Mode**: Update quantities, add/remove products, add notes
- **Payment**: Calculate and show total

## Data Models

```typescript
type User = {
  id: string
  name: string // unique
  role: 'waiter' | 'cook' | 'barman'
  preferences?: {
    notificationsEnabled: boolean
  }
}

type Product = {
  id: string
  name: string // unique
  price: number
  type?: 'food' | 'drink'
  color?: string
  emoji?: string
}

type Order = {
  id: string
  tableNumber: string
  createdBy: string
  items: {
    product: Product // full copy to avoid updating old orders
    amount: number
    notes?: string
  }[]
  cancelledAt?: Date
  paidAt?: Date
  drinksReadyAt?: Date
  foodReadyAt?: Date
  createdAt: Date

  // Calculated fields
  status: 'new' | 'drinks-served' | 'food-served' | 'paid' | 'cancelled'
  totalAmount: number
}
```

## Technical Architecture

TypeScript, Next.js, Tailwind CSS, Supabase.
