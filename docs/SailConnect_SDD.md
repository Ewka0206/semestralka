**SDD – Software Design Document**

**Sail Connect**

|  |  |
| --- | --- |
| Verze | 1.1 |
| Datum | 2026-05-28 |
| Autor | Eva Kratěnová |

---

## 1. Architektura aplikace

### 1.1 Přehled

Systém je navržen jako monolitická aplikace s třívrstvou architekturou — jediný backendový proces (Spring Boot) obsluhuje všechny doménové oblasti (auth, trips, bookings, users, upload) a komunikuje s jednou relační databází. Frontend je samostatná SPA, která backend volá přes REST API.

```
Prezentační vrstva    React 19 SPA (TypeScript + Vite)     http://localhost:5173
                             |
              HTTP REST /api/** + Authorization: Bearer <JWT>
                             |
Aplikační vrstva      Spring Boot 3.3 REST API (Java 21)   http://localhost:8080
                             |
              Spring Data JPA / Hibernate
                             |
Datová vrstva         MariaDB (port 3306)  |  databáze: sailconnect
```

### 1.2 Backend – Spring Boot

#### 1.2.1 Package struktura

```
com.sailconnect/
+-- SailConnectApplication.java       - vstupní bod
+-- config/
|   +-- AppConfig.java                - BCryptPasswordEncoder bean, JWT konfigurace
|   +-- CorsConfig.java               - CORS povolení pro frontend
+-- controller/
|   +-- AuthController.java           - POST /api/auth/login, register
|   +-- TripController.java           - CRUD /api/trips, GET /api/trips/search
|   +-- BookingController.java        - CRUD /api/bookings
|   +-- UserController.java           - GET/PUT /api/users/{id}
|   +-- TripTypeController.java       - GET /api/trip-types
|   +-- CountryController.java        - GET /api/countries
|   +-- UploadController.java         - POST /api/upload
+-- service/
|   +-- AuthService.java
|   +-- TripService.java
|   +-- BookingService.java
+-- repository/
|   +-- UserRepository.java / TripRepository.java
|   +-- BookingRepository.java / TripTypeDefRepository.java
|   +-- CountryRepository.java
+-- model/
|   +-- User.java / Trip.java / Booking.java / TripTypeDef.java / Country.java
|   +-- UserRole.java                 - enum: CREW, CAPTAIN
|   +-- TripType.java                 - enum: RELAX, ADVENTURE, TRAINING
|   +-- StringListConverter.java      - JPA converter: List<String> <-> JSON
+-- dto/
|   +-- LoginRequest.java / RegisterRequest.java
|   +-- UpdateUserRequest.java / UserResponse.java / ErrorResponse.java
+-- exception/
|   +-- GlobalExceptionHandler.java   - @RestControllerAdvice
+-- data/
    +-- DataSeeder.java               - ApplicationReadyEvent listener
```

#### 1.2.2 Vzory použité v backendu

**Error handling – jednotný formát:**

Každá chyba → GlobalExceptionHandler → `ErrorResponse { status, message, errors }`

**Dvouvrstvá validace:**

```
@Valid na @RequestBody (Bean Validation)
  -> MethodArgumentNotValidException -> 400 s mapou chyb per-field
Null-safety v service metodách
  -> ResponseStatusException(BAD_REQUEST) pro null email/heslo
```

**JWT autentizace:**

Po přihlášení server vydá JWT token (HMAC-SHA256, platnost 24 h). Klient token ukládá do `localStorage` a přikládá ho ke každému chráněnému požadavku v hlavičce `Authorization: Bearer <token>`.

### 1.3 Frontend – architektura

#### 1.3.1 Struktura

```
frontend/src/
+-- components/forms/FormError.tsx   - inline chybová hláška pole
+-- features/
|   +-- auth/
|   |   +-- AuthContext.tsx          - React Context (user, login/logout)
|   |   +-- repo.ts / types.ts / i18n.ts
|   +-- bookings/
|   |   +-- repo.ts / schemas.ts / types.ts
|   +-- trips/
|       +-- repo.ts / filters.ts / useTripTypes.ts / types.ts
+-- lib/api.ts                       - apiFetch (base fetch + JWT Bearer token)
+-- pages/
|   +-- HomePage.tsx / TripDetailPage.tsx
|   +-- CreateOfferPage.tsx / EditOfferPage.tsx
|   +-- BookingDetailPage.tsx / EditBookingPage.tsx
|   +-- DashboardPage.tsx / LoginPage.tsx / RegisterPage.tsx
|   +-- EditUserPage.tsx / NotFoundPage.tsx
+-- styles/global.css
```

