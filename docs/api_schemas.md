# SailConnect – JSON schémata REST API

> Základní URL: `http://localhost:8080`  
> Formát: JSON (Content-Type: `application/json`)  
> Autentizace: **JWT Bearer token** – po přihlášení přidejte do každého chráněného požadavku hlavičku `Authorization: Bearer <token>`

---

## Společná schémata

### ErrorResponse
Vráceno při chybě (400, 404, 409 apod.).

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

**Příklad:**
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

---

## 1. Autentizace – `/api/auth`

### LoginRequest
`POST /api/auth/login`

```json
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
```

**Příklad požadavku:**
```json
{ "email": "jan.novak@example.com", "password": "tajneheslo" }
```

---

### RegisterRequest
`POST /api/auth/register`

```json
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

---

### UserResponse
Vráceno z `POST /login`, `POST /register`, `GET /api/users/{id}`, `PUT /api/users/{id}`.

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
    "updatedAt": { "type": "string", "format": "date-time", "description": "Datum poslední úpravy (ISO 8601)" }
  },
  "required": ["id", "email", "name", "role", "createdAt", "updatedAt"]
}
```

**Příklad odpovědi:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "jan.novak@example.com",
  "name": "Jan Novák",
  "role": "captain",
  "createdAt": "2025-03-01T10:00:00Z",
  "updatedAt": "2025-03-01T10:00:00Z"
}
```

| HTTP kód | Popis |
|----------|-------|
| 200 OK | Úspěšné přihlášení |
| 201 Created | Úspěšná registrace |
| 400 Bad Request | Validační chyba (viz ErrorResponse) |
| 401 Unauthorized | Neplatné přihlašovací údaje |
| 409 Conflict | E-mail je již registrován |

---

## 2. Uživatelé – `/api/users`

### UpdateUserRequest
`PUT /api/users/{id}`

Všechna pole jsou volitelná – aktualizují se pouze ta, která jsou v požadavku uvedena.

```json
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
```

**Příklad požadavku:**
```json
{ "name": "Jan Novák-Změněný" }
```

| HTTP kód | Popis |
|----------|-------|
| 200 OK | Úprava proběhla, vrátí UserResponse |
| 400 Bad Request | Validační chyba |
| 404 Not Found | Uživatel neexistuje |

---

## 3. Výlety – `/api/trips`

### Trip (request tělo i odpověď)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "Trip",
  "type": "object",
  "properties": {
    "id":              { "type": "string",                                            "description": "UUID výletu (generuje server při POST)" },
    "title":           { "type": "string", "minLength": 1,                           "description": "Název výletu" },
    "location":        { "type": "string", "minLength": 1,                           "description": "Místo odjezdu / přístav" },
    "country":         { "type": ["string", "null"],                                 "description": "Stát / region" },
    "type":            { "type": "string", "enum": ["RELAX", "TRAINING", "ADVENTURE"], "description": "Typ plavby (uppercase kód z číselníku /api/trip-types)" },
    "startDate":       { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$",     "description": "Datum zahájení (YYYY-MM-DD)" },
    "endDate":         { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$",     "description": "Datum ukončení (YYYY-MM-DD)" },
    "priceCzk":        { "type": "integer", "minimum": 0,                            "description": "Cena v Kč za osobu" },
    "capacity":        { "type": "integer", "minimum": 1,                            "description": "Maximální počet osob na palubě" },
    "booked":          { "type": "integer", "minimum": 0,                            "description": "Aktuálně rezervovaná místa (spravuje server)" },
    "skipperIncluded": { "type": "boolean",                                          "description": "True = skipper v ceně" },
    "highlights":      { "type": "array", "items": { "type": "string" },             "description": "Klíčové body / atrakce výletu" },
    "description":     { "type": ["string", "null"],                                 "description": "Podrobný popis výletu" },
    "imageUrl":        { "type": ["string", "null"], "format": "uri-reference",      "description": "Relativní cesta k fotografii" },
    "ownerUserId":     { "type": ["string", "null"],                                 "description": "UUID majitele plavby; při POST se nastaví automaticky z JWT tokenu" }
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
  "type": "Adventure",
  "startDate": "2025-07-15",
  "endDate": "2025-07-22",
  "priceCzk": 18500,
  "capacity": 6,
  "skipperIncluded": true,
  "highlights": ["snorkeling", "noční plavba", "tři přístavy"],
  "description": "Týdenní plavba podél pobřeží Costa Brava na 40-stopé plachetnici.",
  "imageUrl": "/images/uploads/barcelon_trip.jpg"
}
```

