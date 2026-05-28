# SRS – Software Requirements Specification

## Sail Connect

| | |
| --- | --- |
| Verze | 1.1 |
| Datum | 2026-05-28 |
| Autor | Eva Kratěnová |

---

## Business Story

Sail Connect je webová aplikace propojující námořní kapitány a zájemce z řad posádek. Umožňuje vyhledávání podle destinací, termínů a typu hledané nabídky. Uživatelé pro její použití musí provést registraci a založit si účet. Poté mohou vkládat vlastní nabídky a provádět jejich správu nebo provádět rezervace. V první fázi je plánovaná pouze česká jazyková mutace.

Na jedné straně stojí kapitáni, kteří chtějí obsadit místa na palubě – dosud to řešili inzeráty na fórech, ve skupinách nebo e-mailem. Na druhé straně jsou zájemci o plavbu, kteří neměli snadný způsob, jak vhodnou nabídku najít a rezervovat. Sail Connect to řeší jednou aplikací: kapitán vytvoří nabídku plavby, nahraje fotku a nastaví termín a kapacitu. Posádka filtruje podle destinace, ceny a stylu plavby a rezervuje místo přímo v systému. Obě strany mají přehled o svých nabídkách a rezervacích na jednom místě – bez e-mailů, bez tabulek.

---

## 1. Úvod

### 1.1 Účel dokumentu

Tento dokument specifikuje funkční a nefunkční požadavky na webovou aplikaci Sail Connect. Je určen pro vývojáře, testery a garanta předmětu.

### 1.2 Rozsah systému

Sail Connect je fullstack webová aplikace propojující kapitány (nabídka plaveb) a posádku (rezervace míst na plavbách). Systém umožňuje správu nabídek plaveb, rezervace míst, správu uživatelských účtů a nahrávání obrázků.

### 1.3 Definice a zkratky

| **Zkratka** | **Význam** |
| --- | --- |
| SPA | Single Page Application |
| REST | Representational State Transfer |
| JPA | Jakarta Persistence API |
| JWT | JSON Web Token – bezstavový autentizační token (HMAC-SHA256) |
| FR | Funkční požadavek (Functional Requirement) |
| NFR | Nefunkční požadavek (Non-Functional Requirement) |
| UUID | Universally Unique Identifier |
| BCrypt | Algoritmus pro hašování hesel |

---

## 2. Přehled systému

### 2.1 Popis systému

Systém se skládá ze tří částí:

- **Frontend** – React SPA servovaná přes Vite dev server (port 5173)
- **Backend** – Spring Boot REST API (port 8080)
- **Databáze** – MariaDB (port 3306, databáze sailconnect)

Komunikace probíhá přes HTTP REST. Přihlášený uživatel je identifikován **JWT Bearer tokenem** (hlavička `Authorization: Bearer <token>`), který obdrží po přihlášení a je platný 24 hodin.

### 2.2 Uživatelské role

| **Role** | **Popis** |
| --- | --- |
| Nepřihlášený návštěvník | Může prohlížet seznam a detail plaveb |
| Posádka (crew) | Může rezervovat plavby, spravovat vlastní rezervace, upravovat profil |
| Kapitán (captain) | Může vše co posádka + vytvářet, upravovat a mazat vlastní nabídky plaveb |

### 2.3 Kontext systému

Prezentační vrstva (React SPA) komunikuje přes HTTP REST s aplikační vrstvou (Spring Boot API), která přistupuje k datové vrstvě (MariaDB) prostřednictvím Spring Data JPA. Přihlášený uživatel je identifikován **JWT Bearer tokenem** – `JwtFilter` ověří podpis a z payloadu extrahuje `userId` a `role` před každým chráněným požadavkem.

---

## 3. Funkční požadavky

### 3.1 Autentizace a správa účtu

| **ID** | **Požadavek** | **Priorita** |
| --- | --- | --- |
| FR-01 | Systém umožní registraci nového uživatele (jméno, e-mail, heslo, role). | Vysoká |
| FR-02 | Systém odmítne registraci na již existující e-mail (HTTP 409). | Vysoká |
| FR-03 | Systém přihlásí uživatele ověřením e-mailu a BCrypt hesla a vrátí JWT token. | Vysoká |
| FR-04 | Systém vrátí HTTP 401 při nesprávném hesle nebo neznámém e-mailu. | Vysoká |
| FR-05 | Přihlášený uživatel může zobrazit a upravit svůj profil (jméno, e-mail, role). | Střední |
| FR-06 | Systém uloží heslo výhradně jako BCrypt hash, nikdy jako prostý text. | Vysoká |

