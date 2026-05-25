# Sail Connect

Sail Connect je fullstack webová aplikace propojující kapitány a posádku. Umožňuje prohlížet nabídky plaveb, filtrovat je, vytvářet vlastní nabídky, spravovat rezervace a upravovat profil.

## Struktura projektu

```
semestralka/
├── backend/   – Spring Boot REST API (Java 21)
└── frontend/  – React + TypeScript SPA (Vite)
```

## Tech stack

### Frontend
- React 19 + TypeScript
- Vite
- React Router
- React Hook Form + Zod (validace formulářů)
- Vitest + jsdom (unit testy)

### Backend
- Java 21 + Spring Boot 3.3
- Spring Data JPA + Hibernate
- MariaDB
- Spring Security Crypto (BCrypt)

---

## Požadavky

- **Node.js** 18+
- **Java** 21+
- **MariaDB** běžící na `localhost:3306`

---

## Spuštění

### 1. Databáze
Spusť MariaDB a ujisti se, že běží na portu 3306. Databáze `sailconnect` se vytvoří automaticky.

Přihlašovací údaje jsou v `backend/src/main/resources/application.properties`:
```
spring.datasource.username=root
spring.datasource.password=Sail2026
```

### 2. Backend
```powershell
cd backend
.\mvnw spring-boot:run
```
Backend běží na `http://localhost:8080`. Hibernate při startu automaticky vytvoří tabulky a DataSeeder naplní ukázková data.

### 3. Frontend
```powershell
cd frontend
npm install
npm run dev
```
Frontend běží na `http://127.0.0.1:5173`. Požadavky na `/api/**` jsou proxovány na backend.

---

## Funkce

- **Homepage**: seznam plaveb + filtr (destinace / země, typ plavby, datum, max cena) aktivovaný tlačítkem Hledat
- **Detail plavby**: hero obrázek, popis, highlights, počet volných míst, rezervační formulář
- **Vytvoření / editace nabídky**: formulář s nahráváním obrázku (jpg, png, webp)
- **Můj přehled**: moje rezervace a nabídky s možností editace a smazání
- **Auth**: registrace, přihlášení, odhlášení
- **Profil**: detail + editace (jméno, email, role)
- **Číselník typů plavby**: načítán z databáze (`trip_type_def`)

---

## REST API (přehled)

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/auth/login` | Přihlášení |
| POST | `/api/auth/register` | Registrace |
| GET | `/api/trips` | Seznam plaveb (volitelně `?owner=userId`) |
| GET | `/api/trips/{id}` | Detail plavby |
| POST | `/api/trips` | Vytvoření nabídky |
| PUT | `/api/trips/{id}` | Úprava nabídky |
| DELETE | `/api/trips/{id}` | Smazání nabídky |
| GET | `/api/bookings` | Seznam rezervací |
| POST | `/api/bookings` | Vytvoření rezervace |
| PUT | `/api/bookings/{id}` | Úprava rezervace |
| DELETE | `/api/bookings/{id}` | Zrušení rezervace |
| GET | `/api/trip-types` | Číselník typů plavby |
| POST | `/api/upload` | Nahrání obrázku (multipart, max 10 MB) |
| GET | `/api/users/{id}` | Detail uživatele |
| PUT | `/api/users/{id}` | Úprava uživatele |

---

## Obrázky

Statické obrázky plaveb jsou v `frontend/public/images/trips/` ve formátu `.webp`.

Nahrané obrázky se ukládají do `frontend/public/images/uploads/`.

---

## Testy

Testy jsou v `frontend/src/test/`.

```powershell
cd frontend
npm run test:run    # jednorázově
npm run test        # watch režim
```

---

## Routy (přehled)

| Cesta | Stránka |
|-------|---------|
| `/` | Domů – seznam plaveb |
| `/trips/:tripId` | Detail plavby |
| `/login` | Přihlášení |
| `/register` | Registrace |
| `/dashboard` | Můj přehled (chráněné) |
| `/offers/new` | Vytvořit nabídku (chráněné) |
| `/offers/:tripId/edit` | Upravit nabídku (chráněné) |
| `/bookings/:bookingId` | Detail rezervace (chráněné) |
| `/bookings/:bookingId/edit` | Upravit rezervaci (chráněné) |
| `/me` | Profil (chráněné) |
| `/me/edit` | Upravit profil (chráněné) |
