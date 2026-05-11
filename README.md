# Könyvtári Kölcsönző Nyilvántartó Rendszer

Könyvtári kölcsönző-nyilvántartó szoftver, amely lehetővé teszi könyvek és multimédia anyagok kölcsönzésének kezelését.

## Technológiai Stack

| Réteg | Technológia |
| --- | --- |
| Frontend | Angular 21, Bootstrap 5 |
| Backend | TypeScript, Express.js, TypeORM |
| Adatbázis | PostgreSQL |
| Autentikáció | JWT (JSON Web Token) |

## Előfeltételek

- **Node.js** v20+ ([letöltés](https://nodejs.org/))
- **PostgreSQL** v14+ ([letöltés](https://www.postgresql.org/download/))
- **npm** (Node.js-sel együtt települ)

## Telepítés és Beüzemelés

### 1. PostgreSQL adatbázis létrehozása

Nyiss egy terminált vagy a pgAdmin-t, és hozd létre az adatbázist:

```sql
CREATE DATABASE konyvtar;
```

> Az alapértelmezett beállítások: host=localhost, port=5432, user=postgres, password=postgres.
> Ha más beállításokat használsz, módosítsd a `backend/src/data-source.ts` fájlt vagy használj környezeti változókat.

### 2. Backend telepítés és indítás

```bash
cd backend
npm install
npm run dev
```

A szerver a [http://localhost:3000](http://localhost:3000) címen indul el.

**Első indításkor** automatikusan létrejön:

- Az admin felhasználó: `admin` / `admin123`
- Az alapértelmezett beállítások (max 6 kölcsönzés, 30 napos határidő)

### 3. Frontend telepítés és indítás

Nyiss egy **új terminált**:

```bash
cd frontend
npm install
ng serve
```

Az alkalmazás a [http://localhost:4200](http://localhost:4200) címen érhető el.

### 4. Bejelentkezés

Nyisd meg a böngészőben: [http://localhost:4200](http://localhost:4200)

Alapértelmezett belépési adatok:

- **Felhasználónév:** `admin`
- **Jelszó:** `admin123`

## Funkciók

### Tagnyilvántartás

- Új tagok felvétele (név, telefon, személyig. szám, lakcím)
- Tagok keresése név, személyigazolvány szám vagy azonosító alapján
- Tag adatainak módosítása
- Tag inaktiválása (soft delete)

### Készletnyilvántartás

- Könyvek és multimédia anyagok (CD, kazetta, kotta) nyilvántartása
- Keresés cím és szerző szerint
- Szűrés típus és státusz alapján
- Új tételek felvétele, szerkesztése
- Tételek selejtezése

### Kölcsönzés

- Tag kikeresése, aktív kölcsönzéseinek megtekintése
- Szabad tételek keresése és kölcsönzése
- Maximális kölcsönzési limit ellenőrzés (alapértelmezetten 6 tétel)
- Kölcsönzés befejezése (visszahozás)

### Késések lekérdezése

- Lejárt kölcsönzések listázása (alapértelmezetten 30 nap után)
- Kölcsönző adatai, kölcsönzés dátuma, számított késés megjelenítése

### Beállítások (admin)

- Maximális kölcsönzések számának módosítása
- Késési határidő módosítása

## Környezeti változók (opcionális)

A backend a következő környezeti változókat támogatja:

| Változó | Alapértelmezett | Leírás |
| --- | --- | --- |
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_USERNAME` | postgres | Adatbázis felhasználó |
| `DB_PASSWORD` | postgres | Adatbázis jelszó |
| `DB_DATABASE` | konyvtar | Adatbázis neve |
| `JWT_SECRET` | konyvtar-secret-key-2024 | JWT titkosító kulcs |
| `PORT` | 3000 | Szerver port |

## Projekt Struktúra

```text
IREbeadando/
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── entity/           # TypeORM entitások
│   │   ├── routes/           # API végpontok
│   │   ├── middleware/       # JWT auth middleware
│   │   ├── data-source.ts    # Adatbázis konfiguráció
│   │   ├── seed.ts           # Kezdeti adatok
│   │   └── index.ts          # Szerver belépési pont
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Angular 21 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Angular komponensek
│   │   │   ├── services/     # HTTP szolgáltatások
│   │   │   ├── models/       # TypeScript interfészek
│   │   │   ├── guards/       # Auth guard
│   │   │   └── interceptors/ # JWT interceptor
│   │   └── styles.css        # Globális stílusok
│   ├── angular.json
│   └── package.json
├── .gitignore
└── README.md
```
