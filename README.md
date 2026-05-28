# Sail Connect

Sail Connect je fullstack webová aplikace propojující kapitány a posádku. Umožňuje prohlížet nabídky plaveb, filtrovat je, vytvářet vlastní nabídky, spravovat rezervace a upravovat profil.

## Struktura projektu

```
semestralka/
├── backend/   – Spring Boot REST API (Java 21)
├── frontend/  – React + TypeScript SPA (Vite)
└── docs/      – Projektová dokumentace
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
- Spring Security + JWT (HMAC-SHA256)
- SpringDoc OpenAPI 3 (Swagger UI)

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

- **Homepage**: seznam plaveb + filtr podle: typ plavby, stát (číselník), termín od/do, max. cena, min. volných míst — aktivovaný tlačítkem Hledat
- **Detail plavby**: hero obrázek, popis, highlights, počet volných míst; rezervační formulář nebo výzva k registraci pro nepřihlášené; vlastník může plavbu upravit nebo smazat
- **Vytvoření / editace plavby**: formulář s výběrem státu z číselníku a nahráváním obrázku (jpg, png, webp); dostupné pouze pro kapitány
- **Můj přehled**:
  - *Člen posádky*: moje rezervace (detail plavby, úprava počtu míst, zrušení) + promo k přechodu na roli kapitána
  - *Kapitán*: totéž + moje plavby (detail, editace, smazání)
- **Auth**: registrace (volitelně role CREW/CAPTAIN), přihlášení, odhlášení
- **Profil**: detail + editace (jméno, email, heslo, role)
- **Číselníky**: typy plaveb (`trip_type_def`) a státy světa (`country`) načítány z databáze

---

## API dokumentace (Swagger)

Po spuštění backendu je interaktivní dokumentace dostupná na:

**[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

OpenAPI JSON schéma: `http://localhost:8080/v3/api-docs`

Swagger UI umožňuje procházet všechny endpointy, testovat požadavky přímo v prohlížeči a zobrazuje validační pravidla pro každé pole.

---

## Bezpečnost a role

Autentizace probíhá pomocí **JWT Bearer tokenu** (HMAC-SHA256, platnost 24 hodin).

```
POST /api/auth/login → { "token": "eyJ..." }
Každý chráněný request: Authorization: Bearer <token>
```

| Role | Oprávnění |
|------|-----------|
| `CREW` | Prohlížení plaveb, vytváření a správa vlastních rezervací |
| `CAPTAIN` | Vše + vytváření, úprava a mazání vlastních plaveb |

Endpointy pro zápis (`POST`, `PUT`) vyžadují platný JWT token.
Mazání plaveb (`DELETE /api/trips/{id}`) vyžaduje roli `CAPTAIN`.

---

## Architektura backendu

```
com.sailconnect
├── config/          # Bezpečnost, JWT, CORS, OpenAPI konfigurace
├── controller/      # REST endpointy – HTTP mapping, @Valid
├── service/         # Business logika (AuthService, TripService, BookingService)
├── repository/      # Spring Data JPA repozitáře
│   └── TripRepository  ← vlastní @Query: full-text hledání + Pageable stránkování
├── model/           # JPA entity (User, Trip, Booking, Country, TripTypeDef)
├── dto/             # Data Transfer Objects – Java records s validací
│   └── TripRequest  ← anotace @ValidDateRange (vlastní validátor)
├── validation/      # Vlastní validační pravidla
│   ├── ValidDateRange.java      (anotace @interface)
│   └── DateRangeValidator.java  (implementace ConstraintValidator)
├── exception/       # GlobalExceptionHandler → konzistentní ErrorResponse
└── data/            # DataSeeder – inicializace dat při prvním spuštění
```

### Vlastní validátor (`@ValidDateRange`)
Aplikován na `TripRequest` – ověřuje, že `endDate >= startDate`.
Při chybě vrátí HTTP 400 s chybou na poli `endDate`:
```json
{ "status": 400, "message": "Chyba validace", "errors": { "endDate": "Datum ukončení musí být..." } }
```

---

## Monitoring

| Endpoint | Popis |
|----------|-------|
| `GET /actuator/health` | Stav aplikace a DB připojení |
| `GET /actuator/info` | Informace o aplikaci |
| `GET /actuator/metrics` | Metriky (počty požadavků, paměť…) |

---

## REST API (přehled)

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| POST | `/api/auth/login` | Přihlášení |
| POST | `/api/auth/register` | Registrace |
| GET | `/api/trips` | Seznam plaveb (volitelně `?owner=userId`) |
| GET | `/api/trips/search` | Vyhledávání plaveb s filtry (`?q`, `type`, `country`, `dateFrom`, `dateTo`, `maxPrice`, `minFreeSpots`, `page`, `size`) – vrací stránkovaný výsledek |
| GET | `/api/trips/{id}` | Detail plavby |
| POST | `/api/trips` | Vytvoření nabídky |
| PUT | `/api/trips/{id}` | Úprava nabídky |
| DELETE | `/api/trips/{id}` | Smazání nabídky |
| GET | `/api/bookings` | Seznam rezervací |
| GET | `/api/bookings/{id}` | Detail rezervace |
| POST | `/api/bookings` | Vytvoření rezervace |
| PUT | `/api/bookings/{id}` | Úprava rezervace |
| DELETE | `/api/bookings/{id}` | Zrušení rezervace |
| GET    | `/api/trip-types`         | Číselník typů plavby              | ✗          |
| GET    | `/api/countries`          | Číselník zemí světa (190 položek) | ✗          |
| POST   | `/api/upload`             | Nahrání obrázku (max 10 MB)       | ✔ CREW+    |
| GET    | `/api/users/{id}`         | Detail uživatele                  | ✔ CREW+    |
| PUT    | `/api/users/{id}`         | Úprava profilu                    | ✔ CREW+    |
| GET    | `/actuator/health`        | Health check                      | ✗          |