#### 1.3.2 Routovací strom

```
/                    -> HomePage
/trips/:tripId       -> TripDetailPage
/login               -> LoginPage
/register            -> RegisterPage
/dashboard           -> DashboardPage
/offers/new          -> CreateOfferPage
/offers/:id/edit     -> EditOfferPage
/bookings/:id        -> BookingDetailPage
/bookings/:id/edit   -> EditBookingPage
/me                  -> UserDetailPage (profil; redirect na login)
/me/edit             -> EditUserPage
*                    -> NotFoundPage
```

---

## 2. Návrh UI – wireframes

Tato kapitola obsahuje wireframy klíčových obrazovek aplikace. Wireframy zachycují rozložení prvků, navigaci a hlavní interakce uživatele s aplikací bez detailního vizuálního stylu.

---

## 3. Návrh DB

### 3.1 Popis tabulek

**Tabulka users**

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | VARCHAR(36) | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (BCrypt) |
| name | VARCHAR(255) | NOT NULL |
| role | ENUM(CREW,CAPTAIN) | NOT NULL, DEFAULT CREW |
| created_at | VARCHAR(30) | NOT NULL (ISO 8601) |
| updated_at | VARCHAR(30) | NOT NULL (ISO 8601) |

**Tabulka trips**

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | VARCHAR(64) | PK |
| title | VARCHAR(255) | NOT NULL |
| location | VARCHAR(255) | NOT NULL |
| country | VARCHAR(255) | |
| type | ENUM(RELAX,ADVENTURE,TRAINING) | NOT NULL |
| start_date | VARCHAR(30) | NOT NULL |
| end_date | VARCHAR(30) | NOT NULL |
| price_czk | INT | |
| capacity | INT | |
| booked | INT | DEFAULT 0 |
| skipper_included | BOOLEAN | DEFAULT false |
| highlights | TEXT | (JSON array) |
| description | TEXT | |
| image_url | VARCHAR(255) | |
| owner_user_id | VARCHAR(36) | FK → users.id |

**Tabulka bookings**

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | VARCHAR(36) | PK |
| trip_id | VARCHAR(64) | NOT NULL, FK → trips.id |
| user_id | VARCHAR(36) | FK → users.id |
| contact_name | VARCHAR(255) | NOT NULL |
| contact_email | VARCHAR(255) | NOT NULL |
| seats | INT | |
| created_at | VARCHAR(30) | NOT NULL |

Unikátní constraint `(user_id, trip_id)` zajišťuje, že jeden uživatel může mít pro danou plavbu nejvýše jednu rezervaci (upsert logika).

**Tabulka trip_type_def**

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | BIGINT | PK, AUTO_INCREMENT |
| code | VARCHAR(50) | UNIQUE, NOT NULL |
| label | VARCHAR(255) | NOT NULL |

**Tabulka country**

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | BIGINT | PK, AUTO_INCREMENT |
| name | VARCHAR(255) | UNIQUE, NOT NULL |

### 3.2 ER diagram

### 3.3 Class diagram

Klíčové závislosti:

```
AuthController    -> AuthService    -> UserRepository
TripController    -> TripService    -> TripRepository
BookingController -> BookingService -> BookingRepository + TripRepository
UserController    -> AuthService    -> UserRepository
```

Všechny chyby → GlobalExceptionHandler (`@RestControllerAdvice`)

---

## 4. Návrh API

REST API aplikace SailConnect je navrženo bezstavově. Všechny endpointy vrací data ve formátu JSON s hlavičkou `Content-Type: application/json`. Autentizace probíhá přes hlavičku `Authorization: Bearer <token>` s JWT tokenem vydaným při přihlášení nebo registraci. Základní URL serveru je `http://localhost:8080`. Při validační chybě, neexistujícím záznamu nebo konfliktu vrací server jednotnou strukturu `ErrorResponse` s HTTP stavovým kódem, lidsky čitelnou zprávou a volitelnou mapou chyb pro jednotlivá pole.

### 4.1 Přehled endpointů