### 3.2 Nabídky plaveb

| **ID** | **Požadavek** | **Priorita** |
| --- | --- | --- |
| FR-07 | Systém zobrazí seznam všech dostupných plaveb. | Vysoká |
| FR-08 | Systém umožní server-side filtrování plaveb podle: klíčového slova, státu (číselník), typu, termínu od/do, maximální ceny, minimálního počtu volných míst. | Střední |
| FR-09 | Filtr se aktivuje kliknutím na tlačítko Hledat (ne automaticky při změně pole). | Střední |
| FR-10 | Systém zobrazí detail plavby: hero obrázek, popis, highlights, volná místa, rezervační formulář. | Vysoká |
| FR-11 | Přihlášený kapitán může vytvořit nabídku plavby. | Vysoká |
| FR-12 | Kapitán může upravit nebo smazat pouze vlastní nabídky. | Vysoká |
| FR-13 | Vlastník nabídky si nemůže zarezervovat vlastní plavbu. | Střední |
| FR-14 | Systém zobrazuje počet zbývajících míst (kapacita − rezervováno) a aktualizuje jej dynamicky po provedení rezervace. | Střední |
| FR-15 | Ke každé plavbě lze nahrát vlastní obrázek (jpg, png, webp, max 10 MB). | Střední |

### 3.3 Rezervace

| **ID** | **Požadavek** | **Priorita** |
| --- | --- | --- |
| FR-16 | Přihlášený uživatel může rezervovat místa na plavbě (počet míst); kontaktní jméno a e-mail jsou převzaty automaticky z uživatelského profilu. | Vysoká |
| FR-17 | Systém odmítne rezervaci přesahující kapacitu plavby (HTTP 409). | Vysoká |
| FR-18 | Přihlášený uživatel vidí seznam vlastních rezervací v přehledu (Dashboard). | Vysoká |
| FR-19 | Uživatel může upravit počet míst na vlastní rezervaci. | Střední |
| FR-20 | Uživatel může zrušit vlastní rezervaci (HTTP DELETE → 204); počet volných míst na plavbě se okamžitě aktualizuje. | Střední |
| FR-21 | Systém konsoliduje rezervace: každý uživatel může mít na jednu plavbu nejvýše jednu rezervaci. Opakovaný POST /api/bookings pro stejnou kombinaci uživatel+plavba provede aktualizaci stávající rezervace (upsert). | Střední |

### 3.4 Číselníky a upload

| **ID** | **Požadavek** | **Priorita** |
| --- | --- | --- |
| FR-22 | Systém poskytne číselník typů plavby načtený z databáze (GET /api/trip-types). | Střední |
| FR-23 | Systém poskytne číselník zemí světa načtený z databáze (GET /api/countries, 190 položek, ISO 3166-1). | Střední |
| FR-24 | Systém umožní upload obrázku (POST /api/upload); vrátí URL k uloženému souboru. | Střední |
| FR-25 | Systém odmítne upload souboru s nepovolenou příponou (povoleno: jpg, png, webp). | Střední |

### 3.5 Chybové stavy a navigace

| **ID** | **Požadavek** | **Priorita** |
| --- | --- | --- |
| FR-26 | Neznámá URL zobrazí stránku 404 s cestou. | Nízká |
| FR-27 | Neexistující entita (plavba, rezervace) zobrazí stránku 404. | Střední |
| FR-28 | Chyba při odesílání formuláře zobrazí chybovou zprávu přímo ve formuláři. | Střední |

---

## 4. Nefunkční požadavky

| **ID** | **Požadavek** |
| --- | --- |
| NFR-01 | API vrací odpovědi do 500 ms při lokálním běhu. |
| NFR-02 | Hesla jsou hašována algoritmem BCrypt (síla 10). |
| NFR-03 | Autentizace probíhá pomocí JWT Bearer tokenu (HMAC-SHA256, platnost 24 h); chráněné endpointy vrátí 401 při chybějícím nebo neplatném tokenu. |
| NFR-04 | Všechny API chyby vrací jednotný JSON formát `{ status, message, errors }`. |
| NFR-05 | Validace vstupů probíhá na dvou vrstvách: Zod (frontend) a Bean Validation (backend). |
| NFR-06 | Nahrané obrázky jsou dostupné přes statické URL bez autentizace. |
| NFR-07 | Frontend je responzivní (breakpointy 700 px, 1024 px). |
| NFR-08 | Aplikace funguje v moderních prohlížečích (Chrome, Firefox, Edge – poslední 2 verze). |
| NFR-09 | Číselníky (typy plavby, země) jsou cachovány na frontendu po dobu životního cyklu aplikace. |

