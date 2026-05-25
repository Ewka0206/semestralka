# SDD – Software Design Document
## Sail Connect

**Verze:** 1.0  
**Datum:** 2026-05-25  
**Autor:** Eva Kratěnová

---

## 1. Architektura systému

### 1.1 Přehled

Systém je postaven jako třívrstvá architektura:

```
┌──────────────────────────────────────┐
│           Prezentační vrstva          │
│  React 19 SPA (TypeScript + Vite)    │
│  http://localhost:5173               │
└──────────────┬───────────────────────┘
               │ HTTP REST  /api/**
               │ Header: X-User-Id
┌──────────────▼───────────────────────┐
│           Aplikační vrstva            │
│  Spring Boot 3.3 REST API (Java 21)  │
│  http://localhost:8080               │
└──────────────┬───────────────────────┘
               │ Spring Data JPA / Hibernate
┌──────────────▼───────────────────────┐
│           Datová vrstva               │
│  MariaDB (port 3306)                 │
│  databáze: sailconnect               │
└──────────────────────────────────────┘
```

### 1.2 Klíčová architektonická rozhodnutí

| Rozhodnutí | Důvod |
|-----------|-------|
| Bez JWT (X-User-Id hlavička) | Zjednodušení pro výukový projekt; vhodné pro SPA s localStorage |
| UUID jako primární klíče | Nevyžaduje auto-increment koordinaci; přenositelné |
| `ddl-auto=update` | Automatická správa schématu bez migrací; vhodné pro vývoj |
| Module-level cache pro číselníky | Eliminuje opakované API volání pro statická data |
| Deferred filter pattern | Filtr se aktivuje explicitně, ne při každém keystroke |

---

## 2. Backend – Spring Boot

### 2.1 Package struktura

```
com.sailconnect/
├── SailConnectApplication.java       – vstupní bod
├── config/
│   ├── AppConfig.java                – BCryptPasswordEncoder bean
│   └── CorsConfig.java               – CORS povolení pro frontend
├── controller/
│   ├── AuthController.java           – POST /api/auth/login, register
│   ├── TripController.java           – CRUD /api/trips
│   ├── BookingController.java        – CRUD /api/bookings
│   ├── UserController.java           – GET/PUT /api/users/{id}
│   ├── TripTypeController.java       – GET /api/trip-types
│   └── UploadController.java         – POST /api/upload
├── service/
│   ├── AuthService.java
│   ├── TripService.java
│   └── BookingService.java
├── repository/
│   ├── UserRepository.java
│   ├── TripRepository.java
│   ├── BookingRepository.java
│   └── TripTypeDefRepository.java
├── model/
│   ├── User.java
│   ├── Trip.java
│   ├── Booking.java
│   ├── TripTypeDef.java
│   ├── UserRole.java                 – enum: CREW, CAPTAIN
│   ├── TripType.java                 – enum: RELAX, ADVENTURE, TRAINING
│   └── StringListConverter.java      – JPA converter: List<String> ↔ JSON text
├── dto/
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── UpdateUserRequest.java
│   ├── UserResponse.java
│   └── ErrorResponse.java
├── exception/
│   └── GlobalExceptionHandler.java   – @RestControllerAdvice
└── data/
    └── DataSeeder.java               – ApplicationReadyEvent listener
```

### 2.2 Vzory použité v backendu

**Error handling – jednotný formát:**
```
Každá chyba → GlobalExceptionHandler → ErrorResponse { status, message, errors }
```

**Dvouvrstvá validace:**
```
@Valid na @RequestBody (Bean Validation)
  → MethodArgumentNotValidException → 400 s mapou chyb per-field
Null-safety v service metodách
  → ResponseStatusException(BAD_REQUEST) pro null email/heslo
```

---

## 3. Databázové schéma

### 3.1 ER diagram – popis tabulek

#### Tabulka `users`
| Sloupec | Typ | Omezení |
|---------|-----|---------|
| `id` | VARCHAR(36) | PK |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | NOT NULL (BCrypt) |
| `name` | VARCHAR(255) | NOT NULL |
| `role` | ENUM(CREW,CAPTAIN) | NOT NULL, DEFAULT CREW |
| `created_at` | VARCHAR(30) | NOT NULL (ISO 8601) |
| `updated_at` | VARCHAR(30) | NOT NULL (ISO 8601) |