| Skupina | Metoda | URL | Popis | Auth |
| --- | --- | --- | --- | --- |
| Autentizace | POST | /api/auth/login | Přihlášení uživatele | Ne |
| Autentizace | POST | /api/auth/register | Registrace nového uživatele | Ne |
| Uživatelé | GET | /api/users/{id} | Detail uživatele | Bearer |
| Uživatelé | PUT | /api/users/{id} | Úprava profilu uživatele | Bearer |
| Výlety | GET | /api/trips | Seznam všech výletů | Ne |
| Výlety | GET | /api/trips/search | Filtrované vyhledávání výletů | Ne |
| Výlety | GET | /api/trips/{id} | Detail výletu | Ne |
| Výlety | POST | /api/trips | Vytvoření nového výletu | Bearer |
| Výlety | PUT | /api/trips/{id} | Úprava výletu | Bearer |
| Výlety | DELETE | /api/trips/{id} | Smazání výletu | Bearer |
| Rezervace | GET | /api/bookings | Seznam rezervací uživatele | Bearer |
| Rezervace | GET | /api/bookings/{id} | Detail rezervace | Bearer |
| Rezervace | POST | /api/bookings | Vytvoření / aktualizace rezervace | Bearer |
| Rezervace | PUT | /api/bookings/{id} | Úprava rezervace | Bearer |
| Rezervace | DELETE | /api/bookings/{id} | Zrušení rezervace | Bearer |
| Typy výletů | GET | /api/trip-types | Číselník typů výletů | Ne |
| Státy | GET | /api/countries | Seznam zemí pro filtr | Ne |
| Upload | POST | /api/upload | Nahrání obrázku | Bearer |

### 4.2 Společná schémata

Při jakékoliv chybě (HTTP 400, 401, 403, 404, 409 apod.) vrací server jednotnou strukturu `ErrorResponse`. Pole `errors` je vyplněno pouze u validačních chyb a obsahuje mapu název pole → chybová zpráva.

**ErrorResponse**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "ErrorResponse",
  "type": "object",
  "properties": {
    "status":  { "type": "integer", "description": "HTTP stavový kód" },
    "message": { "type": "string",  "description": "Lidsky čitelný popis chyby" },
    "errors":  {
      "type": ["object", "null"],
      "description": "Mapa pole → chybová zpráva (pouze při validační chybě 400)",
      "additionalProperties": { "type": "string" }
    }
  },
  "required": ["status", "message"]
}
```

**Příklad odpovědi při validační chybě:**

```json
{
  "status": 400,
  "message": "Validační chyba",
  "errors": {
    "email": "Neplatný formát e-mailu",
    "password": "Heslo musí mít alespoň 6 znaků"
  }
}
```

### 4.3 Autentizace – /api/auth

Modul Autentizace zajišťuje registraci nových uživatelů a přihlášení stávajících. Po úspěšné autentizaci server vrací JWT token spolu s reprezentací uživatele. Klient token uloží do `localStorage` a přikládá ho v hlavičce `Authorization: Bearer <token>` ke všem chráněným požadavkům.

| Metoda | URL | Popis | HTTP kódy |
| --- | --- | --- | --- |
| POST | /api/auth/login | Přihlášení uživatele | 200, 400, 401 |
| POST | /api/auth/register | Registrace nového uživatele | 201, 400, 409 |

**LoginRequest – POST /api/auth/login**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "LoginRequest",
  "type": "object",
  "properties": {
    "email":    { "type": "string", "format": "email", "description": "E-mailová adresa uživatele" },
    "password": { "type": "string", "minLength": 1,    "description": "Heslo uživatele" }
  },
  "required": ["email", "password"],
  "additionalProperties": false
}
```

**Příklad požadavku:**

```json
{ "email": "jan.novak@example.com", "password": "tajneheslo" }
```

**RegisterRequest – POST /api/auth/register**

