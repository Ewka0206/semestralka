# SRS – Software Requirements Specification
## Sail Connect

**Verze:** 1.0  
**Datum:** 2026-05-25  
**Autor:** Eva Kratěnová

---

## 1. Úvod

### 1.1 Účel dokumentu

Tento dokument specifikuje funkční a nefunkční požadavky na webovou aplikaci Sail Connect. Je určen pro vývojáře, testery a garanta předmětu.

### 1.2 Rozsah systému

Sail Connect je fullstack webová aplikace propojující **kapitány** (nabídka plaveb) a **posádku** (rezervace míst na plavbách). Systém umožňuje správu nabídek plaveb, rezervace míst, správu uživatelských účtů a nahrávání obrázků.

### 1.3 Definice a zkratky

| Zkratka | Význam |
|---------|--------|
| SPA | Single Page Application |
| REST | Representational State Transfer |
| JPA | Jakarta Persistence API |
| FR | Funkční požadavek (Functional Requirement) |
| NFR | Nefunkční požadavek (Non-Functional Requirement) |
| UUID | Universally Unique Identifier |
| BCrypt | Algoritmus pro hashování hesel |

---

## 2. Přehled systému

### 2.1 Popis systému

Systém se skládá ze dvou částí:
- **Frontend** – React SPA servovaná přes Vite dev server (port 5173)
- **Backend** – Spring Boot REST API (port 8080)
- **Databáze** – MariaDB (port 3306, databáze `sailconnect`)

Komunikace probíhá přes HTTP REST. Přihlášený uživatel je identifikován hlavičkou `X-User-Id` v každém požadavku.

### 2.2 Uživatelské role

| Role | Popis |
|------|-------|
| **Nepřihlášený návštěvník** | Může prohlížet seznam a detail plaveb |
| **Posádka (crew)** | Může rezervovat plavby, spravovat vlastní rezervace, upravovat profil |
| **Kapitán (captain)** | Může vše co posádka + vytvářet, upravovat a mazat vlastní nabídky plaveb |

### 2.3 Kontext systému

```
Prohlížeč (uživatel)
        │  HTTP + X-User-Id
        ▼
  React SPA (Vite)
        │  /api/** proxy
        ▼
  Spring Boot REST API
        │  Spring Data JPA
        ▼
     MariaDB
```

---

## 3. Funkční požadavky

### 3.1 Autentizace a správa účtu

| ID | Požadavek | Priorita |
|----|-----------|----------|
| FR-01 | Systém umožní registraci nového uživatele (jméno, e-mail, heslo, role). | Vysoká |
| FR-02 | Systém odmítne registraci na již existující e-mail (HTTP 409). | Vysoká |
| FR-03 | Systém přihlásí uživatele ověřením e-mailu a BCrypt hesla. | Vysoká |
| FR-04 | Systém vrátí HTTP 401 při nesprávném hesle nebo neznámém e-mailu. | Vysoká |
| FR-05 | Přihlášený uživatel může zobrazit a upravit svůj profil (jméno, e-mail, role). | Střední |
| FR-06 | Systém uloží heslo výhradně jako BCrypt hash, nikdy jako prostý text. | Vysoká |

### 3.2 Nabídky plaveb

| ID | Požadavek | Priorita |
|----|-----------|----------|
| FR-07 | Systém zobrazí seznam všech dostupných plaveb. | Vysoká |
| FR-08 | Systém umožní filtrování plaveb podle: destinace/země, typu, data (od), maximální ceny. | Střední |
| FR-09 | Filtr se aktivuje kliknutím na tlačítko Hledat (ne automaticky). | Střední |
| FR-10 | Systém zobrazí detail plavby: hero obrázek, popis, highlights, volná místa, rezervační formulář. | Vysoká |
| FR-11 | Přihlášený kapitán může vytvořit nabídku plavby. | Vysoká |
| FR-12 | Kapitán může upravit nebo smazat pouze vlastní nabídky. | Vysoká |
| FR-13 | Vlastník nabídky si nemůže zarezervovat vlastní plavbu. | Střední |
| FR-14 | Systém zobrazuje počet zbývajících míst (kapacita − rezervováno). | Střední |
| FR-15 | Ke každé plavbě lze nahrát vlastní obrázek (jpg, png, webp, max 10 MB). | Střední |

### 3.3 Rezervace

| ID | Požadavek | Priorita |
|----|-----------|----------|
| FR-16 | Přihlášený uživatel může rezervovat místa na plavbě (kontaktní jméno, e-mail, počet míst). | Vysoká |
| FR-17 | Systém odmítne rezervaci přesahující kapacitu plavby. | Vysoká |
| FR-18 | Přihlášený uživatel vidí seznam vlastních rezervací v přehledu (Dashboard). | Vysoká |
| FR-19 | Uživatel může upravit vlastní rezervaci (kontaktní údaje, počet míst). | Střední |
| FR-20 | Uživatel může zrušit vlastní rezervaci (HTTP DELETE → 204). | Střední |

### 3.4 Číselníky a upload

