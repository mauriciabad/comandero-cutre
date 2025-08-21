# Comandero App

Un sistema de gestión de pedidos en tiempo real para restaurantes y bares.

## Características

- **Autenticación de Usuarios**: Autenticación por email y contraseña con selección de rol
- **Gestión de Pedidos en Tiempo Real**: Crear, actualizar y rastrear pedidos en tiempo real
- **Acceso Basado en Roles**: Diferentes vistas y permisos para camareros, cocineros y barmans
- **Diseño Responsivo**: Funciona en dispositivos móviles, tabletas y escritorio
- **Notificaciones**: Alertas de sonido para nuevos pedidos y elementos listos
- **Seguimiento de Pedidos**: Monitorear tiempo de preparación y estado

## Roles de Usuario

- **Camareros**: Toman pedidos en las mesas y sirven comida/bebidas
- **Barman**: Prepara bebidas, maneja pagos
- **Cocineros**: Prepara pedidos de comida

## Stack Tecnológico

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Autenticación, Base de Datos, Tiempo Real)
- Zustand (Gestión de Estado)
- shadcn/ui (Componentes UI)

## Comenzando

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Supabase

### Configuración

1. Clona el repositorio

```bash
git clone https://github.com/yourusername/comandero-cutre.git
cd comandero-cutre
```

2. Instala las dependencias

```bash
npm install
```

3. Crea un archivo `.env.local` en el directorio raíz con tus credenciales de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui
```

4. Configura las tablas de tu base de datos Supabase según el esquema en `lib/supabase.ts`

5. Ejecuta el servidor de desarrollo

```bash
npm run dev
```

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Configuración de Supabase

1. Crea el servicio de autenticación en el dashboard de Supabase
2. Habilita el método de inicio de sesión por Email/Contraseña
3. Crea las siguientes tablas en tu dashboard de Supabase:

### users

- id (uuid, clave primaria, referencia auth.users.id)
- name (text)
- role (text, enum: 'waiter', 'cook', 'barman')
- preferences (json)
- created_at (timestamp with time zone)

### products

- id (uuid, clave primaria)
- name (text)
- price (numeric)
- type (text, enum: 'food', 'drink', null)
- color (text, nullable)
- emoji (text, nullable)
- created_at (timestamp with time zone)

### orders

- id (uuid, clave primaria)
- table_number (text)
- created_by (text)
- items (json)
- cancelled_at (timestamp with time zone, nullable)
- paid_at (timestamp with time zone, nullable)
- drinks_ready_at (timestamp with time zone, nullable)
- food_ready_at (timestamp with time zone, nullable)
- created_at (timestamp with time zone)

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