Pole `role` je volitelné – pokud chybí, použije se výchozí role `crew`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "RegisterRequest",
  "type": "object",
  "properties": {
    "name":     { "type": "string", "minLength": 1,                              "description": "Celé jméno uživatele" },
    "email":    { "type": "string", "format": "email",                           "description": "E-mailová adresa (musí být unikátní)" },
    "password": { "type": "string", "minLength": 6,                              "description": "Heslo (min. 6 znaků)" },
    "role":     { "type": ["string", "null"], "enum": ["crew", "captain", null], "description": "Role uživatele; výchozí: crew" }
  },
  "required": ["name", "email", "password"],
  "additionalProperties": false
}
```

**Příklad požadavku:**

```json
{
  "name": "Jan Novák",
  "email": "jan.novak@example.com",
  "password": "tajneheslo",
  "role": "captain"
}
```

**UserResponse – odpověď serveru**

Struktura, kterou server vrací z přihlášení, registrace, detailu uživatele i jeho úpravy. Při přihlášení a registraci je odpověď rozšířena o pole `token`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "UserResponse",
  "type": "object",
  "properties": {
    "id":        { "type": "string", "format": "uuid",      "description": "UUID uživatele" },
    "email":     { "type": "string", "format": "email",     "description": "E-mailová adresa" },
    "name":      { "type": "string",                        "description": "Celé jméno" },
    "role":      { "type": "string", "enum": ["crew", "captain"], "description": "Role uživatele" },
    "createdAt": { "type": "string", "format": "date-time", "description": "Datum vytvoření (ISO 8601)" },
    "updatedAt": { "type": "string", "format": "date-time", "description": "Datum poslední úpravy (ISO 8601)" },
    "token":     { "type": "string",                        "description": "JWT Bearer token (pouze v odpovědi na login/register)" }
  },
  "required": ["id", "email", "name", "role", "createdAt", "updatedAt"]
}
```

**Příklad odpovědi (login/register):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "jan.novak@example.com",
  "name": "Jan Novák",
  "role": "captain",
  "createdAt": "2025-03-01T10:00:00Z",
  "updatedAt": "2025-03-01T10:00:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4.4 Uživatelé – /api/users

Modul Uživatelé poskytuje endpointy pro čtení detailu uživatele a úpravu jeho profilových údajů. Vstupní schéma `UpdateUserRequest` dovoluje částečnou aktualizaci – aktualizují se pouze ta pole, která jsou v požadavku přítomna.

| Metoda | URL | Popis | HTTP kódy |
| --- | --- | --- | --- |
| GET | /api/users/{id} | Detail uživatele (UserResponse) | 200, 401, 404 |
| PUT | /api/users/{id} | Úprava profilu uživatele | 200, 400, 401, 403, 404 |

**UpdateUserRequest – PUT /api/users/{id}**

Všechna pole jsou volitelná. Aktualizují se pouze ta, která jsou v požadavku uvedena.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "UpdateUserRequest",
  "type": "object",
  "properties": {
    "name":     { "type": ["string", "null"],                                    "description": "Nové jméno uživatele" },
    "email":    { "type": ["string", "null"], "format": "email",                 "description": "Nová e-mailová adresa" },
    "password": { "type": ["string", "null"], "minLength": 6,                    "description": "Nové heslo (min. 6 znaků)" },
    "role":     { "type": ["string", "null"], "enum": ["crew", "captain", null], "description": "Nová role uživatele" }
  },
  "additionalProperties": false
}
```

**Příklad požadavku (přejmenování):**

```json
{ "name": "Jan Novák-Změněný" }
```

### 4.5 Nabídky – /api/trips

Skupina endpointů pro správu nabídek. Umožňuje výpis, filtrované vyhledávání, detail, vytvoření, úpravu i smazání. Chráněné operace (POST, PUT, DELETE) vyžadují `Authorization: Bearer <token>`.

| Metoda | URL | Parametry | Popis | HTTP kódy |
| --- | --- | --- | --- | --- |
| GET | /api/trips | `?owner={userId}` (volitelný) | Seznam výletů; filtr podle vlastníka | 200 |
| GET | /api/trips/{id} | – | Detail výletu | 200, 404 |
| POST | /api/trips | – (Bearer required) | Vytvoří nový výlet | 201, 400, 401 |
| PUT | /api/trips/{id} | – (Bearer required) | Aktualizuje výlet | 200, 400, 401, 403, 404 |
| DELETE | /api/trips/{id} | – (Bearer required) | Smaže výlet | 204, 401, 403, 404 |

**Trip (request tělo i odpověď)**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "Trip",
  "type": "object",
  "properties": {
    "id":              { "type": "string",  "description": "UUID výletu (generuje server)" },
    "title":           { "type": "string",  "minLength": 1 },
    "location":        { "type": "string",  "minLength": 1 },
    "country":         { "type": ["string", "null"] },
    "type":            { "type": "string",  "enum": ["RELAX", "ADVENTURE", "TRAINING"] },
    "startDate":       { "type": "string",  "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "endDate":         { "type": "string",  "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "priceCzk":        { "type": "integer", "minimum": 0 },
    "capacity":        { "type": "integer", "minimum": 1 },
    "booked":          { "type": "integer", "minimum": 0 },
    "skipperIncluded": { "type": "boolean" },
    "highlights":      { "type": "array",   "items": { "type": "string" } },
    "description":     { "type": ["string", "null"] },
    "imageUrl":        { "type": ["string", "null"], "format": "uri-reference" },
    "ownerUserId":     { "type": ["string", "null"], "description": "UUID vlastníka; nastavuje server z JWT tokenu při vytvoření" }
  },
  "required": ["title", "location", "type", "startDate", "endDate"]
}
```