#### Tabulka `trips`
| Sloupec | Typ | Omezení |
|---------|-----|---------|
| `id` | VARCHAR(64) | PK |
| `title` | VARCHAR(255) | NOT NULL |
| `location` | VARCHAR(255) | NOT NULL |
| `country` | VARCHAR(255) | |
| `type` | ENUM(RELAX,ADVENTURE,TRAINING) | NOT NULL |
| `start_date` | VARCHAR(30) | NOT NULL |
| `end_date` | VARCHAR(30) | NOT NULL |
| `price_czk` | INT | |
| `capacity` | INT | |
| `booked` | INT | DEFAULT 0 |
| `skipper_included` | BOOLEAN | DEFAULT false |
| `highlights` | TEXT | (JSON array) |
| `description` | TEXT | |
| `image_url` | VARCHAR(255) | |
| `owner_user_id` | VARCHAR(36) | FK → users.id |

#### Tabulka `bookings`
| Sloupec | Typ | Omezení |
|---------|-----|---------|
| `id` | VARCHAR(36) | PK |
| `trip_id` | VARCHAR(64) | NOT NULL, FK → trips.id |
| `user_id` | VARCHAR(36) | FK → users.id |
| `contact_name` | VARCHAR(255) | NOT NULL |
| `contact_email` | VARCHAR(255) | NOT NULL |
| `seats` | INT | |
| `created_at` | VARCHAR(30) | NOT NULL |

#### Tabulka `trip_type_def`
| Sloupec | Typ | Omezení |
|---------|-----|---------|
| `id` | BIGINT | PK, AUTO_INCREMENT |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL |
| `label` | VARCHAR(255) | NOT NULL |

### 3.2 ER diagram (draw.io XML)

> **Import:** Otevřít draw.io → Extras → Edit Diagram → vložit XML níže → OK

