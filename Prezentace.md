# SailConnect – Scénář obhajoby

> **Čas:** 5–10 minut | **Backend:** `localhost:8080` | **Frontend:** `localhost:5173`  
> Spuštění: viz README. Před prezentací ověř `GET /actuator/health` → `{"status":"UP"}`.

---

## Rychlý přehled (30 sekund)

| Vrstva | Třídy |
|--------|-------|
| **Entity** | `User`, `Trip`, `Booking`, `TripTypeDef`, `Country` |
| **DTO** | `LoginRequest/Response`, `RegisterRequest`, `UpdateUserRequest`, `UserResponse`, `TripRequest`, `ErrorResponse` |
| **Validace** | `@ValidDateRange` (custom Jakarta anotace), `DateRangeValidator` |
| **Repository** | `UserRepository`, `TripRepository` (vlastní query + stránkování), `BookingRepository`, `TripTypeDefRepository`, `CountryRepository` |
| **Service** | `AuthService`, `TripService`, `BookingService` |
| **Controller** | `AuthController`, `TripController`, `BookingController`, `UserController`, `TripTypeController`, `CountryController`, `UploadController` |
| **Config** | `SecurityConfig`, `JwtUtil`, `JwtFilter`, `CorsConfig`, `OpenApiConfig` |

Technologie: **Java 21 · Spring Boot 3.3 · Spring Security 6 · JJWT 0.12.6 · MariaDB · SpringDoc OpenAPI 2.6**

---

## Oblast 1 – Architektura a struktura

**Co říct:** Vícevrstvá architektura – každá vrstva má jednu odpovědnost. Controller zpracuje HTTP požadavek a deleguje na Service. Service obsahuje business logiku (validace emailu, mapování DTO→entita, pagination). Repository jen přistupuje k DB. DTO odděluje interní model od API kontraktu.

**Ukázka – průchod POST /api/trips:**
```
Controller  →  @Valid TripRequest (Bean Validation)
           →  TripService.create(req, ownerId)
           →  mapování TripRequest → Trip entita
           →  TripRepository.save(trip)
           →  log.info("Nová plavba vytvořena...")
           ←  Trip (JSON response 201)
```

---

## Oblast 2 – Bezpečnost a komunikace API

### 2a. Registrace a JWT token
```bash
# Registrace kapitána → vrátí JWT token
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Kapitan Demo","email":"kapitan@demo.cz","password":"demo1234","role":"captain"}'
```
Odpověď obsahuje `token` (JWT), `role: "captain"`, `id`.

