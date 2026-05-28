**SDD – Software Design Document**

**Sail Connect**

|  |  |
| --- | --- |
| Verze | 1.0 |
| Datum | 2026-05-25 |
| Autor | Eva Kratěnová |

1. Architektura aplikace

1.1 Přehled

Systém je navržen jako monolitická aplikace s třívrstvou architekturou — jediný backendový proces (Spring Boot) obsluhuje všechny doménové oblasti (auth, trips, bookings, users, upload) a komunikuje s jednou relační databází. Frontend je samostatná SPA, která backend volá přes REST API.

**Prezentační**** ****vrstva**    React 19 SPA (TypeScript + Vite)  |  http://localhost:5173

| HTTP REST /api/**  |  hlavička X-User-Id

**Aplikační**** ****vrstva**    Spring Boot 3.3 REST API (Java 21)  |  http://localhost:8080

| Spring Data JPA / Hibernate

**Datová**** ****vrstva**    MariaDB (port 3306)  |  databáze: sailconnect

1.2 Backend – Spring Boot

1.2.1 Package struktura

com.sailconnect/

+-- SailConnectApplication.java       - vstupní bod

+-- config/

|   +-- AppConfig.java                - BCryptPasswordEncoder bean

|   +-- CorsConfig.java               - CORS povolení pro frontend

+-- controller/

|   +-- AuthController.java           - POST /api/auth/login, register

|   +-- TripController.java           - CRUD /api/trips

|   +-- BookingController.java        - CRUD /api/bookings

|   +-- UserController.java           - GET/PUT /api/users/{id}

|   +-- TripTypeController.java       - GET /api/trip-types

|   +-- UploadController.java         - POST /api/upload

+-- service/

|   +-- AuthService.java

|   +-- TripService.java

|   +-- BookingService.java

+-- repository/

|   +-- UserRepository.java / TripRepository.java

|   +-- BookingRepository.java / TripTypeDefRepository.java

+-- model/

|   +-- User.java / Trip.java / Booking.java / TripTypeDef.java

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

1.2.2 Vzory použité v backendu

**Error handling – ****jednotný**** ****formát****:**

Každá chyba -> GlobalExceptionHandler -> ErrorResponse { status, message, errors }

**Dvouvrstvá**** ****validace****:**

@Valid na @RequestBody (Bean Validation)

  -> MethodArgumentNotValidException -> 400 s mapou chyb per-field

Null-safety v service metodách

  -> ResponseStatusException(BAD_REQUEST) pro null email/heslo

1.3 Frontend – architektura

1.3.1 Struktura

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

+-- lib/api.ts                       - apiFetch (base fetch + X-User-Id)

+-- pages/

|   +-- HomePage.tsx / TripDetailPage.tsx

|   +-- CreateOfferPage.tsx / EditOfferPage.tsx

|   +-- BookingDetailPage.tsx / EditBookingPage.tsx

|   +-- DashboardPage.tsx / LoginPage.tsx / RegisterPage.tsx

|   +-- EditUserPage.tsx / NotFoundPage.tsx

+-- styles/global.css

1.3.2 Routovací strom

/                    -> HomePage

/trips/:tripId       -> TripDetailPage

/login               -> LoginPage

/register            -> RegisterPage

/dashboard           -> DashboardPage

/offers/new          -> CreateOfferPage

/offers/:id/edit     -> EditOfferPage

/bookings/:id        -> BookingDetailPage

/bookings/:id/edit   -> EditBookingPage

/me                  -> profil (redirect na login)

/me/edit             -> EditUserPage

*                    -> NotFoundPage

2. Návrh UI – wireframes

Tato kapitola obsahuje wireframy klíčových obrazovek aplikace. Wireframy zachycují rozložení prvků, navigaci a hlavní interakce uživatele s aplikací bez detailního vizuálního stylu.

3. Návrh DB

3.1 Popis tabulek

Tabulka users

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | VARCHAR(36) | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (BCrypt) |
| name | VARCHAR(255) | NOT NULL |
| role | ENUM(CREW,CAPTAIN) | NOT NULL, DEFAULT CREW |
| created_at | VARCHAR(30) | NOT NULL (ISO 8601) |
| updated_at | VARCHAR(30) | NOT NULL (ISO 8601) |

Tabulka trips

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | VARCHAR(64) | PK |
| title | VARCHAR(255) | NOT NULL |
| location | VARCHAR(255) | NOT NULL |
| country | VARCHAR(255) |  |
| type | ENUM(RELAX,ADVENTURE,TRAINING) | NOT NULL |
| start_date | VARCHAR(30) | NOT NULL |
| end_date | VARCHAR(30) | NOT NULL |
| price_czk | INT |  |
| capacity | INT |  |
| booked | INT | DEFAULT 0 |
| skipper_included | BOOLEAN | DEFAULT false |
| highlights | TEXT | (JSON array) |
| description | TEXT |  |
| image_url | VARCHAR(255) |  |
| owner_user_id | VARCHAR(36) | FK -> users.id |

Tabulka bookings

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | VARCHAR(36) | PK |
| trip_id | VARCHAR(64) | NOT NULL, FK -> trips.id |
| user_id | VARCHAR(36) | FK -> users.id |
| contact_name | VARCHAR(255) | NOT NULL |
| contact_email | VARCHAR(255) | NOT NULL |
| seats | INT |  |
| created_at | VARCHAR(30) | NOT NULL |

Tabulka trip_type_def

| **Sloupec** | **Typ** | **Omezení** |
| --- | --- | --- |
| id | BIGINT | PK, AUTO_INCREMENT |
| code | VARCHAR(50) | UNIQUE, NOT NULL |
| label | VARCHAR(255) | NOT NULL |

3.2 ER diagram

3.3 Class diagram

Klíčové závislosti:

AuthController -> AuthService -> UserRepository

TripController -> TripService -> TripRepository

BookingController -> BookingService -> BookingRepository + TripRepository

UserController -> AuthService -> UserRepository

Všechny chyby -> GlobalExceptionHandler (@RestControllerAdvice)

4. Návrh API

REST API aplikace SailConnect je navrženo bezstavově. Všechny endpointy vrací data ve formátu JSON s hlavičkou Content-Type: application/json. Autentizace probíhá přes nepovinnou hlavičku X-User-Id, která obsahuje UUID přihlášeného uživatele. Základní URL serveru je http://localhost:8080. Při validační chybě, neexistujícím záznamu nebo konfliktu vrací server jednotnou strukturu ErrorResponse s HTTP stavovým kódem, lidsky čitelnou zprávou a volitelnou mapou chyb pro jednotlivá pole.

4.1 Přehled endpointů

Následující tabulka shrnuje všechny endpointy REST API rozdělené do logických skupin podle doménové oblasti.

| Skupina | Metoda | URL | Popis |
| --- | --- | --- | --- |
| Autentizace | POST | /api/auth/login | Přihlášení uživatele |
| Autentizace | POST | /api/auth/register | Registrace nového uživatele |
| Uživatelé | GET | /api/users/{id} | Detail uživatele |
| Uživatelé | PUT | /api/users/{id} | Úprava profilu uživatele |
| Výlety | GET | /api/trips | Seznam všech výletů |
| Výlety | GET | /api/trips/{id} | Detail výletu |
| Výlety | POST | /api/trips | Vytvoření nového výletu |
| Výlety | PUT | /api/trips/{id} | Úprava výletu |
| Výlety | DELETE | /api/trips/{id} | Smazání výletu |
| Rezervace | GET | /api/bookings | Seznam rezervací |
| Rezervace | GET | /api/bookings/{id} | Detail rezervace |
| Rezervace | POST | /api/bookings | Vytvoření rezervace |
| Rezervace | PUT | /api/bookings/{id} | Úprava rezervace |
| Rezervace | DELETE | /api/bookings/{id} | Zrušení rezervace |
| Typy výletů | GET | /api/trip-types | Číselník typů výletů |
| Upload | POST | /api/upload | Nahrání obrázku |

4.2 Společná schémata

Při jakékoliv chybě (HTTP 400, 401, 404, 409 apod.) vrací server jednotnou strukturu ErrorResponse. Pole errors je vyplněno pouze u validačních chyb a obsahuje mapu název pole → chybová zpráva.

ErrorResponse

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

**Příklad**** ****odpovědi**** ****při**** ****validační**** ****chybě****:**

{

  "status": 400,

  "message": "Validační chyba",

  "errors": {

    "email": "Neplatný formát e-mailu",

    "password": "Heslo musí mít alespoň 6 znaků"

  }

}

4.3 Autentizace – /api/auth

Modul Autentizace zajišťuje registraci nových uživatelů a přihlášení stávajících. Po úspěšné autentizaci server vrací reprezentaci uživatele (UserResponse) a klient si uchovává jeho UUID, které pak posílá v hlavičce X-User-Id u dalších požadavků.

| Metoda | URL | Popis | HTTP kódy |
| --- | --- | --- | --- |
| POST | /api/auth/login | Přihlášení uživatele | 200, 400, 401 |
| POST | /api/auth/register | Registrace nového uživatele | 201, 400, 409 |

LoginRequest – POST /api/auth/login

Schéma požadavku pro přihlášení uživatele e-mailem a heslem.

{

  "$schema": "https://json-schema.org/draft/2020-12",

  "$id": "LoginRequest",

  "type": "object",

  "properties": {

    "email":    { "type": "string", "format": "email",     "description": "E-mailová adresa uživatele" },

    "password": { "type": "string", "minLength": 1,        "description": "Heslo uživatele" }

  },

  "required": ["email", "password"],

  "additionalProperties": false

}

**Příklad**** ****požadavku****:**

{ "email": "jan.novak@example.com", "password": "tajneheslo" }

RegisterRequest – POST /api/auth/register

Schéma požadavku pro registraci nového uživatele. Pole role je volitelné – pokud chybí, použije se výchozí role crew.

{

  "$schema": "https://json-schema.org/draft/2020-12",

  "$id": "RegisterRequest",

  "type": "object",

  "properties": {

    "name":     { "type": "string", "minLength": 1,                         "description": "Celé jméno uživatele" },

    "email":    { "type": "string", "format": "email",                      "description": "E-mailová adresa (musí být unikátní)" },

    "password": { "type": "string", "minLength": 6,                         "description": "Heslo (min. 6 znaků)" },

    "role":     { "type": ["string", "null"], "enum": ["crew", "captain", null], "description": "Role uživatele; výchozí: crew" }

  },

  "required": ["name", "email", "password"],

  "additionalProperties": false

}

**Příklad**** ****požadavku****:**

{

  "name": "Jan Novák",

  "email": "jan.novak@example.com",

  "password": "tajneheslo",

  "role": "captain"

}

UserResponse – odpověď serveru

Struktura, kterou server vrací z přihlášení, registrace, detailu uživatele i jeho úpravy.

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

    "updatedAt": { "type": "string", "format": "date-time", "description": "Datum poslední úpravy (ISO 8601)" }

  },

  "required": ["id", "email", "name", "role", "createdAt", "updatedAt"]

}

**Příklad**** ****odpovědi****:**

{

  "id": "550e8400-e29b-41d4-a716-446655440000",

  "email": "jan.novak@example.com",

  "name": "Jan Novák",

  "role": "captain",

  "createdAt": "2025-03-01T10:00:00Z",

  "updatedAt": "2025-03-01T10:00:00Z"

}

4.4 Uživatelé – /api/users

Modul Uživatelé poskytuje endpointy pro čtení detailu uživatele a úpravu jeho profilových údajů. Vstupní schéma UpdateUserRequest dovoluje částečnou aktualizaci – aktualizují se pouze ta pole, která jsou v požadavku přítomna.

| Metoda | URL | Popis | HTTP kódy |
| --- | --- | --- | --- |
| GET | /api/users/{id} | Detail uživatele (UserResponse) | 200, 404 |
| PUT | /api/users/{id} | Úprava profilu uživatele | 200, 400, 404 |

UpdateUserRequest – PUT /api/users/{id}

Všechna pole jsou volitelná. Aktualizují se pouze ta, která jsou v požadavku uvedena.

{

  "$schema": "https://json-schema.org/draft/2020-12",

  "$id": "UpdateUserRequest",

  "type": "object",

  "properties": {

    "name":     { "type": ["string", "null"],                                          "description": "Nové jméno uživatele" },

    "email":    { "type": ["string", "null"], "format": "email",                       "description": "Nová e-mailová adresa" },

    "password": { "type": ["string", "null"], "minLength": 6,                          "description": "Nové heslo (min. 6 znaků)" },

    "role":     { "type": ["string", "null"], "enum": ["crew", "captain", null],       "description": "Nová role uživatele" }

  },

  "additionalProperties": false

}

**Příklad**** ****požadavku**** (****přejmenování****):**

{ "name": "Jan Novák-Změněný" }

4.5 Nabídky – /api/trips

Skupina endpointů pro správu nabídek. Umožňuje výpis (s volitelným filtrem podle vlastníka), detail, vytvoření, úpravu i smazání. Při vytváření nabídky lze v hlavičce X-User-Id předat ID kapitána, který se stane vlastníkem.

| Metoda | URL | Parametry / hlavičky | Popis | HTTP kódy |
| --- | --- | --- | --- | --- |
| GET | /api/trips | ?owner={userId} (volitelný) | Seznam výletů; filtr podle vlastníka | 200 |
| GET | /api/trips/{id} | – | Detail výletu | 200, 404 |
| POST | /api/trips | X-User-Id (volitelný) | Vytvoří nový výlet | 201, 400 |
| PUT | /api/trips/{id} | – | Aktualizuje výlet | 200, 400, 404 |
| DELETE | /api/trips/{id} | – | Smaže výlet | 204, 404 |

Trip (request tělo i odpověď)

**JSON ****schéma****:**

{

  "$schema": "https://json-schema.org/draft/2020-12",

  "$id": "Trip",

  "type": "object",

  "properties": {

    "id":              { "type": "string", "description": "UUID výletu (generuje server)" },

    "title":           { "type": "string", "minLength": 1 },

    "location":        { "type": "string", "minLength": 1 },

    "country":         { "type": ["string", "null"] },

    "type":            { "type": "string", "enum": ["Training", "Adventure", "Relax"] },

    "startDate":       { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },

    "endDate":         { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },

    "priceCzk":        { "type": "integer", "minimum": 0 },

    "capacity":        { "type": "integer", "minimum": 1 },

    "booked":          { "type": "integer", "minimum": 0 },

    "skipperIncluded": { "type": "boolean" },

    "highlights":      { "type": "array", "items": { "type": "string" } },

    "description":     { "type": ["string", "null"] },

    "imageUrl":        { "type": ["string", "null"], "format": "uri-reference" },

    "ownerUserId":     { "type": ["string", "null"], "description": "lze předat přes X-User-Id" }

  },

  "required": ["title", "location", "type", "startDate", "endDate"]

}

**Příklad**** ****požadavku**** (POST):**

{

  "title": "Španělsko – Costa Brava",

  "location": "Barcelona",

  "country": "Španělsko",

  "type": "Adventure",

  "startDate": "2025-07-15",

  "endDate": "2025-07-22",

  "priceCzk": 18500,

  "capacity": 6,

  "skipperIncluded": true,

  "highlights": ["snorkeling", "noční plavba", "tři přístavy"],

  "description": "Týdenní plavba podél pobřeží Costa Brava.",

  "imageUrl": "/images/uploads/barcelon_trip.jpg"

}

**Příklad**** ****odpovědi**** (GET /{id}):**

{

  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",

  "title": "Španělsko – Costa Brava",

  "location": "Barcelona",

  "country": "Španělsko",

  "type": "Adventure",

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

4.6 Rezervace – /api/bookings

Skupina endpointů pro správu rezervací nabídek. Rezervace lze vytvořit s přihlášeným uživatelem (přes hlavičku X-User-Id). Server automaticky aktualizuje počet rezervovaných míst u příslušné nabídky.

| Metoda | URL | Parametry / hlavičky | Popis | HTTP kódy |
| --- | --- | --- | --- | --- |
| GET | /api/bookings | X-User-Id (volitelný) | Seznam rezervací;  předáno ID, filtruje pouze rezervace daného uživatele | 200 |
| GET | /api/bookings/{id} | – | Detail rezervace | 200, 404 |
| POST | /api/bookings | X-User-Id | Vytvoří novou rezervaci | 201, 400, 409 |
| PUT | /api/bookings/{id} | – | Aktualizuje rezervaci | 200, 400, 404 |
| DELETE | /api/bookings/{id} | – | Zruší rezervaci | 204, 404 |

Booking (request tělo i odpověď)

**JSON ****schéma****:**

{

  "$schema": "https://json-schema.org/draft/2020-12",

  "$id": "Booking",

  "type": "object",

  "properties": {

    "id":           { "type": "string", "description": "UUID rezervace (generuje server)" },

    "tripId":       { "type": "string", "description": "UUID výletu" },

    "createdAt":    { "type": "string", "format": "date-time" },

    "seats":        { "type": "integer", "minimum": 1 },

    "contactName":  { "type": "string", "minLength": 1 },

    "contactEmail": { "type": "string", "format": "email" },

    "userId":       { "type": ["string", "null"], "description": "lze předat přes X-User-Id" }

  },

  "required": ["tripId", "seats", "contactName", "contactEmail"]

}

**Příklad**** ****požadavku**** (POST):**

{

  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",

  "seats": 2,

  "contactName": "Jana Nováková",

  "contactEmail": "jana.novakova@example.com",

  "userId": "550e8400-e29b-41d4-a716-446655440000"

}

**Příklad**** ****odpovědi****:**

{

  "id": "f1e2d3c4-b5a6-7890-fedc-ba9876543210",

  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",

  "createdAt": "2025-04-10T14:30:00Z",

  "seats": 2,

  "contactName": "Jana Nováková",

  "contactEmail": "jana.novakova@example.com",

  "userId": "550e8400-e29b-41d4-a716-446655440000"

}

4.7 Typy plaveb – /api/trip-types

Číselník dostupných typů plaveb – využíván formulářem pro výběr typu při vytváření nebo úpravě plavby. Endpoint je pouze pro čtení.

| Metoda | URL | Popis | HTTP kód |
| --- | --- | --- | --- |
| GET | /api/trip-types | Vrátí seznam všech dostupných typů | 200 |

TripTypeDef (odpověď)

**JSON ****schéma****:**

{

  "$schema": "https://json-schema.org/draft/2020-12",

  "$id": "TripTypeDef",

  "type": "object",

  "properties": {

    "id":    { "type": "integer", "description": "Interní číselné ID (auto-increment)" },

    "code":  { "type": "string",  "description": "Kódové označení typu" },

    "label": { "type": "string",  "description": "Zobrazovaný název v UI" }

  },

  "required": ["id", "code", "label"]

}

**Příklad**** ****odpovědi**** (GET /****api****/trip-types):**

