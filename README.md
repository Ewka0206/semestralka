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

## Sestavení (build)

### Frontend

```powershell
cd frontend
npm run build
```

Výstup je ve složce `frontend/dist/`. Statické soubory lze nasadit na libovolný webový server nebo CDN.

### Backend

```powershell
cd backend
.\mvnw package -DskipTests
```

Výstupní JAR je `backend/target/sailconnect-backend-0.0.1-SNAPSHOT.jar`. Spuštění:

```powershell
java -jar backend/target/sailconnect-backend-0.0.1-SNAPSHOT.jar
```

> **Poznámka:** V produkčním nasazení je potřeba upravit `application.properties` – zejména databázové přihlašovací údaje a cestu pro upload obrázků (`upload.dir`).

---

## Funkce

- **Homepage**: seznam plaveb + filtr (destinace / země, typ plavby, datum, max cena) aktivovaný tlačítkem Hledat
- **Detail plavby**: hero obrázek, popis, highlights, počet volných míst, rezervační formulář; vlastník nabídky může nabídku upravit nebo smazat, vlastní nabídku si nelze zarezervovat
- **Vytvoření / editace nabídky**: formulář s nahráváním obrázku (jpg, png, webp)
- **Můj přehled**: moje rezervace (detail, editace, zrušení) a moje nabídky (detail, editace, smazání)
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
| GET | `/api/bookings/{id}` | Detail rezervace |
| POST | `/api/bookings` | Vytvoření rezervace |
| PUT | `/api/bookings/{id}` | Úprava rezervace |
| DELETE | `/api/bookings/{id}` | Zrušení rezervace |
| GET | `/api/trip-types` | Číselník typů plavby |
| POST | `/api/upload` | Nahrání obrázku (multipart, max 10 MB) |
| GET | `/api/users/{id}` | Detail uživatele |
| PUT | `/api/users/{id}` | Úprava uživatele |

---

## Obrázky

Demo data (DataSeeder) odkazují na statické obrázky v `frontend/public/images/trips/`.

Uživatelé nahrávají vlastní obrázky přes formulář – soubory se ukládají do `frontend/public/images/uploads/`. Povolené formáty: jpg, png, webp (max 10 MB).

---

## Testy

### Frontend

Testy jsou v `frontend/src/test/` (Vitest + jsdom). Celkem 5 souborů, 23 testů:

| Soubor | Co testuje |
|--------|------------|
| `trips.repo.test.ts` | API volání repozitáře plaveb (`addUserTrip`, `getUserTrips`, `updateUserTrip`, `deleteUserTrip`) – `apiFetch` mockováno přes `vi.mock` |
| `bookings.repo.test.ts` | API volání repozitáře rezervací (`addBooking`, `getBookings`, `updateBooking`, `deleteBooking`) – stejný přístup |
| `trips.utils.test.ts` | Logika filtru plaveb (`applyTripFilters`) včetně vyhledávání podle země |
| `createOffer.schema.test.ts` | Zod validace formuláře pro vytvoření/editaci nabídky |
| `booking.schema.test.ts` | Zod validace formuláře pro rezervaci |

```powershell
cd frontend
npm run test:run    # jednorázově
npm run test        # watch režim
```

### Backend

Testy jsou v `backend/src/test/java/com/sailconnect/` (JUnit 5 + Mockito). Celkem 4 soubory, 28 testů:

| Soubor | Co testuje |
|--------|------------|
| `service/AuthServiceTest.java` | Login (správné/špatné heslo, neznámý email), registrace (nový uživatel, duplicitní email, výchozí role), úprava profilu |
| `service/TripServiceTest.java` | Výpis plaveb (všechny / filtr podle vlastníka), detail (nalezen / 404), úprava polí, smazání (existující / 404) |
| `service/BookingServiceTest.java` | Výpis rezervací (všechny / filtr podle uživatele), detail (nalezen / 404), úprava kontaktu a počtu míst, smazání (existující / 404) |
| `exception/GlobalExceptionHandlerTest.java` | Bean Validation chyby (400 s mapou polí), ResponseStatusException, IllegalArgumentException, generická 500 |

Repozitáře jsou mockované přes Mockito – databáze není potřeba.

```powershell
cd backend
.\mvnw test
```

### API testy – Postman

Kolekce `SailConnect.postman_collection.json` (v kořeni repozitáře) pokrývá všech 16 endpointů včetně chybových stavů.

**Import:** Postman → Import → vybrat soubor `SailConnect.postman_collection.json`

Kolekce používá proměnné `baseUrl` (výchozí `http://localhost:8080/api`), `userId`, `tripId` a `bookingId`. Proměnné `userId`, `tripId` a `bookingId` se automaticky plní z odpovědí – pro plný průchod spouštěj requesty v tomto pořadí:

1. Auth / Registrace
2. Plavby / Vytvoření plavby
3. Rezervace / Vytvoření rezervace
4. zbytek libovolně

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
| `*` | 404 – Stránka nenalezena |