Dekóduj token na [jwt.io](https://jwt.io) → payload: `{ "sub": "<userId>", "role": "captain", "exp": ... }`

### 2b. Endpoint bez tokenu → 401
```bash
curl -s http://localhost:8080/api/bookings
# → {"status":401,"message":"Přístup odepřen – chybí nebo neplatný token.","errors":null}
```

### 2c. Endpoint s tokenem → 200
```bash
curl -s http://localhost:8080/api/bookings \
  -H "Authorization: Bearer <TOKEN>"
# → [ ...seznam rezervací... ]
```

### 2d. Validace vstupu → 400 s popisem chyby
```bash
# Chybí title a capacity=0
curl -s -X POST http://localhost:8080/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"location":"Korfu","type":"RELAX","startDate":"2026-06-01","endDate":"2026-06-08","capacity":0}'
# → {"status":400,"message":"Neplatné vstupní údaje.",
#    "errors":{"title":"Název plavby je povinný","capacity":"Kapacita musí být alespoň 1"}}

# Custom @ValidDateRange: endDate < startDate → 400
curl -s -X POST http://localhost:8080/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Korfu","location":"Korfu","type":"RELAX","startDate":"2026-07-10","endDate":"2026-07-01","capacity":8,"priceCzk":15000}'
# → {"status":400,"message":"Neplatné vstupní údaje.",
#    "errors":{"endDate":"Datum ukončení musí být stejné nebo pozdější než datum zahájení"}}
```

**Co říct:** Validace probíhá na dvou úrovních:
1. **Bean Validation** (`@NotBlank`, `@Min`) zachytí formátové chyby na úrovni DTO.
2. **Custom Jakarta validátor** `@ValidDateRange` ověří, že `endDate ≥ startDate` – jako vlastní anotace s třídou `DateRangeValidator implements ConstraintValidator`.
3. **Service vrstva** řeší business pravidla (duplicitní email → 409, špatné heslo → 401, nedostatek míst → 409).
`GlobalExceptionHandler` zajistí konzistentní `ErrorResponse` pro všechny chyby.

---

## Oblast 3 – Databáze, práce s daty a testování

### 3a. CRUD
- `POST /api/trips` → CREATE (s validací)
- `GET /api/trips/{id}` → READ
- `PUT /api/trips/{id}` → UPDATE (patch semantika, null pole se ignorují)
- `DELETE /api/trips/{id}` → DELETE (vyžaduje roli CAPTAIN)

### 3b. Složitější databázový dotaz (nativní SQL)
```sql
-- TripRepository.searchAvailable() – kombinuje 8 parametrů:
--  • LIKE přes 3 sloupce (title, location, country)
--  • filtr typu plavby, státu, termínu, maximální ceny
--  • podmínka min. volných míst (capacity - booked >= minFreeSpots)
--  • řazení podle data zahájení
SELECT * FROM trips
WHERE (:keyword = '' OR LOWER(title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                     OR LOWER(location) LIKE LOWER(CONCAT('%', :keyword, '%'))
                     OR LOWER(country) LIKE LOWER(CONCAT('%', :keyword, '%')))
  AND (:type = '' OR type = :type)
  AND (:country = '' OR country = :country)
  AND (:dateFrom = '' OR start_date >= :dateFrom)
  AND (:dateTo = '' OR start_date <= :dateTo)
  AND (:maxPrice < 0 OR price_czk <= :maxPrice)
  AND (capacity - booked) >= :minFreeSpots
ORDER BY start_date ASC
```

### 3c. Vyhledávání + stránkování
```bash
# Stránka 0, 5 výsledků, filtr Relax
curl "http://localhost:8080/api/trips/search?type=Relax&page=0&size=5"
# → {"content":[...],"totalElements":9,"totalPages":2,"number":0,"size":5}

# Druhá stránka
curl "http://localhost:8080/api/trips/search?type=Relax&page=1&size=5"
# → {"content":[...],"totalElements":9,"number":1,"last":true}

# Keyword + stránkování
curl "http://localhost:8080/api/trips/search?q=korfu&page=0&size=3"
```

### 3d. Testy (39 unit testů)
```
AuthServiceTest              – 10 testů (login, register, updateUser – happy path i edge cases)
TripServiceTest              – 12 testů (getAll, getById, search + stránkování, create, update, delete)
BookingServiceTest           – 12 testů (+ create/delete aktualizuje trip.booked, upsert, kontrola kapacity)
GlobalExceptionHandlerTest   –  5 testů
```
```bash
cd backend && ./mvnw test
# → Tests run: 39, Failures: 0, Errors: 0
```

---

## Oblast 4 – Dokumentace a obhajoba

### 4a. Swagger UI
```
http://localhost:8080/swagger-ui.html
```
Zobrazuje všechny endpointy se schématy, Authorize tlačítko pro Bearer token, možnost volání přímo z prohlížeče.

### 4b. Actuator monitoring
```bash
curl http://localhost:8080/actuator/health
# → {"status":"UP","components":{"db":{"status":"UP","details":{"database":"MariaDB"}},...}}

curl http://localhost:8080/actuator/metrics/http.server.requests
# → počet příchozích HTTP požadavků
```

### 4c. Logování (SLF4J)
Při každém požadavku se v konzoli zobrazí:
```
INFO  AuthService    -- Uživatel přihlášen: userId=..., role=captain
INFO  TripService    -- Vyhledávání plaveb: keyword='korfu', type=RELAX, stránka 0/5
WARN  AuthService    -- Přihlášení selhalo – špatné heslo pro userId=...
ERROR GlobalHandler  -- Neočekávaná chyba: ...
```

### 4d. Dokumentace v repozitáři
```
README.md                         – návod ke spuštění, architektura, technologie
docs/api_schemas.md               – JSON Schema pro všechna API
docs/uzivatelska_prirucka.md      – návod pro uživatele
docs/administratorska_prirucka.md – návod pro správce
docs/SailConnect_SRS.md           – Specifikace softwarových požadavků (verze 1.1)
docs/SailConnect_SDD.md           – Softwarový návrh – architektura, DB schéma, popis API
```

---

## Role-based autorizace – demo (klíčový moment)

```bash
# 1. Registrace crew
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Crew Demo","email":"crew@demo.cz","password":"demo1234","role":"crew"}'
# → uložit CREW_TOKEN

# 2. Crew se pokusí smazat plavbu → 403
curl -X DELETE http://localhost:8080/api/trips/korfu-2026-06 \
  -H "Authorization: Bearer <CREW_TOKEN>"
# → {"status":403,"message":"Přístup odepřen – nedostatečná oprávnění."}

# 3. Kapitán smaže plavbu → 204
curl -X DELETE http://localhost:8080/api/trips/korfu-2026-06 \
  -H "Authorization: Bearer <CAPTAIN_TOKEN>"
# → HTTP 204 No Content
```

**Co říct:** Spring Security porovná roli z JWT (`ROLE_CAPTAIN`) s konfigurací `SecurityConfig` → `.hasRole("CAPTAIN")`. CREW token má `ROLE_CREW`, nestačí to, vrátí 403 s `AccessDeniedException` zachycenou v `SecurityConfig.accessDeniedHandler`.

---

## Cheatsheet pro zkoušejícího

| Otázka | Odpověď |
|--------|---------|
| Kde je business logika? | V Service vrstvě (`AuthService`, `TripService`, `BookingService`) |
| Kde se generuje JWT? | `JwtUtil.generateToken()` – HMAC-SHA256, 24h platnost |
| Kde se ověřuje JWT? | `JwtFilter extends OncePerRequestFilter` – každý request před controllerem |
| Proč DTO místo entity? | Oddělení API kontraktu od DB modelu; validace bez zasahování do entity |
| Jak funguje stránkování? | `Pageable` parametr v repository, `countQuery` pro `totalElements` |
| Jak funguje upsert rezervací? | `BookingRepository.findByUserIdAndTripId()` – pokud existuje, update; jinak create; userId vždy z JWT |
| Jak se aktualizuje `booked`? | `BookingService` je `@Transactional`, při create/delete atomicky mění `trip.booked` v `TripRepository` |
| Jak se projevuje role v UI? | Crew: vidí propagační sekci s výhodami a tlačítkem **Změnit roli** na stránce profilu `/me`; Kapitán sekci nevidí, ale vidí tlačítko **Vytvořit nabídku** v navigaci |
| Kde jsou testy? | `backend/src/test/java/com/sailconnect/service/` |
| Jak spustit? | `cd backend && ./mvnw spring-boot:run` (vyžaduje MariaDB na portu 3306) |