```xml
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- USERS TABLE -->
    <mxCell id="2" value="users" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="60" y="160" width="220" height="220" as="geometry" />
    </mxCell>
    <mxCell id="3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="2">
      <mxGeometry y="30" width="220" height="30" as="geometry" />
    </mxCell>
    <mxCell id="4" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="3">
      <mxGeometry width="40" height="30" as="geometry" />
    </mxCell>
    <mxCell id="5" value="id: VARCHAR(36)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="3">
      <mxGeometry x="40" width="180" height="30" as="geometry" />
    </mxCell>
    <mxCell id="6" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="2">
      <mxGeometry y="60" width="220" height="25" as="geometry" />
    </mxCell>
    <mxCell id="7" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="6">
      <mxGeometry width="40" height="25" as="geometry" />
    </mxCell>
    <mxCell id="8" value="email: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="6">
      <mxGeometry x="40" width="180" height="25" as="geometry" />
    </mxCell>
    <mxCell id="9" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="2">
      <mxGeometry y="85" width="220" height="25" as="geometry" />
    </mxCell>
    <mxCell id="10" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="9">
      <mxGeometry width="40" height="25" as="geometry" />
    </mxCell>
    <mxCell id="11" value="password: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="9">
      <mxGeometry x="40" width="180" height="25" as="geometry" />
    </mxCell>
    <mxCell id="12" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="2">
      <mxGeometry y="110" width="220" height="25" as="geometry" />
    </mxCell>
    <mxCell id="13" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="12">
      <mxGeometry width="40" height="25" as="geometry" />
    </mxCell>
    <mxCell id="14" value="name: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="12">
      <mxGeometry x="40" width="180" height="25" as="geometry" />
    </mxCell>
    <mxCell id="15" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="2">
      <mxGeometry y="135" width="220" height="25" as="geometry" />
    </mxCell>
    <mxCell id="16" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="15">
      <mxGeometry width="40" height="25" as="geometry" />
    </mxCell>
    <mxCell id="17" value="role: ENUM" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="15">
      <mxGeometry x="40" width="180" height="25" as="geometry" />
    </mxCell>
    <mxCell id="18" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="2">
      <mxGeometry y="160" width="220" height="25" as="geometry" />
    </mxCell>
    <mxCell id="19" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="18">
      <mxGeometry width="40" height="25" as="geometry" />
    </mxCell>
    <mxCell id="20" value="created_at: VARCHAR(30)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="18">
      <mxGeometry x="40" width="180" height="25" as="geometry" />
    </mxCell>
    <mxCell id="21" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="2">
      <mxGeometry y="185" width="220" height="25" as="geometry" />
    </mxCell>
    <mxCell id="22" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="21">
      <mxGeometry width="40" height="25" as="geometry" />
    </mxCell>
    <mxCell id="23" value="updated_at: VARCHAR(30)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="21">
      <mxGeometry x="40" width="180" height="25" as="geometry" />
    </mxCell>

    <!-- TRIPS TABLE -->
    <mxCell id="30" value="trips" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="380" y="60" width="240" height="420" as="geometry" />
    </mxCell>
    <mxCell id="31" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="30">
      <mxGeometry y="30" width="240" height="28" as="geometry" />
    </mxCell>
    <mxCell id="32" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="31">
      <mxGeometry width="40" height="28" as="geometry" />
    </mxCell>
    <mxCell id="33" value="id: VARCHAR(64)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="31">
      <mxGeometry x="40" width="200" height="28" as="geometry" />
    </mxCell>
    <mxCell id="34" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30">
      <mxGeometry y="58" width="240" height="23" as="geometry" />
    </mxCell>
    <mxCell id="35" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="34"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="36" value="title: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="34"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="37" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="81" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="38" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="37"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="39" value="location: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="37"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="40" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="104" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="41" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="40"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="42" value="country: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="40"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="43" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="127" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="44" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="43"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="45" value="type: ENUM" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="43"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="46" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="150" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="47" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="46"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="48" value="start_date / end_date" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="46"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="49" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="173" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="50" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="49"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="51" value="price_czk / capacity" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="49"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="52" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="196" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="53" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="52"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="54" value="booked: INT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="52"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="55" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="219" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="56" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="55"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="57" value="skipper_included: BOOL" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="55"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="58" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="242" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="59" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="58"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="60" value="highlights: TEXT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="58"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="61" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="265" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="62" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="61"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="63" value="description: TEXT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="61"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="64" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="288" width="240" height="23" as="geometry" /></mxCell>
    <mxCell id="65" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="64"><mxGeometry width="40" height="23" as="geometry" /></mxCell>
    <mxCell id="66" value="image_url: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="64"><mxGeometry x="40" width="200" height="23" as="geometry" /></mxCell>
    <mxCell id="67" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30"><mxGeometry y="311" width="240" height="28" as="geometry" /></mxCell>
    <mxCell id="68" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="67"><mxGeometry width="40" height="28" as="geometry" /></mxCell>
    <mxCell id="69" value="owner_user_id: VARCHAR(36)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="67"><mxGeometry x="40" width="200" height="28" as="geometry" /></mxCell>

    <!-- BOOKINGS TABLE -->
    <mxCell id="70" value="bookings" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="380" y="550" width="240" height="230" as="geometry" />
    </mxCell>
    <mxCell id="71" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="70"><mxGeometry y="30" width="240" height="28" as="geometry" /></mxCell>
    <mxCell id="72" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="71"><mxGeometry width="40" height="28" as="geometry" /></mxCell>
    <mxCell id="73" value="id: VARCHAR(36)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="71"><mxGeometry x="40" width="200" height="28" as="geometry" /></mxCell>
    <mxCell id="74" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="70"><mxGeometry y="58" width="240" height="24" as="geometry" /></mxCell>
    <mxCell id="75" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="74"><mxGeometry width="40" height="24" as="geometry" /></mxCell>
    <mxCell id="76" value="trip_id: VARCHAR(64)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="74"><mxGeometry x="40" width="200" height="24" as="geometry" /></mxCell>
    <mxCell id="77" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="70"><mxGeometry y="82" width="240" height="24" as="geometry" /></mxCell>
    <mxCell id="78" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="77"><mxGeometry width="40" height="24" as="geometry" /></mxCell>
    <mxCell id="79" value="user_id: VARCHAR(36)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="77"><mxGeometry x="40" width="200" height="24" as="geometry" /></mxCell>
    <mxCell id="80" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="70"><mxGeometry y="106" width="240" height="24" as="geometry" /></mxCell>
    <mxCell id="81" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="80"><mxGeometry width="40" height="24" as="geometry" /></mxCell>
    <mxCell id="82" value="contact_name: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="80"><mxGeometry x="40" width="200" height="24" as="geometry" /></mxCell>
    <mxCell id="83" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="70"><mxGeometry y="130" width="240" height="24" as="geometry" /></mxCell>
    <mxCell id="84" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="83"><mxGeometry width="40" height="24" as="geometry" /></mxCell>
    <mxCell id="85" value="contact_email: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="83"><mxGeometry x="40" width="200" height="24" as="geometry" /></mxCell>
    <mxCell id="86" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="70"><mxGeometry y="154" width="240" height="24" as="geometry" /></mxCell>
    <mxCell id="87" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="86"><mxGeometry width="40" height="24" as="geometry" /></mxCell>
    <mxCell id="88" value="seats: INT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="86"><mxGeometry x="40" width="200" height="24" as="geometry" /></mxCell>
    <mxCell id="89" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="70"><mxGeometry y="178" width="240" height="24" as="geometry" /></mxCell>
    <mxCell id="90" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="89"><mxGeometry width="40" height="24" as="geometry" /></mxCell>
    <mxCell id="91" value="created_at: VARCHAR(30)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="89"><mxGeometry x="40" width="200" height="24" as="geometry" /></mxCell>

    <!-- TRIP_TYPE_DEF TABLE -->
    <mxCell id="100" value="trip_type_def" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="700" y="200" width="210" height="130" as="geometry" />
    </mxCell>
    <mxCell id="101" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="100"><mxGeometry y="30" width="210" height="28" as="geometry" /></mxCell>
    <mxCell id="102" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="101"><mxGeometry width="40" height="28" as="geometry" /></mxCell>
    <mxCell id="103" value="id: BIGINT AI" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="101"><mxGeometry x="40" width="170" height="28" as="geometry" /></mxCell>
    <mxCell id="104" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="100"><mxGeometry y="58" width="210" height="24" as="geometry" /></mxCell>
    <mxCell id="105" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="104"><mxGeometry width="40" height="24" as="geometry" /></mxCell>
    <mxCell id="106" value="code: VARCHAR(50) UQ" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="104"><mxGeometry x="40" width="170" height="24" as="geometry" /></mxCell>
    <mxCell id="107" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="100"><mxGeometry y="82" width="210" height="24" as="geometry" /></mxCell>
    <mxCell id="108" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="107"><mxGeometry width="40" height="24" as="geometry" /></mxCell>
    <mxCell id="109" value="label: VARCHAR(255)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="107"><mxGeometry x="40" width="170" height="24" as="geometry" /></mxCell>

    <!-- RELATIONSHIPS -->
    <!-- users 1:N trips (owner) -->
    <mxCell id="200" value="" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERmanyToOne;startArrow=ERmandOne;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="67" target="3">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="201" value="owner" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" vertex="1" connectable="0" parent="200"><mxGeometry x="-0.2" relative="1" as="geometry"><mxPoint as="offset" /></mxGeometry></mxCell>

    <!-- trips 1:N bookings -->
    <mxCell id="202" value="" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERmanyToOne;startArrow=ERmandOne;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="74" target="31">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <mxCell id="203" value="trip" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" vertex="1" connectable="0" parent="202"><mxGeometry x="-0.2" relative="1" as="geometry"><mxPoint as="offset" /></mxGeometry></mxCell>

    <!-- users 1:N bookings -->
    <mxCell id="204" value="" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERmanyToOne;startArrow=ERmandOne;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.85;entryDx=0;entryDy=0;" edge="1" parent="1" source="77" target="2">
      <mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="280" y="634" /><mxPoint x="20" y="634" /><mxPoint x="20" y="302" /></Array></mxGeometry>
    </mxCell>
    <mxCell id="205" value="user" style="edgeLabel;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" vertex="1" connectable="0" parent="204"><mxGeometry x="-0.3" relative="1" as="geometry"><mxPoint as="offset" /></mxGeometry></mxCell>

  </root>
</mxGraphModel>
```

