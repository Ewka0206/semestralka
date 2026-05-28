# Administrátorská příručka – SailConnect

**Verze:** 1.0  
**Datum:** 2026-05-27  
**Aplikace:** SailConnect – Najdi plavbu nebo posádku  
**Stack:** React 19 + Spring Boot 3.3 + MariaDB 10+

---

## Obsah

1. [Přehled architektury](#1-přehled-architektury)
2. [Požadavky na prostředí](#2-požadavky-na-prostředí)
3. [Instalace a první spuštění](#3-instalace-a-první-spuštění)
4. [Konfigurace backendu](#4-konfigurace-backendu)
5. [Konfigurace frontendu](#5-konfigurace-frontendu)
6. [Správa databáze](#6-správa-databáze)
7. [Správa nahraných souborů](#7-správa-nahraných-souborů)
8. [Spuštění aplikace](#8-spuštění-aplikace)
9. [Testování](#9-testování)
10. [Nasazení do produkce](#10-nasazení-do-produkce)
11. [Běžné operace a údržba](#11-běžné-operace-a-údržba)
12. [Řešení problémů](#12-řešení-problémů)

---

## 1. Přehled architektury

```
┌─────────────────────────────────────────────────────────────┐
│                        Klient (prohlížeč)                   │
│                  React 19 SPA (Vite + TypeScript)           │
│                        port 5173 (dev)                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP REST (JSON)
                            │ hlavička Authorization: Bearer <JWT>
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend – Spring Boot 3.3                     │
│                  REST API  /api/**                          │
│                        port 8080                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ JDBC (MariaDB Connector)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      MariaDB 10+                            │
│                  databáze: sailconnect                      │
│                        port 3306                            │
└─────────────────────────────────────────────────────────────┘
```

### Klíčové technologie

| Vrstva | Technologie | Verze |
|--------|-------------|-------|
| Frontend | React, TypeScript, Vite | React 19, Vite 6 |
| Backend | Spring Boot, Spring MVC | 3.3.x |
| Zabezpečení | Spring Security 6, JJWT | 0.12.6 |
| ORM | Spring Data JPA / Hibernate | – |
| Databáze | MariaDB | 10.6+ |
| Zabezpečení hesel | BCrypt | – |
| API dokumentace | SpringDoc OpenAPI | 2.6 |
| Build FE | npm | 10+ |
| Build BE | Maven | 3.9+ |

---

## 2. Požadavky na prostředí

### Software

| Nástroj | Minimální verze | Kontrola verze |
|---------|-----------------|----------------|
| Java (JDK) | 21 | `java -version` |
| Maven | 3.9 | `mvn -version` |
| Node.js | 18 | `node -v` |
| npm | 9 | `npm -v` |
| MariaDB | 10.6 | `mariadb --version` |

### Hardwarové minimum (vývojové prostředí)

- RAM: 2 GB volné paměti
- Disk: 500 MB pro aplikaci + prostor pro nahrané obrázky
- OS: Windows 10+, macOS 12+, Linux (Ubuntu 22.04+)

---

## 3. Instalace a první spuštění

### 3.1 Klonování repozitáře

```bash
git clone <url-repozitare>
cd semestralka
```

### 3.2 Nastavení databáze

1. Spusťte MariaDB a přihlaste se jako root:
   ```sql
   mysql -u root -p
   ```

2. Databázi vytvoří aplikace sama při startu (`createDatabaseIfNotExist=true`), ale doporučujeme ověřit přístup:
   ```sql
   CREATE DATABASE IF NOT EXISTS sailconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   SHOW DATABASES;
   EXIT;
   ```

3. Ujistěte se, že heslo v `application.properties` odpovídá heslu vašeho MariaDB root uživatele (viz sekce 4).

### 3.3 Instalace závislostí frontendu

```bash
cd frontend
npm install
```

### 3.4 První spuštění backendu

```bash
cd backend
./mvnw spring-boot:run        # Linux / macOS
mvnw.cmd spring-boot:run      # Windows
```

Při prvním startu Hibernate automaticky vytvoří tabulky a `DataSeeder` naplní databázi ukázkovými daty (19 nabídek plaveb, 3 typy plaveb, 190 zemí světa).

### 3.5 Spuštění vývojového serveru frontendu

```bash
cd frontend
npm run dev
```

Aplikace je dostupná na `http://localhost:5173`.

---

## 4. Konfigurace backendu

Konfigurační soubor: `backend/src/main/resources/application.properties`

```properties
# ── Databáze ──────────────────────────────────────────────────
spring.datasource.url=jdbc:mariadb://localhost:3306/sailconnect?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=Sail2026         # ← ZMĚŇTE v produkci
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

# ── Hibernate / JPA ───────────────────────────────────────────
spring.jpa.hibernate.ddl-auto=update        # create | update | validate | none
spring.jpa.show-sql=true                    # false v produkci
spring.jpa.properties.hibernate.format_sql=false

# ── Server ────────────────────────────────────────────────────
server.port=8080

# ── Nahrávání souborů ─────────────────────────────────────────
images.dir=../frontend/public/images/
upload.dir=../frontend/public/images/uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Popis klíčových parametrů

| Parametr | Popis | Doporučení pro produkci |
|----------|-------|-------------------------|
| `spring.datasource.password` | Heslo k databázi | Nastavit jako env proměnnou |
| `spring.jpa.hibernate.ddl-auto` | Správa schématu DB | Změnit na `validate` nebo `none` |
| `spring.jpa.show-sql` | SQL dotazy v logu | Nastavit na `false` |
| `upload.dir` | Adresář pro nahrané obrázky | Absolutní cesta mimo repozitář |
| `server.port` | Port backendu | 8080 nebo dle konfigurace |

### Použití proměnných prostředí (doporučeno pro produkci)

```properties
spring.datasource.password=${DB_PASSWORD}
upload.dir=${UPLOAD_DIR:/var/sailconnect/uploads}
```

Spuštění:
```bash
DB_PASSWORD=tajne_heslo UPLOAD_DIR=/var/sailconnect/uploads ./mvnw spring-boot:run
```

---

## 5. Konfigurace frontendu

### 5.1 Proměnné prostředí

Soubor `frontend/.env` (nebo `.env.local` pro lokální přepsání):

```env
VITE_API_URL=http://localhost:8080
```

Pokud soubor neexistuje, frontend volá API na `http://localhost:8080` (výchozí).

### 5.2 CORS konfigurace

Backend povoluje požadavky z frontendu. Konfigurace v souboru:  
`backend/src/main/java/com/sailconnect/config/CorsConfig.java`

Pro produkci je nutné změnit povolené origin na skutečnou doménu:
```java
configuration.setAllowedOrigins(List.of("https://vasedomena.cz"));
```

### 5.3 Build frontendu pro produkci

```bash
cd frontend
npm run build
```

Výstup bude v adresáři `frontend/dist/` – obsah nasaďte na webový server (nginx, Apache) nebo statický hosting.

---

## 6. Správa databáze

### 6.1 Struktura tabulek

| Tabulka | Popis |
|---------|-------|
| `users` | Uživatelské účty |
| `trips` | Nabídky plaveb |
| `bookings` | Rezervace |
| `trip_type_def` | Číselník typů plaveb (RELAX, TRAINING, ADVENTURE) |
| `country` | Číselník zemí světa (190 záznamů, ISO 3166-1 alpha-2) |

### 6.2 Schéma tabulky `users`

```sql
CREATE TABLE users (
    id         VARCHAR(36)  PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,      -- BCrypt hash
    name       VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL,      -- 'CREW' nebo 'CAPTAIN'
    created_at VARCHAR(50)  NOT NULL,      -- ISO 8601
    updated_at VARCHAR(50)  NOT NULL
);
```

### 6.3 Schéma tabulky `trips`

```sql
CREATE TABLE trips (
    id               VARCHAR(64)  PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    location         VARCHAR(255) NOT NULL,
    country          VARCHAR(255),
    type             VARCHAR(20)  NOT NULL,  -- 'TRAINING', 'ADVENTURE', 'RELAX'
    start_date       VARCHAR(20)  NOT NULL,  -- YYYY-MM-DD
    end_date         VARCHAR(20)  NOT NULL,
    price_czk        INT          NOT NULL,
    capacity         INT          NOT NULL,
    booked           INT          DEFAULT 0,
    skipper_included TINYINT(1)   DEFAULT 0,
    highlights       TEXT,                  -- JSON pole stringů
    description      TEXT,
    image_url        VARCHAR(500),
    owner_user_id    VARCHAR(36)
);
```

### 6.4 Schéma tabulky `bookings`

```sql
CREATE TABLE bookings (
    id            VARCHAR(36)  PRIMARY KEY,
    trip_id       VARCHAR(64)  NOT NULL,
    created_at    VARCHAR(50)  NOT NULL,    -- ISO 8601
    seats         INT          NOT NULL,
    contact_name  VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    user_id       VARCHAR(36)
);
```

### 6.5 Ruční operace s databází

**Výpis všech uživatelů:**
```sql
SELECT id, email, name, role, created_at FROM users;
```

**Smazání uživatele:**
```sql
DELETE FROM users WHERE id = 'uuid-uzivatele';
```

**Ruční reset hesla (BCrypt hash pro `noveHeslo123`):**
```sql
UPDATE users 
SET password = '$2a$10$...' 
WHERE email = 'uzivatel@example.com';
```
> BCrypt hash je nutné vygenerovat externím nástrojem nebo přes API.

**Výpis plaveb s počtem rezervací:**
```sql
SELECT t.id, t.title, t.booked, t.capacity,
       COUNT(b.id) AS pocet_rezervaci
FROM trips t
LEFT JOIN bookings b ON b.trip_id = t.id
GROUP BY t.id;
```

**Aktualizace počtu rezervovaných míst (v případě nesouladu):**
```sql
UPDATE trips t
SET t.booked = COALESCE(
    (SELECT SUM(b.seats) FROM bookings b WHERE b.trip_id = t.id),
    0
)
WHERE t.id = 'id-plavby';
```

### 6.6 Záloha a obnova databáze

**Záloha:**
```bash
mysqldump -u root -p sailconnect > backup_sailconnect_$(date +%Y%m%d).sql
```

**Obnova:**
```bash
mysql -u root -p sailconnect < backup_sailconnect_20260101.sql
```

---

## 7. Správa nahraných souborů

Nahrané obrázky jsou ukládány do:
```
frontend/public/images/uploads/
```

Název souboru je generován jako UUID s původní příponou (např. `3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg`).

### Povolené formáty

`jpg`, `jpeg`, `png`, `webp` – maximální velikost **10 MB** na soubor.

### Čištění nepotřebných souborů

Smazané plavby neodstraňují automaticky nahrané obrázky. Pro ruční čištění:

```bash
# Linux/macOS – smazání obrázků starších než 30 dní
find frontend/public/images/uploads/ -name "*.jpg" -mtime +30 -delete
find frontend/public/images/uploads/ -name "*.png" -mtime +30 -delete
find frontend/public/images/uploads/ -name "*.webp" -mtime +30 -delete
```

```powershell
# Windows PowerShell
$limit = (Get-Date).AddDays(-30)
Get-ChildItem "frontend\public\images\uploads\" |
  Where-Object { $_.LastWriteTime -lt $limit } |
  Remove-Item -Force
```

---

## 8. Spuštění aplikace

### 8.1 Vývojové prostředí (paralelní spuštění)

**Terminál 1 – Backend:**
```bash
cd backend
./mvnw spring-boot:run
# Backend běží na http://localhost:8080
```

**Terminál 2 – Frontend:**
```bash
cd frontend
npm run dev
# Frontend běží na http://localhost:5173
```

### 8.2 Sestavení a spuštění jako JAR

```bash
# Build backendu
cd backend
./mvnw clean package -DskipTests

# Spuštění JAR
java -jar target/sailconnect-*.jar
```

### 8.3 Ověření dostupnosti

| Endpoint | Očekávaná odpověď |
|----------|-------------------|
| `GET http://localhost:8080/api/trips` | JSON pole plaveb |
| `GET http://localhost:8080/api/trips/search?type=RELAX&page=0&size=5` | Stránkovaný výsledek `{"content":[...],"totalElements":N,...}` |
| `GET http://localhost:8080/api/trip-types` | `[{"code":"RELAX","label":"Rekreační plavba"},...]` |
| `GET http://localhost:8080/api/countries` | JSON pole 190 zemí (code + name) |
| `GET http://localhost:8080/actuator/health` | `{"status":"UP"}` |
| `http://localhost:5173` | Domovská stránka aplikace |

---

## 9. Testování

### 9.1 Backend testy

```bash
cd backend
./mvnw test
```

Testy jsou umístěny v `backend/src/test/java/com/sailconnect/`:
- `service/AuthServiceTest.java` – testy autentizace
- `service/TripServiceTest.java` – testy správy plaveb
- `service/BookingServiceTest.java` – testy rezervací
- `exception/GlobalExceptionHandlerTest.java` – testy ošetření chyb

Celkem: **39 testů** (AuthServiceTest: 10, TripServiceTest: 12, BookingServiceTest: 12, GlobalExceptionHandlerTest: 5)

### 9.2 Frontend testy

```bash
cd frontend
npm test
# nebo
npm run test
```

Celkem: **24 testů** (5 testovacích souborů)

API dokumentace je dostupná po spuštění backendu na:
```
http://localhost:8080/swagger-ui.html
```

### 9.3 Postman kolekce

Pro ruční testování API je k dispozici Postman kolekce v repozitáři. Importujte ji do aplikace Postman a spusťte požadavky proti běžícímu backendu na `http://localhost:8080`.

---

## 10. Nasazení do produkce

### 10.1 Checklist před nasazením

- [ ] Změnit heslo k databázi v `application.properties` nebo nastavit env proměnnou `DB_PASSWORD`
- [ ] Nastavit `spring.jpa.show-sql=false`
- [ ] Nastavit `spring.jpa.hibernate.ddl-auto=validate` (po prvním nasazení)
- [ ] Nastavit CORS na skutečnou produkční doménu v `CorsConfig.java`
- [ ] Sestavit frontend: `npm run build`
- [ ] Nastavit absolutní cestu k adresáři pro uploady mimo webroot
- [ ] Nakonfigurovat HTTPS (doporučeno přes reverzní proxy nginx/Apache)
- [ ] Nastavit pravidelné zálohy databáze

### 10.2 Doporučená konfigurace nginx (reverzní proxy)

```nginx
server {
    listen 80;
    server_name vasedomena.cz;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name vasedomena.cz;

    ssl_certificate     /etc/letsencrypt/live/vasedomena.cz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vasedomena.cz/privkey.pem;

    # Statické soubory frontendu
    root /var/www/sailconnect/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy na backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Nahrané obrázky
    location /images/uploads/ {
        alias /var/sailconnect/uploads/;
    }
}
```

### 10.3 Spuštění backendu jako systemd služba (Linux)

Soubor `/etc/systemd/system/sailconnect.service`:
```ini
[Unit]
Description=SailConnect Backend
After=network.target mariadb.service

[Service]
User=sailconnect
WorkingDirectory=/opt/sailconnect
ExecStart=/usr/bin/java -jar /opt/sailconnect/sailconnect.jar
EnvironmentFile=/opt/sailconnect/.env
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable sailconnect
sudo systemctl start sailconnect
sudo systemctl status sailconnect
```

---

## 11. Běžné operace a údržba

### 11.1 Ruční reset hesla uživatele

Hesla jsou hashována algoritmem **BCrypt**. Přímá editace v databázi vyžaduje vygenerování hashe:

**Pomocí Spring Security CLI (nebo online nástrojů):**
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy/
```
Toto je BCrypt hash pro heslo `heslo123`.

```sql
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy/'
WHERE email = 'uzivatel@example.com';
```

### 11.2 Smazání uživatele a jeho dat

```sql
-- 1. Smazat rezervace uživatele
DELETE FROM bookings WHERE user_id = 'uuid-uzivatele';

-- 2. Smazat nabídky plaveb uživatele (a jejich rezervace)
DELETE FROM bookings WHERE trip_id IN 
    (SELECT id FROM trips WHERE owner_user_id = 'uuid-uzivatele');
DELETE FROM trips WHERE owner_user_id = 'uuid-uzivatele';

-- 3. Smazat samotný účet
DELETE FROM users WHERE id = 'uuid-uzivatele';
```

### 11.3 Přidání nového typu plavby

```sql
INSERT INTO trip_type_def (code, label) VALUES ('RACING', 'Závodní plavba');
```

> Po přidání nového kódu je nutné ho přidat také do výčtu `TripType.java` v backendu a sestavit aplikaci znovu.

### 11.4 Zobrazení Swagger API dokumentace

Po spuštění backendu jsou všechny endpointy zdokumentovány na:
```
http://localhost:8080/swagger-ui.html
```

Zobrazuje rozdělení do skupin (Auth, Plavby, Rezervace, Uživatelé, Číselníky, Upload), schémata požadavků a odpovědí a umožňuje volání API přímo z prohlížeče po zadání Bearer tokenu přes tlačítko **Authorize**.

### 11.5 Zobrazení logů backendu

```bash
# Pokud běží jako systemd služba
sudo journalctl -u sailconnect -f

# Pokud běží přes Maven
# Logy se zobrazují přímo v terminálu
```

---

## 12. Řešení problémů

### Backend se nespustí – chyba připojení k databázi

**Příznak:**
```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

**Řešení:**
1. Ověřte, že MariaDB běží: `systemctl status mariadb` nebo `mysqladmin ping`
2. Zkontrolujte heslo v `application.properties`
3. Ověřte port: `netstat -tlnp | grep 3306`

---

### Frontend zobrazuje „Failed to fetch" nebo prázdný seznam

**Příznak:** Stránka se načte, ale data se nezobrazí.

**Řešení:**
1. Ověřte, že backend běží: `curl http://localhost:8080/api/trips`
2. Zkontrolujte CORS konfiguraci v `CorsConfig.java`
3. Zkontrolujte, zda prohlížeč neblokuje smíšený obsah (HTTP/HTTPS)

---

### Nahrání obrázku selže

**Příznak:** Chyba „Povolené formáty: jpg, png, webp" nebo server error.

**Řešení:**
1. Ověřte formát souboru (pouze jpg, jpeg, png, webp).
2. Zkontrolujte, že adresář `upload.dir` existuje a má práva pro zápis:
   ```bash
   ls -la frontend/public/images/uploads/
   chmod 755 frontend/public/images/uploads/
   ```
3. Zkontrolujte maximální velikost souboru (10 MB).

---

### Tabulky v databázi neexistují

**Příznak:** `Table 'sailconnect.trips' doesn't exist`

**Řešení:**
Nastavte `spring.jpa.hibernate.ddl-auto=update` a restartujte backend. Hibernate tabulky vytvoří automaticky.

---

### Port 8080 je obsazen

**Příznak:** `Port 8080 was already in use.`

**Řešení:**
```bash
# Linux/macOS – zjistěte a ukončete proces
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <pid> /F
```

Nebo změňte port v `application.properties`:
```properties
server.port=8081
```