**Příklad požadavku (POST):**

```json
{
  "title": "Španělsko – Costa Brava",
  "location": "Barcelona",
  "country": "Španělsko",
  "type": "ADVENTURE",
  "startDate": "2025-07-15",
  "endDate": "2025-07-22",
  "priceCzk": 18500,
  "capacity": 6,
  "skipperIncluded": true,
  "highlights": ["snorkeling", "noční plavba", "tři přístavy"],
  "description": "Týdenní plavba podél pobřeží Costa Brava.",
  "imageUrl": "/images/uploads/barcelon_trip.jpg"
}
```

**Příklad odpovědi (GET /{id}):**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Španělsko – Costa Brava",
  "location": "Barcelona",
  "country": "Španělsko",
  "type": "ADVENTURE",
  "startDate": "2025-07-15",
  "endDate": "2025-07-22",
  "priceCzk": 18500,
  "capacity": 6,
  "booked": 2,
  "skipperIncluded": true,
  "highlights": ["snorkeling", "noční plavba", "tři přístavy"],
  "description": "Týdenní plavba podél pobřeží Costa Brava.",
  "imageUrl": "/images/uploads/barcelon_trip.jpg",
  "ownerUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 4.6 Vyhledávání – /api/trips/search

Endpoint pro server-side filtrování plaveb s podporou stránkování. Všechny parametry jsou volitelné.

| Metoda | URL | Popis | HTTP kódy |
| --- | --- | --- | --- |
| GET | /api/trips/search | Filtrované vyhledávání plaveb | 200 |

**Query parametry:**

| Parametr | Typ | Popis |
| --- | --- | --- |
| q | string | Fulltextové hledání v názvu a místě |
| type | string | Typ plavby (`RELAX`, `ADVENTURE`, `TRAINING`) |
| country | string | Filtr podle země |
| dateFrom | string (YYYY-MM-DD) | Plavby začínající od data |
| dateTo | string (YYYY-MM-DD) | Plavby začínající do data |
| maxPrice | integer | Maximální cena v Kč |
| minFreeSpots | integer | Minimální počet volných míst |
| page | integer | Číslo stránky (výchozí: 0) |
| size | integer | Počet záznamů na stránce (výchozí: 20) |

**Příklad odpovědi:** pole objektů `Trip` (stejná struktura jako §4.5).

### 4.7 Rezervace – /api/bookings

Skupina endpointů pro správu rezervací nabídek. Všechny operace vyžadují `Authorization: Bearer <token>`. Server automaticky aktualizuje počet rezervovaných míst (`trip.booked`) u příslušné nabídky. Endpoint POST implementuje upsert logiku – pokud uživatel pro danou plavbu rezervaci již má, aktualizuje stávající místo vytvoření nové.

| Metoda | URL | Popis | HTTP kódy |
| --- | --- | --- | --- |
| GET | /api/bookings | Seznam rezervací přihlášeného uživatele | 200, 401 |
| GET | /api/bookings/{id} | Detail rezervace | 200, 401, 403, 404 |
| POST | /api/bookings | Vytvoří nebo aktualizuje rezervaci (upsert) | 200/201, 400, 401, 409 |
| PUT | /api/bookings/{id} | Aktualizuje rezervaci | 200, 400, 401, 403, 404 |
| DELETE | /api/bookings/{id} | Zruší rezervaci | 204, 401, 403, 404 |