---

## 4. Class diagram – backend (draw.io XML)

> **Import:** Otevřít draw.io → Extras → Edit Diagram → vložit XML níže → OK

```xml
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1654" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- AuthController -->
    <mxCell id="10" value="«controller»&#xa;AuthController" style="swimlane;fontStyle=1;align=center;startSize=40;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="40" y="40" width="200" height="100" as="geometry" />
    </mxCell>
    <mxCell id="11" value="+ login(LoginRequest): UserResponse&#xa;+ register(RegisterRequest): UserResponse" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="10">
      <mxGeometry y="40" width="200" height="60" as="geometry" />
    </mxCell>

    <!-- TripController -->
    <mxCell id="20" value="«controller»&#xa;TripController" style="swimlane;fontStyle=1;align=center;startSize=40;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="280" y="40" width="210" height="120" as="geometry" />
    </mxCell>
    <mxCell id="21" value="+ getAll(owner?): List&lt;Trip&gt;&#xa;+ getById(id): Trip&#xa;+ create(Trip): Trip&#xa;+ update(id, Trip): Trip&#xa;+ delete(id): void" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;" vertex="1" parent="20">
      <mxGeometry y="40" width="210" height="80" as="geometry" />
    </mxCell>

    <!-- BookingController -->
    <mxCell id="30" value="«controller»&#xa;BookingController" style="swimlane;fontStyle=1;align=center;startSize=40;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="530" y="40" width="210" height="120" as="geometry" />
    </mxCell>
    <mxCell id="31" value="+ getAll(userId?): List&lt;Booking&gt;&#xa;+ getById(id): Booking&#xa;+ create(Booking): Booking&#xa;+ update(id, Booking): Booking&#xa;+ delete(id): void" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;" vertex="1" parent="30">
      <mxGeometry y="40" width="210" height="80" as="geometry" />
    </mxCell>

    <!-- UserController -->
    <mxCell id="40" value="«controller»&#xa;UserController" style="swimlane;fontStyle=1;align=center;startSize=40;fontSize=12;" vertex="1" parent="1">
      <mxGeometry x="780" y="40" width="200" height="90" as="geometry" />
    </mxCell>
    <mxCell id="41" value="+ getById(id): UserResponse&#xa;+ update(id, UpdateUserRequest): UserResponse" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;" vertex="1" parent="40">
      <mxGeometry y="40" width="200" height="50" as="geometry" />
    </mxCell>

    <!-- AuthService -->
    <mxCell id="50" value="«service»&#xa;AuthService" style="swimlane;fontStyle=1;align=center;startSize=40;fontSize=12;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="40" y="240" width="200" height="110" as="geometry" />
    </mxCell>
    <mxCell id="51" value="- userRepo: UserRepository&#xa;- encoder: BCryptPasswordEncoder&#xa;+ login(LoginRequest): UserResponse&#xa;+ register(RegisterRequest): UserResponse&#xa;+ updateUser(id, req): UserResponse" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;" vertex="1" parent="50">
      <mxGeometry y="40" width="200" height="70" as="geometry" />
    </mxCell>

    <!-- TripService -->
    <mxCell id="60" value="«service»&#xa;TripService" style="swimlane;fontStyle=1;align=center;startSize=40;fontSize=12;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="280" y="240" width="210" height="110" as="geometry" />
    </mxCell>
    <mxCell id="61" value="- tripRepo: TripRepository&#xa;+ getAll(owner?): List&lt;Trip&gt;&#xa;+ getById(id): Trip&#xa;+ create(trip): Trip&#xa;+ update(id, trip): Trip&#xa;+ delete(id): void" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;" vertex="1" parent="60">
      <mxGeometry y="40" width="210" height="70" as="geometry" />
    </mxCell>

    <!-- BookingService -->
    <mxCell id="70" value="«service»&#xa;BookingService" style="swimlane;fontStyle=1;align=center;startSize=40;fontSize=12;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="530" y="240" width="210" height="110" as="geometry" />
    </mxCell>
    <mxCell id="71" value="- bookingRepo: BookingRepository&#xa;- tripRepo: TripRepository&#xa;+ getAll(userId?): List&lt;Booking&gt;&#xa;+ getById(id): Booking&#xa;+ create(b): Booking&#xa;+ update(id, b): Booking&#xa;+ delete(id): void" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;" vertex="1" parent="70">
      <mxGeometry y="40" width="210" height="70" as="geometry" />
    </mxCell>

    <!-- GlobalExceptionHandler -->
    <mxCell id="80" value="«@RestControllerAdvice»&#xa;GlobalExceptionHandler" style="swimlane;fontStyle=1;align=center;startSize=40;fontSize=12;fillColor=#ffe6cc;strokeColor=#d6b656;" vertex="1" parent="1">
      <mxGeometry x="780" y="240" width="220" height="90" as="geometry" />
    </mxCell>
    <mxCell id="81" value="+ handleValidation(): 400&#xa;+ handleResponseStatus(): passthrough&#xa;+ handleIllegalArgument(): 400&#xa;+ handleGeneric(): 500" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;" vertex="1" parent="80">
      <mxGeometry y="40" width="220" height="50" as="geometry" />
    </mxCell>

    <!-- Repositories -->
    <mxCell id="90" value="«interface»&#xa;UserRepository" style="swimlane;fontStyle=3;align=center;startSize=40;fontSize=12;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="40" y="460" width="200" height="70" as="geometry" />
    </mxCell>
    <mxCell id="91" value="findByEmailIgnoreCase(email)&#xa;existsByEmailIgnoreCase(email)" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;overflow=hidden;rotatable=0;" vertex="1" parent="90">
      <mxGeometry y="40" width="200" height="30" as="geometry" />
    </mxCell>

    <mxCell id="92" value="«interface»&#xa;TripRepository" style="swimlane;fontStyle=3;align=center;startSize=40;fontSize=12;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="280" y="460" width="210" height="70" as="geometry" />
    </mxCell>
    <mxCell id="93" value="findByOwnerUserId(ownerId)&#xa;(+ JpaRepository CRUD)" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;overflow=hidden;rotatable=0;" vertex="1" parent="92">
      <mxGeometry y="40" width="210" height="30" as="geometry" />
    </mxCell>

    <mxCell id="94" value="«interface»&#xa;BookingRepository" style="swimlane;fontStyle=3;align=center;startSize=40;fontSize=12;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="530" y="460" width="210" height="70" as="geometry" />
    </mxCell>
    <mxCell id="95" value="findByUserId(userId)&#xa;(+ JpaRepository CRUD)" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;overflow=hidden;rotatable=0;" vertex="1" parent="94">
      <mxGeometry y="40" width="210" height="30" as="geometry" />
    </mxCell>

    <!-- Arrows: Controller -> Service -->
    <mxCell id="200" value="uses" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" parent="1" source="10" target="50"><mxGeometry relative="1" as="geometry" /></mxCell>
    <mxCell id="201" value="uses" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" parent="1" source="20" target="60"><mxGeometry relative="1" as="geometry" /></mxCell>
    <mxCell id="202" value="uses" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" parent="1" source="30" target="70"><mxGeometry relative="1" as="geometry" /></mxCell>
    <mxCell id="203" value="uses" style="edgeStyle=orthogonalEdgeStyle;dashed=1;" edge="1" parent="1" source="40" target="50"><mxGeometry relative="1" as="geometry" /></mxCell>

    <!-- Arrows: Service -> Repository -->
    <mxCell id="210" value="" style="edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="50" target="90"><mxGeometry relative="1" as="geometry" /></mxCell>
    <mxCell id="211" value="" style="edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="60" target="92"><mxGeometry relative="1" as="geometry" /></mxCell>
    <mxCell id="212" value="" style="edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="70" target="94"><mxGeometry relative="1" as="geometry" /></mxCell>

  </root>
</mxGraphModel>
```

