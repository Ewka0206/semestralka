# Uživatelská a administrátorská příručka
## Sail Connect

**Verze:** 1.0  
**Datum:** 2026-05-25

---

## 1. Uživatelská příručka

### 1.1 Přístup k aplikaci

Aplikaci otevřeš v prohlížeči na adrese `http://localhost:5173`.

Nepřihlášený návštěvník může:
- prohlížet seznam plaveb na homepage
- zobrazit detail libovolné plavby

Pro rezervaci, vytváření nabídek a správu účtu je nutné se přihlásit nebo zaregistrovat.

---

### 1.2 Registrace

1. Klikni na **Registrace** v navigaci.
2. Vyplň:
   - **Jméno** (min. 2 znaky)
   - **E-mail** (platný formát)
   - **Heslo** (min. 6 znaků)
   - **Role** – `Posádka` nebo `Kapitán`
3. Klikni **Zaregistrovat se**.

Po úspěšné registraci jsi automaticky přihlášena a přesměrována na homepage.

> Pokud e-mail již existuje, zobrazí se chyba „E-mail je již registrován."

---

### 1.3 Přihlášení a odhlášení

**Přihlášení:**
1. Klikni na **Přihlásit se** v navigaci.
2. Zadej e-mail a heslo.
3. Klikni **Přihlásit se**.

**Odhlášení:**
- Klikni na **Odhlásit se** v navigaci (zobrazeno jen přihlášeným).

---

### 1.4 Procházení a filtrování plaveb

Homepage zobrazuje karty všech dostupných plaveb.

**Filtrování:**
1. Vyplň libovolná pole filtru v horní části stránky:
   - **Destinace / Země** – hledá v názvu lokace i státu (nerozlišuje velká/malá písmena)
   - **Typ plavby** – vybrat ze seznamu (Relaxace, Dobrodružství, Výcvik)
   - **Datum od** – zobrazí jen plavby začínající v tento den nebo později
   - **Max. cena (Kč)** – skryje plavby dražší než zadaná hodnota
2. Klikni **Hledat**.
3. Pro zrušení filtru klikni **Resetovat**.

---

### 1.5 Detail plavby

Kliknutím na kartu plavby (obrázek nebo tlačítko Detail) se otevře stránka s:
- hero obrázkem plavby
- popisem, highlights a základními informacemi (datum, cena, kapacita, volná místa)
- rezervačním formulářem (dostupný přihlášeným uživatelům, kteří nejsou vlastníkem)

---

### 1.6 Rezervace plavby

**Podmínky:** musíš být přihlášena; plavba musí mít volná místa; nesmíš být vlastníkem nabídky.

1. Otevři detail plavby.
2. Vyplň rezervační formulář:
   - **Jméno** kontaktní osoby
   - **E-mail** kontaktní osoby
   - **Počet míst** (max. dostupná kapacita)
3. Klikni **Rezervovat**.

Po úspěšné rezervaci se zobrazí potvrzení s odkazem na Dashboard.

---

### 1.7 Správa rezervací (Dashboard)

Naviguj na **Můj přehled** (dostupné po přihlášení).

#### Zobrazení rezervace
- Klikni na název plavby v rezervaci → otevře se detail rezervace.

#### Úprava rezervace
1. Na stránce detailu rezervace klikni **Upravit**.
2. Změň kontaktní jméno, e-mail nebo počet míst.
3. Klikni **Uložit**.

#### Zrušení rezervace
1. Na stránce detailu rezervace klikni **Zrušit rezervaci**.
2. Potvrď zrušení → rezervace zmizí ze seznamu.

---

### 1.8 Profil

Naviguj na **Profil** (ikona nebo název v navigaci).

Zobrazí se: jméno, e-mail, role a datum registrace.

#### Úprava profilu
1. Klikni **Upravit profil**.
2. Změň jméno, e-mail nebo roli.
3. Klikni **Uložit změny**.

---

## 2. Příručka pro kapitána

### 2.1 Vytvoření nabídky plavby

**Podmínka:** musíš být přihlášena s rolí `Kapitán`.

1. Klikni na **Nová nabídka** v navigaci.
2. Vyplň formulář:
   - **Název** – název plavby
   - **Destinace** – konkrétní místo (přístav, záliv…)
   - **Stát** – země plavby
   - **Typ** – Relaxace / Dobrodružství / Výcvik
   - **Datum od / do**
   - **Kapacita** – max. počet míst
   - **Cena (Kč)**
   - **Skipper v ceně** – zaškrtni, pokud je skipper zahrnut
   - **Highlights** – stručné body (každý na nový řádek)
   - **Popis** – podrobnější informace