[

  { "id": 1, "code": "Training",  "label": "Výcvik" },

  { "id": 2, "code": "Adventure", "label": "Dobrodružství" },

  { "id": 3, "code": "Relax",     "label": "Rekreace" }

]

4.8 Nahrávání obrázků – /api/upload

Endpoint pro nahrávání fotografií k nabídkám plaveb. Na rozdíl od ostatních endpointů přijímá data ve formátu multipart/form-data (nikoliv JSON). Server soubor uloží a vrátí relativní URL, kterou lze následně použít jako hodnotu pole imageUrl při vytváření nebo úpravě nabídky.

Pole se jmenuje file. Povolené formáty: JPG, JPEG, PNG, WEBP.

| Metoda | URL | Tělo | Popis | HTTP kódy |
| --- | --- | --- | --- | --- |
| POST | /api/upload | multipart/form-data (pole file) | Nahraje obrázek a vrátí jeho URL | 200, 400 |

UploadResponse (odpověď 200 OK)

**JSON ****schéma****:**

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

**Příklad**** ****odpovědi****:**

{ "url": "/images/uploads/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg" }

5. Návrh backend akcí

Tato kapitola obsahuje slovní popis kroků jednotlivých backend endpointů, seřazený podle stejné struktury jako kapitola 4. Hlavní toky pro Přihlášení a Vytvoření rezervace jsou navíc doplněny o sekvenční diagramy v sekci 5.7.