---

## 5. Sekvenční diagramy

### 5.1 Login (draw.io XML)

> **Import:** Otevřít draw.io → Extras → Edit Diagram → vložit XML níže → OK

```xml
<mxGraphModel dx="1422" dy="762" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- Lifelines -->
    <mxCell id="10" value="Uživatel" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="60" y="30" width="100" height="500" as="geometry" />
    </mxCell>
    <mxCell id="11" value="LoginPage" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="220" y="30" width="100" height="500" as="geometry" />
    </mxCell>
    <mxCell id="12" value="AuthContext" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="380" y="30" width="100" height="500" as="geometry" />
    </mxCell>
    <mxCell id="13" value="AuthController" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d6b656;" vertex="1" parent="1">
      <mxGeometry x="540" y="30" width="120" height="500" as="geometry" />
    </mxCell>
    <mxCell id="14" value="AuthService" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d6b656;" vertex="1" parent="1">
      <mxGeometry x="720" y="30" width="120" height="500" as="geometry" />
    </mxCell>
    <mxCell id="15" value="UserRepository" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="900" y="30" width="120" height="500" as="geometry" />
    </mxCell>

    <!-- Messages -->
    <mxCell id="20" value="zadá email + heslo, odešle" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="10" target="11"><mxGeometry y="120" relative="1" as="geometry" /></mxCell>
    <mxCell id="21" value="POST /api/auth/login" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="11" target="12"><mxGeometry y="160" relative="1" as="geometry" /></mxCell>
    <mxCell id="22" value="apiFetch('/auth/login')" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="12" target="13"><mxGeometry y="200" relative="1" as="geometry" /></mxCell>
    <mxCell id="23" value="login(LoginRequest)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="13" target="14"><mxGeometry y="240" relative="1" as="geometry" /></mxCell>
    <mxCell id="24" value="findByEmailIgnoreCase(email)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="14" target="15"><mxGeometry y="280" relative="1" as="geometry" /></mxCell>
    <mxCell id="25" value="Optional&lt;User&gt;" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" parent="1" source="15" target="14"><mxGeometry y="310" relative="1" as="geometry" /></mxCell>
    <mxCell id="26" value="BCrypt.matches(heslo, hash)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="14" target="14"><mxGeometry y="340" relative="1" as="geometry" /></mxCell>
    <mxCell id="27" value="UserResponse (200)" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" parent="1" source="14" target="13"><mxGeometry y="370" relative="1" as="geometry" /></mxCell>
    <mxCell id="28" value="uloží user do localStorage" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" parent="1" source="12" target="11"><mxGeometry y="400" relative="1" as="geometry" /></mxCell>
    <mxCell id="29" value="přesměrování na /" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" parent="1" source="11" target="10"><mxGeometry y="430" relative="1" as="geometry" /></mxCell>

    <!-- Alt: 401 -->
    <mxCell id="30" value="[špatné heslo] 401 Unauthorized" style="text;html=1;strokeColor=#ff0000;fillColor=#ffcccc;align=left;" vertex="1" parent="1">
      <mxGeometry x="680" y="355" width="220" height="30" as="geometry" />
    </mxCell>

  </root>
</mxGraphModel>
```

