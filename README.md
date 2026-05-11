# Könyvtári Kölcsönző Nyilvántartó

Könyvtári szoftver könyvek és multimédia anyagok kezeléséhez.

## Technológia

- **Frontend**: Angular 21, Bootstrap 5
- **Backend**: TypeScript, Express.js, TypeORM
- **Adatbázis**: SQLite (alapértelmezett) / PostgreSQL
- **Auth**: JWT

## Beüzemelés

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

- Az adatbázis (`database.sqlite`) automatikusan létrejön.
- Admin: `admin` / `admin123` (automatikus)
- URL: [http://localhost:3000](http://localhost:3000)

### 2. Frontend

```bash
cd frontend
npm install
ng serve
```

- URL: [http://localhost:4200](http://localhost:4200)

## Funkciók

- Tagnyilvántartás (felvétel, keresés, módosítás)
- Készletkezelés (könyv, CD, kazetta, kotta)
- Kölcsönzés és visszavétel (limit ellenőrzéssel)
- Késések listázása
- Rendszerbeállítások (kölcsönzési limit, határidő)

## Struktúra

- `backend/src`: API, entitások, middleware
- `frontend/src`: Angular komponensek és szolgáltatások