**Booking (request tělo i odpověď)**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "Booking",
  "type": "object",
  "properties": {
    "id":           { "type": "string",  "description": "UUID rezervace (generuje server)" },
    "tripId":       { "type": "string",  "description": "UUID výletu" },
    "createdAt":    { "type": "string",  "format": "date-time" },
    "seats":        { "type": "integer", "minimum": 1 },
    "contactName":  { "type": "string",  "minLength": 1 },
    "contactEmail": { "type": "string",  "format": "email" },
    "userId":       { "type": ["string", "null"], "description": "UUID uživatele; nastavuje server z JWT tokenu" }
  },
  "required": ["tripId", "seats", "contactName", "contactEmail"]
}
```

**Příklad požadavku (POST):**

```json
{
  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "seats": 2,
  "contactName": "Jana Nováková",
  "contactEmail": "jana.novakova@example.com"
}
```

**Příklad odpovědi:**

```json
{
  "id": "f1e2d3c4-b5a6-7890-fedc-ba9876543210",
  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2025-04-10T14:30:00Z",
  "seats": 2,
  "contactName": "Jana Nováková",
  "contactEmail": "jana.novakova@example.com",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 4.8 Typy plaveb – /api/trip-types

Číselník dostupných typů plaveb – využíván formulářem pro výběr typu při vytváření nebo úpravě plavby. Endpoint je pouze pro čtení a nevyžaduje autentizaci.

| Metoda | URL | Popis | HTTP kód |
| --- | --- | --- | --- |
| GET | /api/trip-types | Vrátí seznam všech dostupných typů | 200 |

**TripTypeDef (odpověď)**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "TripTypeDef",
  "type": "object",
  "properties": {
    "id":    { "type": "integer", "description": "Interní číselné ID (auto-increment)" },
    "code":  { "type": "string",  "description": "Kódové označení typu (RELAX, ADVENTURE, TRAINING)" },
    "label": { "type": "string",  "description": "Zobrazovaný název v UI" }
  },
  "required": ["id", "code", "label"]
}
```

**Příklad odpovědi (GET /api/trip-types):**

```json
[
  { "id": 1, "code": "TRAINING",  "label": "Výcvik" },
  { "id": 2, "code": "ADVENTURE", "label": "Dobrodružství" },
  { "id": 3, "code": "RELAX",     "label": "Rekreace" }
]
```

### 4.9 Státy – /api/countries

Číselník zemí pro filtrování plaveb. Endpoint je pouze pro čtení a nevyžaduje autentizaci. Frontend výsledek cachuje na úrovni modulu.

| Metoda | URL | Popis | HTTP kód |
| --- | --- | --- | --- |
| GET | /api/countries | Vrátí seznam všech zemí | 200 |

**Příklad odpovědi:**

```json
[
  { "id": 1, "name": "Česká republika" },
  { "id": 2, "name": "Chorvatsko" },
  { "id": 3, "name": "Řecko" }
]
```

### 4.10 Nahrávání obrázků – /api/upload

Endpoint pro nahrávání fotografií k nabídkám plaveb. Na rozdíl od ostatních endpointů přijímá data ve formátu `multipart/form-data` (nikoliv JSON). Server soubor uloží a vrátí relativní URL, kterou lze použít jako hodnotu pole `imageUrl` při vytváření nebo úpravě nabídky.

Pole se jmenuje `file`. Povolené formáty: JPG, JPEG, PNG, WEBP.

| Metoda | URL | Tělo | Popis | HTTP kódy |
| --- | --- | --- | --- | --- |
| POST | /api/upload | multipart/form-data (pole `file`) | Nahraje obrázek a vrátí jeho URL | 200, 400, 401 |

**UploadResponse (odpověď 200 OK)**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "UploadResponse",
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "format": "uri-reference",
      "description": "Relativní URL nahraného souboru"
    }
  },
  "required": ["url"]
}
```

**Příklad odpovědi:**

```json
{ "url": "/images/uploads/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg" }
```

---

## 5. Návrh backend akcí

Tato kapitola obsahuje slovní popis kroků jednotlivých backend endpointů, seřazený podle stejné struktury jako kapitola 4. Hlavní toky pro Přihlášení a Vytvoření rezervace jsou navíc doplněny o sekvenční diagramy v sekci 5.7.

### 5.1 Autentizace

#### 5.1.1 Registrace (POST /api/auth/register)

1. `AuthController` přijme `RegisterRequest`, Bean Validation ověří povinná pole a formát e-mailu.
2. `AuthService.register()` zavolá `userRepository.findByEmailIgnoreCase(email)`.
3. Pokud uživatel existuje → vyhodí `ResponseStatusException(409 CONFLICT)`.
4. Heslo se zahashuje přes `BCryptPasswordEncoder.encode(password)`.
5. Vytvoří se nová entita `User` (UUID, role = CREW pokud neuvedeno, `createdAt`/`updatedAt` = aktuální ISO čas).
6. `userRepository.save(user)` → persistuje do MariaDB.
7. Vygeneruje se JWT token (HMAC-SHA256, platnost 24 h).
8. Vrátí se `UserResponse` + `token` s HTTP 201 Created.

