# SailConnect – JSON schémata REST API

> Základní URL: `http://localhost:8080`  
> Formát: JSON (Content-Type: `application/json`)  
> Autentizace: bezstavová – ID přihlášeného uživatele se předává v hlavičce `X-User-Id`

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
    "type":            { "type": "string", "enum": ["Training", "Adventure", "Relax"], "description": "Typ výletu" },
    "startDate":       { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$",     "description": "Datum zahájení (YYYY-MM-DD)" },
    "endDate":         { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$",     "description": "Datum ukončení (YYYY-MM-DD)" },
    "priceCzk":        { "type": "integer", "minimum": 0,                            "description": "Cena v Kč za osobu" },
    "capacity":        { "type": "integer", "minimum": 1,                            "description": "Maximální počet osob na palubě" },
    "booked":          { "type": "integer", "minimum": 0,                            "description": "Aktuálně rezervovaná místa (spravuje server)" },
    "skipperIncluded": { "type": "boolean",                                          "description": "True = skipper v ceně" },
    "highlights":      { "type": "array", "items": { "type": "string" },             "description": "Klíčové body / atrakce výletu" },
    "description":     { "type": ["string", "null"],                                 "description": "Podrobný popis výletu" },
    "imageUrl":        { "type": ["string", "null"], "format": "uri-reference",      "description": "Relativní cesta k fotografii" },
    "ownerUserId":     { "type": ["string", "null"],                                 "description": "UUID majitele výletu; lze předat přes X-User-Id" }
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
| GET | `/api/trips` | `?owner={userId}` (volitelný) | Vrátí seznam všech výletů; lze filtrovat podle vlastníka | 200 |
| GET | `/api/trips/{id}` | – | Detail jednoho výletu | 200, 404 |
| POST | `/api/trips` | `X-User-Id` (volitelný) | Vytvoří nový výlet | 201, 400 |
| PUT | `/api/trips/{id}` | – | Aktualizuje výlet | 200, 400, 404 |
| DELETE | `/api/trips/{id}` | – | Smaže výlet | 204, 404 |

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
    "userId":       { "type": ["string", "null"],                   "description": "UUID přihlášeného uživatele; lze předat přes X-User-Id" }
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
| GET | `/api/bookings` | `X-User-Id` (volitelný) | Vrátí rezervace; je-li předáno ID, filtruje pouze rezervace daného uživatele | 200 |
| GET | `/api/bookings/{id}` | – | Detail jedné rezervace | 200, 404 |
| POST | `/api/bookings` | `X-User-Id` (volitelný) | Vytvoří novou rezervaci | 201, 400, 409 |
| PUT | `/api/bookings/{id}` | – | Aktualizuje rezervaci | 200, 400, 404 |
| DELETE | `/api/bookings/{id}` | – | Zruší rezervaci | 204, 404 |

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
| GET | `/api/trip-types` | Vrátí seznam všech dostupných typů výletů | 200 |

---

## 6. Nahrávání obrázků – `/api/upload`

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

| Skupina | Metoda | URL | Popis |
|---------|--------|-----|-------|
| Auth | POST | `/api/auth/login` | Přihlášení |
| Auth | POST | `/api/auth/register` | Registrace |
| Uživatelé | GET | `/api/users/{id}` | Detail uživatele |
| Uživatelé | PUT | `/api/users/{id}` | Úprava profilu |
| Výlety | GET | `/api/trips` | Seznam výletů |
| Výlety | GET | `/api/trips/{id}` | Detail výletu |
| Výlety | POST | `/api/trips` | Nový výlet |
| Výlety | PUT | `/api/trips/{id}` | Úprava výletu |
| Výlety | DELETE | `/api/trips/{id}` | Smazání výletu |
| Rezervace | GET | `/api/bookings` | Seznam rezervací |
| Rezervace | GET | `/api/bookings/{id}` | Detail rezervace |
| Rezervace | POST | `/api/bookings` | Nová rezervace |
| Rezervace | PUT | `/api/bookings/{id}` | Úprava rezervace |
| Rezervace | DELETE | `/api/bookings/{id}` | Zrušení rezervace |
| Typy výletů | GET | `/api/trip-types` | Číselník typů výletů |
| Upload | POST | `/api/upload` | Nahrání obrázku |