**Příklad odpovědi (GET `/{id}`):**
```json
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
  "description": "Týdenní plavba podél pobřeží Costa Brava na 40-stopé plachetnici.",
  "imageUrl": "/images/uploads/barcelon_trip.jpg",
  "ownerUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Přehled endpointů

| Metoda | URL | Parametry / hlavičky | Popis | HTTP kódy |
|--------|-----|----------------------|-------|-----------|
| GET | `/api/trips` | `?owner={userId}` (volitelný) | Vrátí seznam všech plaveb; lze filtrovat podle vlastníka | 200 |
| GET | `/api/trips/search` | `?q`, `type`, `country`, `dateFrom`, `dateTo`, `maxPrice`, `minFreeSpots`, `page`, `size` | Vyhledávání plaveb s filtry; vrací stránkovaný výsledek (`Page<Trip>`) | 200 |
| GET | `/api/trips/{id}` | – | Detail jedné plavby | 200, 404 |
| POST | `/api/trips` | `Authorization: Bearer <token>` (✔ CAPTAIN) | Vytvoří novou plavbu; vlastník se nastaví z JWT | 201, 400, 401, 403 |
| PUT | `/api/trips/{id}` | `Authorization: Bearer <token>` (✔ CAPTAIN) | Aktualizuje plavbu | 200, 400, 401, 403, 404 |
| DELETE | `/api/trips/{id}` | `Authorization: Bearer <token>` (✔ CAPTAIN) | Smaže plavbu | 204, 401, 403, 404 |

---

## 4. Rezervace – `/api/bookings`

### Booking (request tělo i odpověď)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "Booking",
  "type": "object",
  "properties": {
    "id":           { "type": "string",                             "description": "UUID rezervace (generuje server při POST)" },
    "tripId":       { "type": "string",                             "description": "UUID výletu, ke kterému se rezervace vztahuje" },
    "createdAt":    { "type": "string", "format": "date-time",      "description": "Datum a čas vytvoření rezervace (ISO 8601, generuje server)" },
    "seats":        { "type": "integer", "minimum": 1,              "description": "Počet rezervovaných míst" },
    "contactName":  { "type": "string",  "minLength": 1,            "description": "Jméno kontaktní osoby" },
    "contactEmail": { "type": "string",  "format": "email",         "description": "E-mail kontaktní osoby" },
    "userId":       { "type": ["string", "null"],                   "description": "UUID přihlášeného uživatele; nastavuje se automaticky z JWT tokenu (hodnota předaná v těle se ignoruje)" }
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
  "contactEmail": "jana.novakova@example.com",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
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

### Přehled endpointů

| Metoda | URL | Parametry / hlavičky | Popis | HTTP kódy |
|--------|-----|----------------------|-------|-----------|
| GET | `/api/bookings` | `Authorization: Bearer <token>` (✔ CREW+) | Vrátí rezervace přihlášeného uživatele (userId z JWT) | 200, 401 |
| GET | `/api/bookings/{id}` | `Authorization: Bearer <token>` (✔ CREW+) | Detail jedné rezervace | 200, 401, 404 |
| POST | `/api/bookings` | `Authorization: Bearer <token>` (✔ CREW+) | Vytvoří nebo aktualizuje rezervaci (upsert dle userId + tripId) | 201, 400, 401, 409 |
| PUT | `/api/bookings/{id}` | `Authorization: Bearer <token>` (✔ CREW+) | Aktualizuje rezervaci | 200, 400, 401, 404 |
| DELETE | `/api/bookings/{id}` | `Authorization: Bearer <token>` (✔ CREW+) | Zruší rezervaci | 204, 401, 404 |

---

## 5. Typy výletů – `/api/trip-types`

### TripTypeDef (odpověď)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "TripTypeDef",
  "type": "object",
  "properties": {
    "id":    { "type": "integer",                   "description": "Interní číselné ID (auto-increment)" },
    "code":  { "type": "string",                    "description": "Kódové označení typu (shoduje se s hodnotami TripType)" },
    "label": { "type": "string",                    "description": "Zobrazovaný název v UI" }
  },
  "required": ["id", "code", "label"]
}
```

