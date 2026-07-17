# Ecommerce — Panel de administración de productos

Aplicación web fullstack para gestionar el catálogo de productos de una tienda.

**Deploy:** https://ecommerce-syxz.vercel.app/

## Stack

- **Frontend y backend:** Next.js 16 (App Router) + TypeScript
- **Estilos:** Tailwind CSS 4
- **Base de datos:** PostgreSQL (Neon, gestionado desde Vercel Storage)
- **ORM:** Prisma 7 con driver adapter `pg`
- **Validación:** Zod (mismo schema en cliente y servidor)
- **Testing:** Vitest

## Funcionalidades

- CRUD Completo: listar, crear, editar y eliminar productos.
- Filtros combinables por estado y categoría, más búsqueda por nombre con debounce de 300 ms.
- Paginación tradicional con selector de tamaño de página.
- Métricas agregadas: total de productos activos y valor total del inventario (asumiendo `stock: null` como 0, mismo supuesto documentado en el código).
- Validación de formularios en cliente con Zod y mensajes de error por campo.
- Confirmación explícita antes de eliminar.
- Manejo de estados de carga, error, lista vacía y mutaciones fallidas con toasts.
- Manejo consistente de valores `null` o faltantes en toda la UI (`Sin control`, `—`, etc.).

## API

| Método | Ruta                | Descripción              | Códigos            |
| ------ | ------------------- | ------------------------ | ------------------ |
| GET    | `/api/products`     | Lista con filtros y pag. | 200, 422           |
| POST   | `/api/products`     | Crea un producto         | 201, 422           |
| PATCH  | `/api/products/:id` | Actualización parcial    | 200, 400, 404, 422 |
| DELETE | `/api/products/:id` | Elimina un producto      | 204, 400, 404      |

Los errores devuelven un cuerpo consistente:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Payload inválido", "details": {} } }
```

## Estructura del proyecto

```
src/
  app/
    api/products/          Route Handlers (GET, POST, PATCH, DELETE)
    page.tsx               Página principal del panel
  components/
    products/              Componentes del módulo de productos
    ui/                    Primitivas reutilizables (Button, Dialog, Input, etc.)
  domain/products/         Lógica de negocio: schemas, queries, métricas, DTOs
  lib/
    api/                   Cliente HTTP del frontend y helpers de respuesta
    db/                    Singleton de Prisma con driver adapter pg
prisma/
  schema.prisma            Modelo Product
  migrations/              Migraciones versionadas
  seeds/                   Seeder con 15 productos de ejemplo
  utils/products.ts        Datos de seed
```

## Cómo correr el proyecto en local

### 1. Requisitos

- Node.js 20 o superior
- npm
- Una base de datos PostgreSQL (local o remota). Para Neon/Vercel Postgres solo se necesita la URL de conexión.

### 2. Instalación

```bash
npm install
```

Esto ejecuta `prisma generate` automáticamente vía `postinstall`.

### 3. Variables de entorno

Copiar `.env.example` a `.env` y completar la URL:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### 4. Migrar y seedear

```bash
npx prisma migrate deploy
npx tsx prisma/seeds/productSeeder.ts
```

### 5. Levantar el dev server

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npx vitest run
```

Hay 8 tests unitarios en 3 archivos, cubriendo:

- Validación de payloads (casos inválidos y vacíos).
- Validación de IDs (no numéricos, no positivos, válidos).
- Cálculo de métricas (stock `null` tratado como 0, arrays vacíos).
- Defaults del query string de paginación y filtros.

## Decisiones técnicas

**Next.js API Routes en lugar de FastAPI separado.** El enunciado permite elegir, y mantener una sola app reduce la superficie de despliegue y permite compartir tipos entre cliente y servidor. Como hay una sola base de datos y un solo dominio, separar el backend añade fricción sin un beneficio claro para este caso.

**PostgreSQL gestionado (Neon) en lugar de SQLite.** SQLite es excelente en local pero su filesystem no es viable en funciones serverless. Neon ofrece un tier gratis generoso, conexión SSL, y la variable `POSTGRES_PRISMA_URL` con pgbouncer que Prisma soporta nativamente.

**Driver adapter `pg` en lugar de `better-sqlite3`.** Prisma 7 recomienda el patrón de driver adapter para mejor rendimiento y compatibilidad con entornos serverless. Con `pg` evitamos también problemas de binarios nativos en el build de Vercel.

**Mismo schema de Zod en cliente y servidor.** El archivo `src/domain/products/schemas.ts` es la única fuente de verdad para validar payloads. El cliente lo usa para feedback inmediato en formularios, y el servidor lo usa dentro de los Route Handlers. Esto evita reglas divergentes.

**Paginación tradicional en lugar de scroll infinito.** Con el tamaño de catálogo esperado (decenas a pocos miles de productos), la paginación es más predecible, más fácil de testear y permite saltar a una página concreta. El scroll infinito obliga a cargar todo el dataset en memoria en el cliente para soportar "volver a una posición anterior".

**Componentes primitivos propios.** Button, Dialog, Input, Select, etc. viven en `src/components/ui/` y consumen Radix UI donde hace falta (Dialog). Tener los primitivos propios facilita ajustar el diseño sin luchar contra una librería externa, y deja claro qué API expone cada componente.

**Confirmación explícita antes de eliminar.** La operación es destructiva e irreversible, así que el costo de un click extra es mucho menor que el de un borrado accidental.

## Supuestos asumidos

- **`stock: null` significa "sin control de inventario"** y se trata como 0 al calcular el valor del inventario. La UI lo muestra como "Sin control" para que quede explícito.
- **Las categorías se derivan de los productos existentes.** No hay tabla de categorías porque el enunciado no lo pide y el dominio no sugiere un conjunto cerrado.
- **El campo `status` es un string libre** (`'active' | 'inactive'`) en vez de un enum de Postgres, para mantener flexibilidad y simplificar migraciones. La validación de Zod restringe los valores permitidos.
- **Los timestamps `createdAt` y `updatedAt` los gestiona Prisma automáticamente** con `@default(now())` y `@updatedAt`.
- **El deploy es en Vercel**, donde la app corre como funciones serverless. Por eso se eligió PostgreSQL gestionado en lugar de SQLite.

## Qué mejoraría con más tiempo

- **Tests de integración de la API.** Ahora los tests son unitarios sobre la lógica de dominio. Agregaría tests con `next/test` o `undici` que peguen contra los Route Handlers con una DB de prueba, cubriendo el ciclo CRUD completo.
- **Paginación por cursor.** Para catálogos muy grandes, la paginación por offset se degrada. Cambiar a cursor (`where: { id: { gt: lastId } }`) sería más escalable.
- **Búsqueda full-text con `pg_trgm` o `tsvector`.** El `contains` actual hace un `LIKE` con prefijo, que no escala bien ni soporta búsqueda en `category`. Postgres tiene herramientas mejores para esto.
- **Soft delete.** En vez de `DELETE` físico, marcar `deletedAt` permitiría restaurar productos y mantener historial.
- **Autenticación.** El panel está abierto. Agregaría NextAuth o middleware con sesión antes de exponerlo a internet.
- **Internacionalización.** Los mensajes están hardcodeados en español. Usar `next-intl` o similar facilitaría agregar otros idiomas.
- **Histórico en PDF.** Generación de una impresión o informe en PDF, para mantener un historial o un formato diferente de presentación para los productos.
- **Optimistic updates** en mutaciones para una UI más responsiva.
- **Rate limiting y logs estructurados** en la API.