#### 5.1.2 Přihlášení (POST /api/auth/login)

1. `AuthController` přijme `LoginRequest`, Bean Validation ověří povinná pole.
2. `AuthService.login()` zavolá `userRepository.findByEmailIgnoreCase(email)`.
3. Pokud uživatel neexistuje → vyhodí `ResponseStatusException(401 Unauthorized)`.
4. Ověření hesla přes `BCryptPasswordEncoder.matches(rawPassword, user.passwordHash)`.
5. Pokud heslo nesouhlasí → 401 Unauthorized.
6. Vygeneruje se JWT token (HMAC-SHA256, platnost 24 h).
7. Vrátí `UserResponse` + `token` s HTTP 200; frontend uloží token do `localStorage` a přesměruje na `/`.

### 5.2 Uživatelé

#### 5.2.1 Úprava uživatele (PUT /api/users/{id})

1. `UserController` ověří JWT token v hlavičce `Authorization`; pokud chybí nebo je neplatný → 401.
2. Porovná ID uživatele z JWT s `{id}` v URL; pokud se neshodují → 403 Forbidden.
3. Bean Validation na `UpdateUserRequest` (formát e-mailu, délka hesla atd.).
4. `AuthService.updateUser()` načte uživatele přes `userRepository.findById(id)`; pokud nenalezen → 404.
5. Pokud přišel nový e-mail, ověří unikátnost (`findByEmailIgnoreCase`) → 409 při kolizi.
6. Pokud přišlo nové heslo, zahashuje ho BCryptem.
7. Aktualizuje pouze přijatá pole, nastaví `updatedAt` na aktuální čas.
8. `userRepository.save(user)`; vrátí `UserResponse` s HTTP 200.

### 5.3 Nabídky plaveb

#### 5.3.1 Vytvoření nabídky plavby (POST /api/trips)

1. `TripController` ověří JWT token; pokud chybí nebo je neplatný → 401.
2. Bean Validation na request body (povinná pole: `title`, `location`, `type`, `startDate`, `endDate`).
3. `TripService.create()` vygeneruje ID plavby, nastaví `ownerUserId` = ID uživatele z JWT, `booked` = 0.
4. Validuje, že `endDate > startDate`; jinak 400.
5. `tripRepository.save(trip)` → persistuje do MariaDB.
6. Vrátí `Trip` s HTTP 201 Created.

#### 5.3.2 Úprava a smazání nabídky (PUT/DELETE /api/trips/{id})

1. Ověření JWT tokenu (jinak 401).
2. `tripRepository.findById(id)`; pokud nenalezeno → 404.
3. Kontrola, že `trip.ownerUserId` se shoduje s ID uživatele z JWT; jinak 403 Forbidden.
4. **PUT:** aktualizace přijatých polí, validace `endDate > startDate`, pokud `capacity` klesne pod `booked` → 400.
5. **PUT:** `tripRepository.save(trip)`, vrátí `Trip` s 200.
6. **DELETE:** `tripRepository.deleteById(id)`, upraví `trip.booked` u příslušných plaveb, vrátí 204 No Content.

#### 5.3.3 Seznam a vyhledávání plaveb (GET /api/trips, GET /api/trips/search, GET /api/trips/{id})

- **GET /api/trips:** `TripController` přijme volitelný query parametr `owner`. `TripService.findAll(owner)`: pokud `owner` zadán → `tripRepository.findByOwnerUserId(owner)`, jinak `findAll()`. Vrátí pole `Trip` s HTTP 200.
- **GET /api/trips/search:** Přijme až 9 parametrů (`q`, `type`, `country`, `dateFrom`, `dateTo`, `maxPrice`, `minFreeSpots`, `page`, `size`). `TripService` sestaví dynamický dotaz (Specification / JPQL) a vrátí stránkovaný výsledek jako pole `Trip` s HTTP 200.
- **GET /api/trips/{id}:** `tripRepository.findById(id)`; pokud nenalezeno → 404. Vrátí `Trip` s HTTP 200. Endpoint je veřejný (bez autentizace).

### 5.4 Rezervace

#### 5.4.1 Vytvoření/aktualizace rezervace (POST /api/bookings)