5.1 Autentizace

5.1.1 Registrace (POST /api/auth/register)

AuthController přijme RegisterRequest, Bean Validation ověří povinná pole a formát e-mailu.

AuthService.register() zavolá userRepository.findByEmailIgnoreCase(email).

Pokud uživatel existuje → vyhodí ResponseStatusException(409 CONFLICT).

Heslo se zahashuje přes BCryptPasswordEncoder.encode(password).

Vytvoří se nová entita User (UUID, role = CREW pokud neuvedeno, createdAt/updatedAt = aktuální ISO čas).

userRepository.save(user) → persistuje do MariaDB.

Vrátí se UserResponse s HTTP 201 Created.

5.1.2 Přihlášení (POST /api/auth/login)

AuthController přijme LoginRequest, Bean Validation ověří povinná pole.

AuthService.login() zavolá userRepository.findByEmailIgnoreCase(email).

Pokud uživatel neexistuje → vyhodí ResponseStatusException(401 Unauthorized).

Ověření hesla přes BCryptPasswordEncoder.matches(rawPassword, user.passwordHash).

Pokud heslo nesouhlasí → 401 Unauthorized.

Vrátí UserResponse (bez hesla) s HTTP 200; frontend uloží do localStorage a přesměruje na /.

5.2 Uživatelé