---

## 5. Use Cases

### Use Case Diagram

*(viz přiložený diagram)*

### UC-01: Přihlášení

| **Aktér** | Registrovaný uživatel (posádka, kapitán) |
| --- | --- |
| **Předpoklad** | Uživatel má účet, není přihlášen |
| **Hlavní scénář** | Zadá e-mail a heslo → systém ověří → vrátí JWT token → uloží profil do localStorage → přesměruje na Dashboard |
| **Alternativní scénář** | Špatné heslo → 401 → zobrazí „Neplatné přihlašovací údaje" |

### UC-02: Vytvoření nabídky plavby

| **Aktér** | Přihlášený kapitán |
| --- | --- |
| **Předpoklad** | Role captain, přihlášen |
| **Hlavní scénář** | Vyplní formulář → nahraje obrázek → vytvoří nabídku → vidí novou kartu na homepage |
| **Alternativní scénář** | Chybí povinné pole → Zod chyba pod polem; datum ukončení < datum zahájení → @ValidDateRange → 400 |

### UC-03: Rezervace plavby

| **Aktér** | Přihlášený uživatel (posádka, kapitán) |
| --- | --- |
| **Předpoklad** | Plavba existuje, má volná místa, uživatel není vlastník |
| **Hlavní scénář** | Zvolí počet míst → rezervuje → vidí v Dashboardu; počet volných míst se okamžitě aktualizuje |
| **Alternativní scénář** | Zadá více míst než kapacita → 409 → chyba „Počet míst je mimo kapacitu plavby"; opakovaná rezervace téže plavby → upsert stávající rezervace |

---

## 6. Byznysové procesy

### BP-01: Registrace a přihlášení

Uživatel otevře aplikaci, klikne na Registrace a vyplní jméno, e-mail, heslo a roli. Formulář je validován na straně klienta (Zod). Po odeslání POST /api/auth/register systém vrátí 201 s JWT tokenem a přesměruje na Dashboard, nebo zobrazí chybu (409 – e-mail již existuje, 400 – validace).

### BP-02: Kapitán zveřejní nabídku plavby

**Trigger:** Kapitán chce nabídnout volná místa na své plavbě a získat posádku.

**Aktéři:** Kapitán (primární), Systém Sail Connect, úložiště obrázků.

**Vstupy:** Údaje o plavbě (název, destinace, stát z číselníku, termín od/do, kapacita, cena, typ, popis), volitelně obrázek (jpg/png/webp, max 10 MB).

**Výstupy:** Publikovaná nabídka plavby viditelná v seznamu na hlavní stránce; URL k uloženému obrázku.

**Předpoklady:** Uživatel je přihlášen v roli captain (JWT obsahuje `role: CAPTAIN`).

**Hlavní tok:**

1. Kapitán na Dashboardu klikne na tlačítko + Nová plavba.
2. Systém zobrazí formulář; typy plavby načte z číselníku (GET /api/trip-types), státy z (GET /api/countries).
3. Kapitán vyplní povinná pole a volitelně vybere obrázek.
4. Pokud vybral obrázek, frontend odešle POST /api/upload s Bearer tokenem; systém uloží soubor a vrátí URL.
5. Frontend validuje formulář pomocí Zod (povinná pole, formát data, kapacita > 0, cena ≥ 0, endDate ≥ startDate).
6. Kapitán odešle formulář; frontend odešle POST /api/trips s Bearer tokenem v hlavičce `Authorization`.
7. Backend ověří JWT, zkontroluje roli CAPTAIN, ověří vstupy (Bean Validation + @ValidDateRange), uloží nabídku do databáze a vrátí 201 s identifikátorem plavby.
8. Systém přesměruje kapitána na detail nové plavby.

**Alternativní a výjimečné toky:**