1. `BookingController` ověří JWT token (jinak 401) a provede Bean Validation na `BookingRequest`.
2. `BookingService.create()` načte trip přes `tripRepository.findById(tripId)`; pokud nenalezeno → 404.
3. Zkontroluje, zda uživatel nemá pro danou plavbu existující rezervaci (`findByUserIdAndTripId`):
   - Pokud existuje → **upsert:** aktualizuje `seats` stávající rezervace, přepočítá `trip.booked`.
   - Pokud neexistuje → ověří kapacitu: `(trip.booked + seats) > trip.capacity` → 400 Bad Request.
4. Vytvoří nebo aktualizuje entitu `Booking` (`userId` = ID z JWT, `createdAt` = zachováno nebo aktuální čas).
5. `bookingRepository.save(booking)`; atomicky aktualizuje `trip.booked += seats` (nebo přepočítá diff) a uloží trip.
6. Vrátí `Booking` s HTTP 201 (nová) nebo 200 (upsert).

#### 5.4.2 Správa rezervací (GET/PUT/DELETE /api/bookings)

Všechny operace vyžadují JWT Bearer token (jinak 401).

- **GET /api/bookings:** Vrátí všechny rezervace přihlášeného uživatele (filtr `userId` z JWT).
- **GET /api/bookings/{id}:** `bookingRepository.findById`; kontrola, že `booking.userId` odpovídá ID z JWT (nebo je uživatel vlastníkem plavby); jinak 403.
- **PUT /api/bookings/{id}:** Kontrola vlastnictví rezervace; pokud se mění `seats`, načte se trip a ověří se kapacita s ohledem na rozdíl oproti původním `seats`; jinak 400. `bookingRepository.save()` + případná úprava `trip.booked`.
- **DELETE /api/bookings/{id}:** Kontrola, že uživatel z JWT je vlastník rezervace nebo vlastník plavby (jinak 403). `bookingRepository.deleteById(id)`, `trip.booked -= booking.seats`, `tripRepository.save(trip)`, vrátí 204.

### 5.5 Číselník typů plaveb

`GET /api/trip-types`: `TripTypeController` zavolá `tripTypeDefRepository.findAll()` a vrátí pole `{id, code, label}`.

Endpoint je veřejný; frontend výsledek cachuje na úrovni modulu (module-level cache).

### 5.6 Státy

`GET /api/countries`: `CountryController` zavolá `countryRepository.findAll()` a vrátí pole `{id, name}`.

Endpoint je veřejný; slouží k naplnění dropdownu v filtrovacím formuláři. DataSeeder vloží 190 zemí při startu aplikace.

### 5.7 Nahrávání obrázků (POST /api/upload)

1. `UploadController` přijme `multipart/form-data` s polem `file`.
2. Validuje content-type (povoleny JPG/PNG/WEBP) a velikost (jinak 400/415).
3. Vygeneruje unikátní název souboru (UUID + původní přípona), uloží do filesystem adresáře `uploads/`.
4. Vrátí JSON `{ url: "/images/uploads/<filename>" }` s HTTP 200.

### 5.8 Sekvenční diagramy

#### 5.8.1 Přihlášení – hlavní tok

Účastníci: `Uživatel → LoginPage → AuthContext → AuthController → AuthService → UserRepository`

1. Uživatel zadá email + heslo, odešle formulář
2. `POST /api/auth/login`
3. `apiFetch('/auth/login')` přes `AuthContext`
4. `login(LoginRequest)` v `AuthService`
5. `findByEmailIgnoreCase(email)` → `Optional<User>`
6. `BCrypt.matches(heslo, hash)` – ověření
7. Vygenerování JWT tokenu
8. `UserResponse + token (200)` → uložení tokenu do `localStorage` → přesměrování na `/`

*[alternativa]* špatné heslo → 401 Unauthorized

#### 5.8.2 Vytvoření/aktualizace rezervace – hlavní tok

Účastníci: `Uživatel → TripDetailPage → BookingController → BookingService → TripRepository → BookingRepository`

1. Uživatel vyplní formulář (počet míst); kontaktní údaje jsou předvyplněny z profilu
2. Zod validace na frontendu
3. `POST /api/bookings` (`Authorization: Bearer <token>`)
4. `@Valid` Bean Validation v controlleru
5. `create(booking)` v `BookingService`
6. `findById(tripId)` → `Trip` (kapacita, booked)
7. `findByUserIdAndTripId` → existující rezervace?
   - Ano → upsert: aktualizace `seats`, přepočet `trip.booked`
   - Ne → zkontroluje volná místa; `save(booking)` + `trip.booked += seats`
8. `Booking 200/201` → zobrazí potvrzení

*[alternativa]* kapacita překročena → 400 Bad Request