5.2.1 Úprava uživatele (PUT /api/users/{id})

UserController ověří hlavičku X-User-Id; pokud chybí → 401.

Porovná X-User-Id s {id} v URL; pokud se neshodují → 403 Forbidden.

Bean Validation na UpdateUserRequest (formát e-mailu, délka hesla atd.).

AuthService.updateUser() načte uživatele přes userRepository.findById(id); pokud nenalezen → 404.

Pokud přišel nový e-mail, ověří unikátnost (findByEmailIgnoreCase) → 409 při kolizi.

Pokud přišlo nové heslo, zahashuje ho BCryptem.

Aktualizuje pouze přijatá pole, nastaví updatedAt na aktuální čas.

userRepository.save(user); vrátí UserResponse s HTTP 200.

5.3 Nabídky plaveb

5.3.1 Vytvoření nabídky plavby (POST /api/trips)

TripController ověří X-User-Id; pokud chybí → 401.

Bean Validation na request body (povinná pole: title, location, type, startDate, endDate).

TripService.create() vygeneruje ID plavby, nastaví ownerUserId = X-User-Id, booked = 0.

Validuje, že endDate > startDate; jinak 400.

tripRepository.save(trip) → persistuje do MariaDB.

Vrátí Trip s HTTP 201 Created.

