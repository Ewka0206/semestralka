# Sail Connect – Prezentace projektu

## Co aplikace dělá

**Sail Connect** je fullstack webová aplikace propojující **kapitány** a **posádku** pro organizaci plaveb.

Kapitáni mohou zveřejňovat nabídky plaveb, posádka si je může prohlížet, filtrovat a rezervovat místa.

### Hlavní funkce

| Funkce | Popis |
|--------|-------|
| **Homepage** | Seznam plaveb s filtrem (destinace/země, typ, datum, max. cena) aktivovaným tlačítkem Hledat |
| **Detail plavby** | Hero obrázek, popis, počet volných míst, rezervační formulář |
| **Vytvoření / editace nabídky** | Formulář s nahráváním vlastního obrázku (jpg, png, webp) |
| **Můj přehled** | Správa vlastních rezervací i nabídek |
| **Auth** | Registrace, přihlášení, odhlášení; role `captain` / `crew` |
| **Profil** | Detail + editace (jméno, e-mail, role) |
| **404 stránka** | Zachytí neznámé URL i nenalezené entity (plavba, rezervace) |

---

## Architektura

```
semestralka/
├── backend/    Spring Boot REST API  →  http://localhost:8080
└── frontend/   React SPA             →  http://localhost:5173
                  (Vite proxy /api/** → backend)
```

Komunikace přes REST API, frontend posílá `X-User-Id` hlavičku pro identifikaci přihlášeného uživatele.

---

## Technologie

### Backend
| Vrstva | Technologie |
|--------|-------------|
| Jazyk / runtime | Java 21 |
| Framework | Spring Boot 3.3 |
| Persistenec | Spring Data JPA + Hibernate, MariaDB |
| Bezpečnost | Spring Security Crypto – BCrypt hashování hesel |
| Validace | Jakarta Bean Validation (`@NotBlank`, `@Email`, `@Size`) |
| Error handling | `@RestControllerAdvice` – jednotný `ErrorResponse` JSON pro celé API |
| Testy | JUnit 5 + Mockito (30 testů, bez DB) |

### Frontend
| Vrstva | Technologie |
|--------|-------------|
| Jazyk / runtime | TypeScript, Node.js |
| UI framework | React 19 + Vite |
| Routing | React Router v6 |
| Formuláře | React Hook Form + Zod (client-side validace) + zobrazení API chyb |
| Testy | Vitest + jsdom (23 testů) |

---

## Databázová vrstva

Aplikace používá **MariaDB** přes **Spring Data JPA + Hibernate**. Schéma databáze vzniká automaticky – při každém startu backendu Hibernate porovná entity s tabulkami a provede potřebné změny (`ddl-auto=update`). Databázu není třeba zakládat ručně.

### JPA entity

| Třída | Tabulka | Klíčová pole |
|-------|---------|--------------|
| `User` | `users` | `id` (UUID), `email` (unique), `password` (BCrypt), `role` (`crew`/`captain`) |
| `Trip` | `trips` | `id` (UUID), `title`, `location`, `country`, `type` (enum), `startDate`, `capacity`, `booked`, `ownerUserId` |
| `Booking` | `bookings` | `id` (UUID), `tripId`, `userId`, `contactName`, `contactEmail`, `seats` |
| `TripTypeDef` | `trip_type_def` | `type` (enum key), `label` (zobrazovaný text) |

Primární klíče jsou UUID stringy generované v `@PrePersist`. Entity `User` a `Trip` mají také `@PreUpdate` pro automatickou aktualizaci `updatedAt`.

### DataSeeder – ukázková data

Při prvním startu vloží `DataSeeder` do DB 3 typy plavby a 20 ukázkových nabídek s obrázky. Při dalších startech data přeskočí (`tripRepo.count() > 0`).

```java
// backend/src/main/java/com/sailconnect/DataSeeder.java
@Component
public class DataSeeder implements ApplicationListener<ApplicationReadyEvent> {
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        if (tripRepo.count() > 0) return;   // idempotentní – spustí se jen jednou
        seedTripTypes();
        seedTrips();
    }
}
```

