# 🗄️ Database Setup Instructions

## Quick Setup với Neon (Khuyến nghị)

### 1. Tạo Database miễn phí trên Neon

1. Truy cập: https://neon.tech
2. Sign up/Login (GitHub OAuth)
3. Click "Create Project"
4. Chọn region gần nhất (Singapore cho VN)
5. Copy **Connection String** (sẽ có dạng: `postgresql://user:password@xxx.neon.tech/dbname`)

### 2. Cập nhật Connection String

Mở file `.env` và thay đổi `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@xxx.neon.tech/dbname?sslmode=require"
```

hoặc tạo file `.env.local` (gitignore):

```env
DATABASE_URL="connection-string-từ-neon"
```

### 3. Push Schema lên Database

```bash
npx prisma db push
```

### 4. Verify trong Prisma Studio

```bash
npx prisma studio
```

Browser sẽ mở `http://localhost:5555` để xem database.

***

## Alternative: Supabase

1. https://supabase.com → Create Project
2. Settings → Database → Connection string (Session mode)
3. Copy vào `DATABASE_URL`
4. Run `npx prisma db push`

***

## Alternative: Vercel Postgres

1. Deploy project lên Vercel
2. Storage → Create Database → Postgres
3. Auto-set `DATABASE_URL` environment variable
4. Run migrations: `npx prisma db push`

***

## Local Development (Optional)

Run local Postgres với Docker:

```bash
docker run --name imageforge-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/imageforge"
npx prisma db push
```

***

## Troubleshooting

### Connection Error

* Check connection string format
* Ensure firewall allows connection
* For Neon/Supabase: Add `?sslmode=require`

### Migration Failed

* Run `npx prisma db push --force-reset` (⚠️ deletes data)
* Check database permissions

### Prisma Client Error

* Run `npx prisma generate` after schema changes