5.3.2 Úprava a smazání nabídky (PUT/DELETE /api/trips/{id})

Ověření X-User-Id (jinak 401).

tripRepository.findById(id); pokud nenalezeno → 404.

Kontrola, že trip.ownerUserId === X-User-Id; jinak 403 Forbidden.

PUT: aktualizace přijatých polí, validace endDate > startDate, pokud capacity klesne pod booked → 400.

PUT: tripRepository.save(trip), vrátí Trip s 200.

DELETE: ověří, že neexistují aktivní rezervace (bookingRepository.existsByTripId); pokud ano → 409 Conflict.

DELETE: tripRepository.deleteById(id), vrátí 204 No Content.

5.3.3 Seznam a detail plaveb (GET /api/trips, GET /api/trips/{id})

GET /api/trips: TripController přijme volitelný query parametr owner.

TripService.findAll(owner): pokud owner zadán → tripRepository.findByOwnerUserId(owner), jinak findAll().

Vrátí pole Trip s HTTP 200.

GET /api/trips/{id}: tripRepository.findById(id); pokud nenalezeno → 404.

Vrátí Trip s HTTP 200. Endpoint je veřejný (bez X-User-Id).

5.4 Rezervace

5.4.1 Vytvoření rezervace (POST /api/bookings)

BookingController ověří X-User-Id (jinak 401) a provede Bean Validation na BookingRequest.