### 5.2 Vytvoření rezervace (draw.io XML)

```xml
<mxGraphModel dx="1422" dy="762" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- Lifelines -->
    <mxCell id="10" value="Uživatel" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="60" y="30" width="100" height="560" as="geometry" />
    </mxCell>
    <mxCell id="11" value="TripDetailPage" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="220" y="30" width="110" height="560" as="geometry" />
    </mxCell>
    <mxCell id="12" value="BookingController" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d6b656;" vertex="1" parent="1">
      <mxGeometry x="400" y="30" width="130" height="560" as="geometry" />
    </mxCell>
    <mxCell id="13" value="BookingService" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d6b656;" vertex="1" parent="1">
      <mxGeometry x="600" y="30" width="120" height="560" as="geometry" />
    </mxCell>
    <mxCell id="14" value="TripRepository" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="790" y="30" width="120" height="560" as="geometry" />
    </mxCell>
    <mxCell id="15" value="BookingRepository" style="shape=mxgraph.uml.lifeline;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="980" y="30" width="130" height="560" as="geometry" />
    </mxCell>

    <!-- Messages -->
    <mxCell id="20" value="vyplní formulář (kontakt, místa)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="10" target="11"><mxGeometry y="100" relative="1" as="geometry" /></mxCell>
    <mxCell id="21" value="Zod validace (frontend)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="11" target="11"><mxGeometry y="140" relative="1" as="geometry" /></mxCell>
    <mxCell id="22" value="POST /api/bookings (X-User-Id)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="11" target="12"><mxGeometry y="180" relative="1" as="geometry" /></mxCell>
    <mxCell id="23" value="@Valid Bean Validation" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="12" target="12"><mxGeometry y="210" relative="1" as="geometry" /></mxCell>
    <mxCell id="24" value="create(booking)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="12" target="13"><mxGeometry y="250" relative="1" as="geometry" /></mxCell>
    <mxCell id="25" value="findById(tripId)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="13" target="14"><mxGeometry y="290" relative="1" as="geometry" /></mxCell>
    <mxCell id="26" value="Trip (kapacita, booked)" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" parent="1" source="14" target="13"><mxGeometry y="320" relative="1" as="geometry" /></mxCell>
    <mxCell id="27" value="zkontroluje volná místa" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="13" target="13"><mxGeometry y="350" relative="1" as="geometry" /></mxCell>
    <mxCell id="28" value="save(booking) + trip.booked++" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" parent="1" source="13" target="15"><mxGeometry y="390" relative="1" as="geometry" /></mxCell>
    <mxCell id="29" value="Booking 201" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" parent="1" source="12" target="11"><mxGeometry y="430" relative="1" as="geometry" /></mxCell>
    <mxCell id="30" value="zobrazí potvrzení" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;" edge="1" parent="1" source="11" target="10"><mxGeometry y="470" relative="1" as="geometry" /></mxCell>

    <!-- Alt: kapacita -->
    <mxCell id="31" value="[kapacita překročena] 400 Bad Request" style="text;html=1;strokeColor=#ff0000;fillColor=#ffcccc;align=left;" vertex="1" parent="1">
      <mxGeometry x="560" y="355" width="250" height="30" as="geometry" />
    </mxCell>

  </root>
</mxGraphModel>
```