**Příklad odpovědi (GET `/api/trip-types`):**
```json
[
  { "id": 1, "code": "Training",  "label": "Výcvik" },
  { "id": 2, "code": "Adventure", "label": "Dobrodružství" },
  { "id": 3, "code": "Relax",     "label": "Rekreace" }
]
```

| Metoda | URL | Popis | HTTP kód |
|--------|-----|-------|----------|
| GET | `/api/trip-types` | Vrátí seznam všech dostupných typů plavby | 200 |

---

## 6. Číselník zemí – `/api/countries`

### Country (odpověď)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "Country",
  "type": "object",
  "properties": {
    "code": { "type": "string", "description": "ISO 3166-1 alpha-2 kód státu (např. CZ, GR, HR)" },
    "name": { "type": "string", "description": "Český název státu (např. Česká republika, Řecko, Chorvatsko)" }
  },
  "required": ["code", "name"]
}
```

**Příklad odpovědi (GET `/api/countries`):**
```json
[
  { "code": "CZ", "name": "Česká republika" },
  { "code": "GR", "name": "Řecko" },
  { "code": "HR", "name": "Chorvatsko" }
]
```

Číselník obsahuje 190 zemí světa. Hodnota `name` se předává jako `country` při vytváření/editaci plavby.

| Metoda | URL | Popis | HTTP kód |
|--------|-----|-------|----------|
| GET | `/api/countries` | Vrátí seznam 190 zemí světa (code + name) | 200 |

---

## 7. Nahrávání obrázků – `/api/upload`

### Upload (multipart/form-data)
`POST /api/upload`

Požadavek se odesílá jako `multipart/form-data`, **ne JSON**. Pole se jmenuje `file`.

| Parametr | Typ | Povinný | Popis |
|----------|-----|---------|-------|
| `file` | binární soubor | ano | Obrázek ve formátu JPG, PNG nebo WEBP |

**Povolené MIME typy / přípony:** `jpg`, `jpeg`, `png`, `webp`

### UploadResponse (odpověď 200 OK)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "$id": "UploadResponse",
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "format": "uri-reference",
      "description": "Relativní URL nahraného souboru (použitelná jako imageUrl u výletu)"
    }
  },
  "required": ["url"]
}
```

**Příklad odpovědi:**
```json
{ "url": "/images/uploads/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg" }
```

| HTTP kód | Popis |
|----------|-------|
| 200 OK | Soubor nahrán, vrátí URL |
| 400 Bad Request | Nepodporovaný formát souboru |

---

## Přehled všech endpointů

| Skupina | Metoda | URL | Auth | Popis |
|---------|--------|-----|------|-------|
| Auth | POST | `/api/auth/login` | ✗ | Přihlášení, vrátí JWT token |
| Auth | POST | `/api/auth/register` | ✗ | Registrace, vrátí JWT token |
| Uživatelé | GET | `/api/users/{id}` | ✔ CREW+ | Detail uživatele |
| Uživatelé | PUT | `/api/users/{id}` | ✔ CREW+ | Úprava profilu |
| Plavby | GET | `/api/trips` | ✗ | Seznam plaveb |
| Plavby | GET | `/api/trips/search` | ✗ | Vyhledávání + stránkování plaveb |
| Plavby | GET | `/api/trips/{id}` | ✗ | Detail plavby |
| Plavby | POST | `/api/trips` | ✔ CAPTAIN | Nová plavba |
| Plavby | PUT | `/api/trips/{id}` | ✔ CAPTAIN | Úprava plavby |
| Plavby | DELETE | `/api/trips/{id}` | ✔ CAPTAIN | Smazání plavby |
| Rezervace | GET | `/api/bookings` | ✔ CREW+ | Seznam rezervací přihlášeného uživatele |
| Rezervace | GET | `/api/bookings/{id}` | ✔ CREW+ | Detail rezervace |
| Rezervace | POST | `/api/bookings` | ✔ CREW+ | Nová / aktualizovaná rezervace (upsert) |
| Rezervace | PUT | `/api/bookings/{id}` | ✔ CREW+ | Úprava rezervace |
| Rezervace | DELETE | `/api/bookings/{id}` | ✔ CREW+ | Zrušení rezervace |
| Číselníky | GET | `/api/trip-types` | ✗ | Číselník typů plavby |
| Číselníky | GET | `/api/countries` | ✗ | Číselník 190 zemí světa |
| Upload | POST | `/api/upload` | ✔ CREW+ | Nahrání obrázku |
| Monitoring | GET | `/actuator/health` | ✗ | Stav aplikace a DB |