BookingService.create() načte trip přes tripRepository.findById(tripId); pokud nenalezeno → 404.

Ověří kapacitu: pokud (trip.booked + seats) > trip.capacity → 400 Bad Request.

Vytvoří entitu Booking (UUID, userId = X-User-Id, createdAt = aktuální čas).

bookingRepository.save(booking); inkrementuje trip.booked o seats a uloží trip.

Vrátí Booking s HTTP 201 Created.

5.4.2 Správa rezervací (GET/PUT/DELETE /api/bookings)

Všechny operace vyžadují X-User-Id (jinak 401).

GET /api/bookings?userId=: pokud userId chybí, vrátí rezervace přihlášeného uživatele; pokud zadáno, kontrola shody s X-User-Id (jinak 403).

GET /api/bookings/{id}: bookingRepository.findById; kontrola, že booking.userId === X-User-Id nebo X-User-Id je vlastník odpovídající plavby; jinak 403.

PUT /api/bookings/{id}: kontrola vlastnictví rezervace; pokud se mění seats, načte se trip a ověří se kapacita s ohledem na rozdíl proti původním seats; jinak 400.

PUT: bookingRepository.save() + případná úprava trip.booked.

DELETE /api/bookings/{id}: kontrola, že X-User-Id je vlastník rezervace nebo vlastník plavby (jinak 403).