---

## Databáze

Aplikace používá **MariaDB** (port 3306, databáze `sailconnect`). Schéma spravuje Hibernate – při každém startu backendu automaticky vytvoří nebo aktualizuje tabulky (`spring.jpa.hibernate.ddl-auto=update`). Databázi nemusíš zakládat ručně, stačí mít spuštěný MariaDB server.

### JPA entity → tabulky

| Java třída    | Tabulka        | Popis                                                                       |
|---------------|----------------|-----------------------------------------------------------------------------|
| `User`        | `users`        | Uživatelský účet (jméno, email, BCrypt heslo, role `CREW`/`CAPTAIN`)        |
| `Trip`        | `trips`        | Nabídka plavby (destinace, stát, termín, kapacita, rezervace, vlastník)     |
| `Booking`     | `bookings`     | Rezervace míst na plavbě (tripId, userId, počet míst, kontaktní údaje)      |
| `TripTypeDef` | `trip_type_def`| Číselník typů plavby (code: RELAX/TRAINING/ADVENTURE, label: český název)   |
| `Country`     | `country`      | Číselník zemí světa (code: ISO 3166-1 alpha-2, name: český název) – 190 záznamů |

Každá entita má `@Entity` anotaci a primární klíč generovaný jako UUID string v `@PrePersist`.

### Demo data (DataSeeder)

Třída `DataSeeder` (implementuje `CommandLineRunner`) se spustí při prvním startu a vloží do DB:
- **190 zemí světa** (česky, kód ISO) do `country`
- **3 typy plavby** (RELAX, ADVENTURE, TRAINING) do `trip_type_def`
- **19 ukázkových nabídek plaveb** s obrázky z `frontend/public/images/trips/`

Při dalších startech data přeskočí (kontrola `countryRepo.count() == 0` / `tripRepo.count() > 0`).

---

## Obrázky

Demo data (DataSeeder) odkazují na statické obrázky v `frontend/public/images/trips/`.

Uživatelé nahrávají vlastní obrázky přes formulář – soubory se ukládají do `frontend/public/images/uploads/`. Povolené formáty: jpg, png, webp (max 10 MB).

---

## Testy

### Frontend

Testy jsou v `frontend/src/test/` (Vitest + jsdom). Celkem 5 souborů, 24 testů:

| Soubor | Co testuje |
|--------|------------|
| `trips.repo.test.ts` | API volání repozitáře plaveb (`addUserTrip`, `getUserTrips`, `updateUserTrip`, `deleteUserTrip`) |
| `bookings.repo.test.ts` | API volání repozitáře rezervací (`addBooking`, `getBookings`, `updateBooking`, `deleteBooking`) |
| `trips.utils.test.ts` | Logika filtru plaveb (`applyTripFilters`): bez filtrů, typ, datum, cena, stát (přesná shoda), minFreeSpots |
| `createOffer.schema.test.ts` | Zod validace formuláře pro vytvoření/editaci plavby |
| `booking.schema.test.ts` | Zod validace formuláře rezervace (pouze počet míst: min 1, musí být celé číslo) |

```powershell
cd frontend
npm run test:run    # jednorázově
npm run test        # watch režim
```

### Backend

Testy jsou v `backend/src/test/java/com/sailconnect/` (JUnit 5 + Mockito). Celkem 4 soubory, 39 testů:

| Soubor | Testů | Co testuje |
|--------|-------|------------|
| `service/AuthServiceTest.java` | 10 | Login (správné/špatné heslo, neznámý email), registrace (nový uživatel, duplicitní email, výchozí role), úprava profilu |
| `service/TripServiceTest.java` | 12 | Výpis plaveb (všechny / filtr podle vlastníka), detail (nalezen / 404), vyhledávání + stránkování, úprava polí, smazání (existující / 404) |
| `service/BookingServiceTest.java` | 12 | Výpis rezervací (všechny / filtr podle uživatele), detail (nalezen / 404), vytvoření (úspěch / 409 kapacita / 404 plavba), upsert, úprava, smazání (existující / 404) |
| `exception/GlobalExceptionHandlerTest.java` | 5 | Bean Validation chyby (400 s mapou polí), ResponseStatusException, IllegalArgumentException, generická 500 |

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

## Dokumentace

Složka `docs/` obsahuje podrobnou projektovou dokumentaci:

| Soubor | Popis |
|--------|-------|
| [`docs/uzivatelska_prirucka.md`](docs/uzivatelska_prirucka.md) | Uživatelská příručka – registrace, přihlášení, prohlížení plaveb, rezervace, správa nabídek a profilu |
| [`docs/administratorska_prirucka.md`](docs/administratorska_prirucka.md) | Administrátorská příručka – instalace, konfigurace, databáze, nasazení do produkce, řešení problémů |
| [`docs/api_schemas.md`](docs/api_schemas.md) | JSON schémata všech REST API endpointů včetně příkladů požadavků a odpovědí |
| [`docs/SailConnect_SRS.md`](docs/SailConnect_SRS.md) | Specifikace softwarových požadavků (SRS) |
| [`docs/SailConnect_SDD.md`](docs/SailConnect_SDD.md) | Softwarový návrh (SDD) – architektura, databázové schéma, popis API a backend akcí |
| [`docs/produktovy_list.pdf`](docs/produktovy_list.pdf) | Produktový list aplikace |

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