---

## 6. Frontend – architektura

### 6.1 Struktura

```
frontend/src/
├── components/
│   └── forms/FormError.tsx         – inline chybová hláška pole
├── features/
│   ├── auth/
│   │   ├── AuthContext.tsx          – React Context (user state, login/logout/updateUser)
│   │   ├── repo.ts                  – apiFetch wrappery pro auth API
│   │   ├── types.ts                 – UserRole, User typy
│   │   └── i18n.ts                  – překlady rolí
│   ├── bookings/
│   │   ├── repo.ts                  – CRUD pro /api/bookings
│   │   ├── schemas.ts               – Zod schéma bookingSchema
│   │   └── types.ts                 – Booking typ
│   └── trips/
│       ├── repo.ts                  – CRUD pro /api/trips
│       ├── filters.ts               – applyTripFilters logika
│       ├── useTripTypes.ts          – hook + module-level cache
│       └── types.ts                 – Trip, TripFilters typy
├── lib/
│   └── api.ts                       – apiFetch (base fetch + X-User-Id header)
├── pages/
│   ├── HomePage.tsx                 – seznam + filtr (draft/applied pattern)
│   ├── TripDetailPage.tsx           – detail + rezervační formulář
│   ├── CreateOfferPage.tsx
│   ├── EditOfferPage.tsx
│   ├── BookingDetailPage.tsx
│   ├── EditBookingPage.tsx
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── EditUserPage.tsx
│   └── NotFoundPage.tsx
└── styles/global.css
```