- 4a. Nepovolená přípona souboru: backend vrátí 400, frontend zobrazí chybovou zprávu.
- 4b. Soubor přesahuje 10 MB: systém upload odmítne a zobrazí chybu (FR-25).
- 5a. Validační chyba na frontendu: Zod zobrazí chybu pod příslušným polem, odeslání se neprovede.
- 7a. Validační chyba na backendu: systém vrátí 400 s `{ status, message, errors }` (NFR-04); frontend zobrazí chybu ve formuláři.
- 7b. Neautorizovaný požadavek (chybějící nebo neplatný JWT token): systém vrátí 401.
- 7c. Nedostatečná role (CREW místo CAPTAIN): systém vrátí 403.

### BP-03: Posádka rezervuje plavbu

**Trigger:** Uživatel chce zarezervovat místo na konkrétní plavbě.

**Aktéři:** Posádka nebo kapitán v roli zájemce (primární), Systém Sail Connect.

**Vstupy:** Filtrovací kritéria (stát z číselníku, typ plavby, termín od/do, maximální cena, min. volných míst), počet požadovaných míst.

**Výstupy:** Potvrzená rezervace viditelná v Dashboardu uživatele; dynamicky aktualizovaný počet volných míst na plavbě.

**Předpoklady:** Uživatel je přihlášen; existuje plavba s volnými místy; uživatel není vlastníkem plavby.

**Hlavní tok:**

1. Uživatel otevře hlavní stránku se seznamem všech dostupných plaveb.
2. Volitelně vyplní filtr a klikne na tlačítko Hledat; frontend odešle GET /api/trips/search s parametry filtru; systém vrátí filtrovaný seznam ze serveru.
3. Uživatel klikne na kartu vybrané plavby; systém zobrazí detail s hero obrázkem, popisem, highlights, počtem volných míst a rezervačním formulářem.
4. Je-li uživatel přihlášen, formulář zobrazí jeho jméno a e-mail z profilu (read-only) a pole pro počet míst. Má-li uživatel na dané plavbě existující rezervaci, formulář ji zobrazí a umožní úpravu počtu míst.
5. Uživatel vyplní počet míst a odešle formulář; frontend odešle POST /api/bookings s Bearer tokenem.
6. Backend extrahuje `userId` z JWT, zkontroluje existenci plavby a kapacitu. Existuje-li rezervace pro daný `userId + tripId`, provede upsert (aktualizaci); jinak vytvoří novou rezervaci. Atomicky aktualizuje `trip.booked`.
7. Backend vrátí 201 s objektem rezervace.
8. Frontend načte aktuální stav plavby ze serveru (GET /api/trips/{id}) a zobrazí aktualizovaný počet volných míst.
9. Systém zobrazí potvrzení rezervace a odkaz na Dashboard.

**Alternativní a výjimečné toky:**

- 2a. Filtr nevrátí žádnou plavbu: systém zobrazí prázdný seznam.
- 5a. Validační chyba na frontendu: Zod zobrazí chybu pod příslušným polem.
- 6a. Počet míst přesahuje volnou kapacitu: systém vrátí 409 a frontend zobrazí zprávu „Počet míst je mimo kapacitu plavby" (FR-17).
- 6b. Uživatel je vlastníkem plavby: v UI je rezervační formulář na vlastních plavbách skryt a nahrazen informační zprávou (FR-13).
- 6c. Plavba neexistuje (mezitím smazána): systém vrátí 404 (FR-27).
- 6d. Neautorizovaný požadavek (chybějící nebo neplatný JWT): systém vrátí 401.

### BP-04: Správa rezervace

Přihlášený uživatel otevře Dashboard a vidí seznam vlastních rezervací. Kliknutím na řádek rezervace přejde na detail plavby; tlačítkem **Detail rezervace** zobrazí detail rezervace. Může upravit počet míst (PUT /api/bookings/{id}) nebo rezervaci zrušit (DELETE /api/bookings/{id} → 204), po čemž se odpovídající počet míst vrátí zpět do kapacity plavby.

---

## 7. Datový model

Schéma databáze spravuje Hibernate (`ddl-auto=update`) – tabulky jsou vytvořeny automaticky při prvním spuštění backendu. Primární klíče jsou generovány jako UUID string v `@PrePersist`.

### 7.1 Přehled entit

| Entita (Java) | Tabulka | Popis |
| --- | --- | --- |
| `User` | `users` | Uživatelský účet |
| `Trip` | `trips` | Nabídka plavby |
| `Booking` | `bookings` | Rezervace míst na plavbě |
| `TripTypeDef` | `trip_type_def` | Číselník typů plavby |
| `Country` | `country` | Číselník zemí světa |