```properties
# backend/src/main/resources/application.properties
spring.datasource.url=jdbc:mariadb://localhost:3306/sailconnect?createDatabaseIfNotExist=true
spring.jpa.hibernate.ddl-auto=update
```

---

## Ukázky kódu

### 1. Dvouvrstvá validace a error handling

Validace probíhá na dvou úrovních: **Zod na frontendu** (okamžitá zpětná vazba bez síťového požadavku) a **Bean Validation na backendu** (pojistka). Pokud API volání selže, uživatel vidí chybovou hlášku přímo u formuláře.

```
Uživatel odešle formulář
  → Zod (frontend) zachytí prázdné pole / špatný formát → zobrazí chybu pod polem
  → Pokud Zod projde, odešle se požadavek na backend
      → @Valid + Bean Validation zachytí porušení pravidel → vrátí 400 s mapou chyb per-field
      → Service vrátí 409 (duplicitní e-mail) / 401 (špatné heslo) → zobrazí se hláška
      → Síťová / serverová chyba → "Nepodařilo se uložit. Zkuste to znovu."
```

---

### 2. Globální exception handler – jednotný formát chyb

Každá chyba v celé aplikaci vrací stejný JSON tvar. Validační chyby vrátí mapu polí.

```java
// backend/src/main/java/com/sailconnect/exception/GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Neplatná hodnota",
                        (a, b) -> a
                ));
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Neplatné vstupní údaje.", fieldErrors));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(ErrorResponse.of(ex.getStatusCode().value(), ex.getReason()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.of(500, "Interní chyba serveru."));
    }
}
```

**Příklad odpovědi při neplatné registraci (`POST /api/auth/register` s `{}`):**
```json
{
  "status": 400,
  "message": "Neplatné vstupní údaje.",
  "errors": {
    "name":     "Jméno je povinné",
    "email":    "E-mail je povinný",
    "password": "Heslo je povinné"
  }
}
```

---

### 2. Bean Validation na DTO (Java record)

```java
// backend/src/main/java/com/sailconnect/dto/RegisterRequest.java
public record RegisterRequest(
        @NotBlank(message = "Jméno je povinné")
        String name,

        @NotBlank(message = "E-mail je povinný")
        @Email(message = "Neplatný formát e-mailu")
        String email,

        @NotBlank(message = "Heslo je povinné")
        @Size(min = 6, message = "Heslo musí mít alespoň 6 znaků")
        String password,

        String role
) {}
```

```java
// Aktivace v controlleru
@PostMapping("/register")
@ResponseStatus(HttpStatus.CREATED)
public UserResponse register(@Valid @RequestBody RegisterRequest req) {
    return authService.register(req);
}
```

---

### 3. Deferred filter pattern – filtr aktivovaný tlačítkem

Dvě oddělené stavy: `draft` (co uživatel zadává) a `applied` (co se skutečně filtruje). Filtr se aplikuje až po kliknutí na Hledat.

```typescript
// frontend/src/pages/HomePage.tsx
const [draft, setDraft] = useState(defaultTripFilters());
const [applied, setApplied] = useState(defaultTripFilters());

const filteredTrips = useMemo(
    () => applyTripFilters(allTrips, applied),
    [allTrips, applied]
);

function handleSearch() { setApplied(draft); }
function handleReset()  { const d = defaultTripFilters(); setDraft(d); setApplied(d); }
```

---

### 4. Hook s module-level cache pro číselník typů plaveb

Typy plaveb se načtou z DB jednou – sdílená cache přes celý životní cyklus aplikace.

```typescript
// frontend/src/features/trips/useTripTypes.ts
let cache: TripTypeOption[] | null = null;

async function loadTripTypes(): Promise<TripTypeOption[]> {
    if (cache) return cache;
    cache = await apiFetch<TripTypeOption[]>("/trip-types");
    return cache;
}

export function useTripTypes(): TripTypeOption[] {
    const [types, setTypes] = useState<TripTypeOption[]>(cache ?? []);
    useEffect(() => {
        loadTripTypes().then(setTypes).catch(() => {});
    }, []);
    return types;
}
```

---

### 5. Upload obrázku – backend