DELETE: bookingRepository.deleteById(id), trip.booked -= booking.seats, tripRepository.save(trip), vrátí 204.

5.5 Číselník typů plaveb

GET /api/trip-types: TripTypeController zavolá tripTypeDefRepository.findAll() a vrátí pole {code, label}.

Endpoint je veřejný; frontend výsledek cachuje na úrovni modulu (module-level cache).

5.6 Nahrávání obrázků (POST /api/upload)

POST /api/upload: UploadController přijme multipart/form-data s polem file.

Validuje content-type (povoleny JPG/PNG) a velikost (jinak 400/415).

Vygeneruje unikátní název souboru (UUID + původní přípona), uloží do filesystem adresáře uploads/.

Vrátí JSON { url: "/uploads/<filename>" } s HTTP 201.

5.7 Sekvenční diagramy

5.7.1 Přihlášení – hlavní tok

Účastníci: Uživatel -> LoginPage -> AuthContext -> AuthController -> AuthService -> UserRepository

Uživatel zadá email + heslo, odešle formulář

POST /api/auth/login

apiFetch('/auth/login') přes AuthContext

login(LoginRequest) v AuthService

findByEmailIgnoreCase(email) -> Optional<User>

BCrypt.matches(heslo, hash) – ověření

UserResponse (200) -> uložení do localStorage -> přesměrování na /

[alternativa] špatné heslo -> 401 Unauthorized

5.7.2 Vytvoření rezervace – hlavní tok

Účastníci: Uživatel -> TripDetailPage -> BookingController -> BookingService -> TripRepository -> BookingRepository

Uživatel vyplní formulář (kontakt, místa)

Zod validace na frontendu

POST /api/bookings (X-User-Id)

@Valid Bean Validation v controlleru

create(booking) v BookingService

findById(tripId) -> Trip (kapacita, booked)

zkontroluje volná místa

save(booking) + trip.booked++

Booking 201 -> zobrazí potvrzení

[alternativa] kapacita překročena -> 400 Bad Request