| ID | Požadavek | Priorita |
|----|-----------|----------|
| FR-21 | Systém poskytne číselník typů plavby načtený z databáze (`GET /api/trip-types`). | Střední |
| FR-22 | Systém umožní upload obrázku (`POST /api/upload`); vrátí URL k uloženému souboru. | Střední |
| FR-23 | Systém odmítne upload souboru s nepovolenou příponou (povoleno: jpg, png, webp). | Střední |

### 3.5 Chybové stavy a navigace

| ID | Požadavek | Priorita |
|----|-----------|----------|
| FR-24 | Neznámá URL zobrazí stránku 404 s cestou. | Nízká |
| FR-25 | Neexistující entita (plavba, rezervace) zobrazí stránku 404. | Střední |
| FR-26 | Chyba při odesílání formuláře zobrazí chybovou zprávu přímo ve formuláři. | Střední |

---

## 4. Nefunkční požadavky

| ID | Požadavek |
|----|-----------|
| NFR-01 | API vrací odpovědi do 500 ms při lokálním běhu. |
| NFR-02 | Hesla jsou hashována algoritmem BCrypt (síla 10). |
| NFR-03 | Všechny API chyby vracejí jednotný JSON formát `{ status, message, errors }`. |
| NFR-04 | Validace vstupů probíhá na dvou vrstvách: Zod (frontend) a Bean Validation (backend). |
| NFR-05 | Nahrané obrázky jsou dostupné přes statické URL bez autentizace. |
| NFR-06 | Frontend je responzivní (breakpointy 700 px, 1024 px). |
| NFR-07 | Aplikace funguje v moderních prohlížečích (Chrome, Firefox, Edge – poslední 2 verze). |
| NFR-08 | Typy plavby jsou cachovány na frontendu po dobu životního cyklu aplikace. |

---

## 5. Byznys procesy

### BP-01: Registrace a přihlášení

```
Uživatel otevře aplikaci
  → klikne na Registrace
  → vyplní jméno, e-mail, heslo, vybere roli
  → Zod validuje formulář (instant feedback)
  → POST /api/auth/register
      [201] → uložení do localStorage, přesměrování na /
      [409] → "E-mail je již registrován"
      [400] → validační chyba u konkrétního pole
```

### BP-02: Kapitán zveřejní nabídku plavby

```
Přihlášený kapitán
  → klikne Nová nabídka
  → vyplní formulář (název, destinace, termín, kapacita, cena, typ, popis)
  → volitelně nahraje obrázek (POST /api/upload → získá URL)
  → POST /api/trips
      [201] → přesměrování na detail nové plavby
      [400] → validační chyba
```

### BP-03: Posádka rezervuje plavbu

```
Přihlášený uživatel
  → najde plavbu na homepage (filtr nebo procházení)
  → klikne na kartu → detail plavby
  → vyplní rezervační formulář (kontakt, počet míst)
  → Zod validuje
  → POST /api/bookings
      [201] → "Rezervace uložena", link na Dashboard
      [400] → validační chyba / kapacita překročena
```

### BP-04: Správa rezervace

```
Přihlášený uživatel → Dashboard
  → vidí seznam vlastních rezervací
  → klikne na rezervaci → detail
  → Upravit → EditBookingPage → PUT /api/bookings/{id}
  → Zrušit → DELETE /api/bookings/{id} → [204] → zmizí ze seznamu
```

---

## 6. Use Cases

### UC-01: Přihlášení

| | |
|---|---|
| **Aktér** | Registrovaný uživatel |
| **Předpoklad** | Uživatel má účet, není přihlášen |
| **Hlavní scénář** | Zadá e-mail a heslo → systém ověří → uloží profil → přesměruje na `/` |
| **Alternativní scénář** | Špatné heslo → 401 → zobrazí „Neplatné přihlašovací údaje" |

### UC-02: Vytvoření nabídky plavby

| | |
|---|---|
| **Aktér** | Přihlášený kapitán |
| **Předpoklad** | Role `captain`, přihlášen |
| **Hlavní scénář** | Vyplní formulář → nahraje obrázek → vytvoří nabídku → vidí novou kartu na homepage |
| **Alternativní scénář** | Chybí povinné pole → Zod chyba pod polem |

### UC-03: Rezervace plavby

| | |
|---|---|
| **Aktér** | Přihlášený uživatel (crew nebo captain) |
| **Předpoklad** | Plavba existuje, má volná místa, uživatel není vlastník |
| **Hlavní scénář** | Vyplní kontaktní formulář → rezervuje → vidí v Dashboardu |
| **Alternativní scénář** | Zadá více míst než kapacita → chyba „Kapacita plavby je překročena" |

---

## 7. Omezení a předpoklady

- Aplikace předpokládá lokální nebo privátní nasazení (žádné veřejné URL).
- Autentizace je implementována bez JWT – uživatelské `id` je posíláno v hlavičce `X-User-Id` (vhodné pro výukové účely, nikoli produkci).
- Upload obrázků je uložen lokálně na disku (`frontend/public/images/uploads/`).
- Aplikace nevyžaduje e-mailové ověření účtu.