```java
// backend/src/main/java/com/sailconnect/controller/UploadController.java
@PostMapping
public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
    String ext = /* extrakce přípony */ ...;

    if (!ALLOWED.contains(ext)) {  // ALLOWED = {jpg, jpeg, png, webp}
        return ResponseEntity.badRequest()
                .body(Map.of("error", "Povolené formáty: jpg, png, webp"));
    }

    String filename = UUID.randomUUID() + "." + ext;
    Files.copy(file.getInputStream(), dir.resolve(filename), REPLACE_EXISTING);

    return ResponseEntity.ok(Map.of("url", "/images/uploads/" + filename));
}
```

---

## Live use casy pro zkoušku

### Use case 1 – Kapitán zveřejní nabídku plavby

**Scénář:** Nový uživatel se zaregistruje jako kapitán, vytvoří nabídku plavby s obrázkem a nabídka se okamžitě zobrazí na homepage.

**Kroky:**
1. Otevřít `http://localhost:5173`
2. Klik na **Registrace** → vyplnit jméno, e-mail, heslo, role = `Kapitán` → odeslat
3. Klik na **Nová nabídka** (v navigaci, viditelné jen po přihlášení)
4. Vyplnit formulář: název, destinace, stát, typ, datum, cena, kapacita, popis
5. Nahrát obrázek (jpg/png/webp) přes tlačítko Vybrat soubor
6. Klik **Vytvořit** → přesměrování na detail nové plavby
7. Navigovat zpět na **Domov** → nová nabídka se zobrazí v seznamu

**Co ukáže:**
- Registrace + přihlášení (JWT-less, `X-User-Id` hlavička)
- REST `POST /api/trips` s daty plavby
- `POST /api/upload` multipart nahrávání obrázku
- Reaktivní seznam na homepage (nová karta se ihned zobrazí)

---

### Use case 2 – Posádka najde a zarezervuje plavbu

**Scénář:** Přihlášený uživatel role `crew` prohledá nabídky, zarezervuje místo a sleduje rezervaci v přehledu.

**Kroky:**
1. Přihlásit se jako uživatel s rolí `Posádka`
2. Na homepage použít filtr: zadat destinaci (např. „Korfu"), klik **Hledat**
3. Kliknout na výslednou kartu → detail plavby
4. Vidět počet volných míst a cenu, vyplnit rezervační formulář (jméno, e-mail, počet míst)
5. Klik **Rezervovat** → potvrzení „Rezervace uložena"
6. Klik **Jít na Můj přehled** → rezervace viditelná v sekci Moje rezervace
7. Klik na rezervaci → detail, možnost upravit nebo zrušit

**Co ukáže:**
- Filtrování podle destinace (hledá v `location` i `country`)
- Validace formuláře (Zod na frontendu – zkusit zadat neplatný e-mail)
- REST `POST /api/bookings`
- Dashboard se seznamem rezervací (`GET /api/bookings` filtrovaný dle `X-User-Id`)
- Mazání: klik **Zrušit rezervaci** → `DELETE /api/bookings/{id}` → 204

---

## Testy

### Spuštění

```powershell
# Frontend (23 testů)
cd frontend
npm run test:run

# Backend (28 testů, bez DB)
cd backend
.\mvnw test
```

### Co se testuje

| Vrstva | Soubory | Pokrytí |
|--------|---------|---------|
| Frontend – repo | `trips.repo.test.ts`, `bookings.repo.test.ts` | API volání mockována přes `vi.mock` |
| Frontend – logika | `trips.utils.test.ts` | Filtr včetně hledání podle země |
| Frontend – validace | `createOffer.schema.test.ts`, `booking.schema.test.ts` | Zod schémata |
| Backend – service | `AuthServiceTest`, `TripServiceTest`, `BookingServiceTest` | Repozitáře mockované Mockitem |
| Backend – error handling | `GlobalExceptionHandlerTest` | 400/401/404/500 odpovědi |

### API testy – Postman

Importovat `SailConnect.postman_collection.json` (v kořeni repozitáře).
Proměnné `userId`, `tripId`, `bookingId` se plní automaticky z odpovědí.