### 6.2 Routovací strom

```
/                    → HomePage
/trips/:tripId       → TripDetailPage
/login               → LoginPage
/register            → RegisterPage
/dashboard           → DashboardPage
/offers/new          → CreateOfferPage
/offers/:id/edit     → EditOfferPage
/bookings/:id        → BookingDetailPage
/bookings/:id/edit   → EditBookingPage
/me                  → (profil, redirect na login)
/me/edit             → EditUserPage
*                    → NotFoundPage
```

---

## 7. API – přehled endpointů

| Metoda | Endpoint | Popis | Auth hlavička |
|--------|----------|-------|---------------|
| POST | `/api/auth/login` | Přihlášení | – |
| POST | `/api/auth/register` | Registrace | – |
| GET | `/api/users/{id}` | Detail uživatele | X-User-Id |
| PUT | `/api/users/{id}` | Úprava uživatele | X-User-Id |
| GET | `/api/trips` | Seznam plaveb (`?owner=`) | – |
| GET | `/api/trips/{id}` | Detail plavby | – |
| POST | `/api/trips` | Vytvoření nabídky | X-User-Id |
| PUT | `/api/trips/{id}` | Úprava nabídky | X-User-Id |
| DELETE | `/api/trips/{id}` | Smazání nabídky | X-User-Id |
| GET | `/api/bookings` | Rezervace (`?userId=`) | X-User-Id |
| GET | `/api/bookings/{id}` | Detail rezervace | X-User-Id |
| POST | `/api/bookings` | Vytvoření rezervace | X-User-Id |
| PUT | `/api/bookings/{id}` | Úprava rezervace | X-User-Id |
| DELETE | `/api/bookings/{id}` | Zrušení rezervace | X-User-Id |
| GET | `/api/trip-types` | Číselník typů | – |
| POST | `/api/upload` | Upload obrázku (multipart) | – |

**Chybový formát (všechny endpointy):**
```json
{
  "status": 400,
  "message": "Neplatné vstupní údaje.",
  "errors": {
    "email": "Neplatný formát e-mailu"
  }
}
```