3. Volitelně nahraj obrázek:
   - Klikni **Vybrat soubor** → vyber jpg, png nebo webp (max. 10 MB)
4. Klikni **Vytvořit nabídku**.

Po úspěšném vytvoření jsi přesměrována na detail nové plavby. Nabídka se okamžitě zobrazí na homepage.

---

### 2.2 Úprava nabídky

1. Na stránce detailu plavby klikni **Upravit** (zobrazeno jen vlastníkovi).
2. Uprav libovolná pole.
3. Klikni **Uložit změny**.

---

### 2.3 Smazání nabídky

1. Na stránce detailu plavby klikni **Smazat** (zobrazeno jen vlastníkovi).
2. Nabídka je trvale odstraněna.

> Pozor: smazáním nabídky se nesmaží existující rezervace. Rezervace zůstanou v databázi, ale plavba již nebude dostupná.

---

### 2.4 Vlastní rezervace na Dashboardu

Kapitán vidí v **Můj přehled** dvě sekce:
- **Moje rezervace** – rezervace, které si kapitán sám vytvořil
- **Moje nabídky** – seznam vlastních plaveb s odkazem na detail a editaci

---

## 3. Administrátorská příručka

Aplikace nemá dedikované administrátorské rozhraní. Správa dat probíhá přímo přes databázi nebo API.

### 3.1 Přístup k databázi

Databáze `sailconnect` běží na MariaDB (port 3306).

```sql
-- Přihlášení
mysql -u root -p sailconnect

-- Výpis uživatelů
SELECT id, name, email, role, created_at FROM users;

-- Výpis plaveb
SELECT id, title, location, start_date, capacity, booked FROM trips;

-- Výpis rezervací
SELECT id, trip_id, user_id, seats, created_at FROM bookings;
```

### 3.2 Ruční vložení demo dat

Demo data se vloží automaticky při prvním startu backendu (DataSeeder). Pokud je potřeba reset:

```sql
-- Smazání všech dat (zachová schéma)
DELETE FROM bookings;
DELETE FROM trips;
DELETE FROM trip_type_def;
DELETE FROM users;
```

Poté restartuj backend – DataSeeder opět naplní tabulky.

### 3.3 Konfigurace backendu

Konfigurační soubor: `backend/src/main/resources/application.properties`

| Klíč | Výchozí hodnota | Popis |
|------|-----------------|-------|
| `spring.datasource.url` | `jdbc:mariadb://localhost:3306/sailconnect?createDatabaseIfNotExist=true` | URL databáze |
| `spring.datasource.username` | `root` | DB uživatel |
| `spring.datasource.password` | `Sail2026` | DB heslo |
| `spring.jpa.hibernate.ddl-auto` | `update` | Automatická správa schématu |
| `upload.dir` | `../frontend/public/images/uploads` | Složka pro nahrané obrázky |
| `spring.servlet.multipart.max-file-size` | `10MB` | Max. velikost nahraného souboru |

### 3.4 Spuštění backendu

```powershell
cd backend
.\mvnw spring-boot:run
```

Nebo jako JAR:
```powershell
.\mvnw package -DskipTests
java -jar target/sailconnect-backend-0.0.1-SNAPSHOT.jar
```

### 3.5 Spuštění testů

```powershell
# Backend (JUnit 5 + Mockito, bez DB)
cd backend
.\mvnw test

# Frontend (Vitest + jsdom)
cd frontend
npm run test:run
```

### 3.6 API testování

Importuj `SailConnect.postman_collection.json` do Postmanu.

Proměnné kolekce:
- `baseUrl` – výchozí `http://localhost:8080/api`
- `userId`, `tripId`, `bookingId` – plní se automaticky z odpovědí

Doporučené pořadí spuštění pro plný průchod:
1. Auth → Registrace
2. Plavby → Vytvoření plavby
3. Rezervace → Vytvoření rezervace
4. ostatní libovolně

---

## 4. Řešení problémů

| Problém | Příčina | Řešení |
|---------|---------|--------|
| Backend nastartuje, ale DB se nepřipojí | MariaDB neběží nebo špatné heslo | Ověřit `application.properties`, spustit MariaDB |
| `npm run dev` nefunguje | Chybí `node_modules` | Spustit `npm install` ve složce `frontend` |
| Upload obrázku selže | Složka `uploads` neexistuje | Vytvořit `frontend/public/images/uploads/` |
| 500 při odesílání formuláře | Backend nebyl restartován po změně kódu | Restartovat `.\mvnw spring-boot:run` |
| Obrázky demo dat se nezobrazují | Soubory chybí v `public/images/trips/` | Zkontrolovat, zda jsou obrázky přítomny |