### 7.2 Entita User (`users`)

| Atribut | Typ | Omezení |
| --- | --- | --- |
| `id` | VARCHAR(36) | PK, UUID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | NOT NULL – BCrypt hash |
| `name` | VARCHAR(255) | NOT NULL |
| `role` | VARCHAR(20) | NOT NULL – `CREW` nebo `CAPTAIN` |
| `created_at` | VARCHAR(50) | NOT NULL – ISO 8601 |
| `updated_at` | VARCHAR(50) | NOT NULL – ISO 8601 |

### 7.3 Entita Trip (`trips`)

| Atribut | Typ | Omezení |
| --- | --- | --- |
| `id` | VARCHAR(64) | PK, UUID |
| `title` | VARCHAR(255) | NOT NULL |
| `location` | VARCHAR(255) | NOT NULL – přístav/místo |
| `country` | VARCHAR(255) | název státu (z číselníku `country`) |
| `type` | VARCHAR(20) | NOT NULL – `RELAX`, `TRAINING`, `ADVENTURE` |
| `start_date` | VARCHAR(20) | NOT NULL – YYYY-MM-DD |
| `end_date` | VARCHAR(20) | NOT NULL – YYYY-MM-DD; ≥ start_date |
| `price_czk` | INT | NOT NULL – cena v Kč za osobu |
| `capacity` | INT | NOT NULL – celková kapacita (≥ 1) |
| `booked` | INT | DEFAULT 0 – průběžně aktualizováno službou BookingService |
| `skipper_included` | TINYINT(1) | DEFAULT 0 |
| `highlights` | TEXT | JSON pole stringů |
| `description` | TEXT | volitelný podrobný popis |
| `image_url` | VARCHAR(500) | relativní URL obrázku |
| `owner_user_id` | VARCHAR(36) | FK → `users.id` (bez CK omezení) |

### 7.4 Entita Booking (`bookings`)

| Atribut | Typ | Omezení |
| --- | --- | --- |
| `id` | VARCHAR(36) | PK, UUID |
| `trip_id` | VARCHAR(64) | NOT NULL – FK → `trips.id` |
| `user_id` | VARCHAR(36) | FK → `users.id`; kombinace `user_id + trip_id` je unikátní (upsert) |
| `seats` | INT | NOT NULL – počet rezervovaných míst (≥ 1) |
| `contact_name` | VARCHAR(255) | NOT NULL |
| `contact_email` | VARCHAR(255) | NOT NULL |
| `created_at` | VARCHAR(50) | NOT NULL – ISO 8601 |

### 7.5 Číselník TripTypeDef (`trip_type_def`)

| Atribut | Typ | Popis |
| --- | --- | --- |
| `id` | BIGINT | PK, auto-increment |
| `code` | VARCHAR(20) | Kód typu – `RELAX`, `TRAINING`, `ADVENTURE` |
| `label` | VARCHAR(100) | Český název zobrazovaný v UI |

Předvyplněno při startu aplikací `DataSeeder` (3 záznamy).

### 7.6 Číselník Country (`country`)

| Atribut | Typ | Popis |
| --- | --- | --- |
| `code` | VARCHAR(2) | PK – ISO 3166-1 alpha-2 (CZ, GR, HR, …) |
| `name` | VARCHAR(100) | Český název státu |

Předvyplněno při startu aplikací `DataSeeder` (190 záznamů).

### 7.7 Vztahy mezi entitami

```
User ──< Trip          (1 kapitán : N plaveb; owner_user_id)
User ──< Booking       (1 uživatel : N rezervací; user_id)
Trip ──< Booking       (1 plavba : N rezervací; trip_id)
                        constraint: 1 uživatel má max. 1 rezervaci na 1 plavbu
Trip >── TripTypeDef   (hodnota type odpovídá kódu číselníku)
Trip >── Country       (hodnota country odpovídá name v číselníku)
```

### 7.8 Inicializace dat (DataSeeder)

`DataSeeder` (implementuje `CommandLineRunner`) se spustí při každém startu backendu a při prázdné DB vloží:
- **3 typy plavby** do `trip_type_def`
- **190 zemí světa** do `country`
- **19 ukázkových nabídek plaveb** do `trips`

Opakované spuštění je bezpečné – DataSeeder kontroluje `countryRepo.count() == 0` / `tripRepo.count() > 0` před vložením.
