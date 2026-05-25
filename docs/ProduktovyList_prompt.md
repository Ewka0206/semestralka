# Prompt pro vygenerování produktového listu – Sail Connect

Zkopíruj níže uvedený prompt a vlož ho do Claude (claude.ai nebo Claude Code).
Výsledkem bude produktový list formátu A4 připravený k tisku nebo exportu do PDF.

---

## Prompt

```
Vytvoř produktový list formátu A4 pro webovou aplikaci Sail Connect.
Výstup musí být v češtině, čistý HTML soubor (jeden soubor, inline CSS),
připravený k přímému tisku nebo uložení jako PDF (Ctrl+P → Uložit jako PDF).

Použij následující obsah a strukturu:

---

NÁZEV PRODUKTU: Sail Connect
PODTITULEK: Propojujeme kapitány a posádku

STRUČNÝ POPIS (2–3 věty):
Sail Connect je webová aplikace pro organizaci rekreačních a sportovních plaveb.
Kapitáni zde zveřejňují nabídky plaveb, posádka si je prohlíží, filtruje a rezervuje místa.
Systém spravuje celý životní cyklus rezervace od vytvoření po zrušení.

HLAVNÍ FUNKCE (jako ikony nebo odrážky, max 6):
- Prohlížení a filtrování nabídek plaveb (destinace, typ, datum, cena)
- Rezervace míst s kontaktními údaji
- Správa vlastních nabídek (kapitán): vytvoření, editace, smazání
- Přehled rezervací na Dashboardu
- Nahrávání vlastního obrázku ke každé nabídce (jpg/png/webp)
- Plná správa uživatelského profilu (jméno, e-mail, role)

TECHNOLOGIE (2 sloupce – Frontend / Backend):
Frontend: React 19, TypeScript, Vite, React Router, React Hook Form + Zod
Backend: Java 21, Spring Boot 3.3, Spring Data JPA, Hibernate, MariaDB, BCrypt

ROLE UŽIVATELŮ:
- Nepřihlášený návštěvník: prohlíží plavby
- Posádka (crew): rezervuje plavby, spravuje rezervace
- Kapitán (captain): vytváří a spravuje nabídky + vše co posádka

ARCHITEKTURA (krátce):
Třívrstvá architektura: React SPA → Spring Boot REST API → MariaDB.
Komunikace přes REST, identifikace uživatele hlavičkou X-User-Id.
16 REST endpointů, validace na frontendu (Zod) i backendu (Bean Validation).

TESTY:
- 23 frontend testů (Vitest + jsdom): repo, filtry, Zod schémata
- 28 backend testů (JUnit 5 + Mockito): service vrstva, error handling
- Postman kolekce pro všech 16 API endpointů

KONTAKT / AUTOR:
Eva Kratěnová
Ročníkový projekt – [název školy]
2025/2026

---

VIZUÁLNÍ POŽADAVKY:
- Barevná paleta: tmavě modrá (#020381), středně modrá (#2874FC), světle modrá/tyrkysová akcent (#18B6CE)
- Bílé pozadí (#FFFFFF) s lehkým světle modrým pozadím sekcí (#d0dff6)
- Font: system-ui, sans-serif
- Záhlaví se jménem aplikace na plnou šířku, gradient pozadí (tmavě modrá → střední modrá), bílý text
- Čistý, profesionální layout – dvousloupcový grid pro obsah, plná šířka pro záhlaví a zápatí
- Ikony použij jako Unicode symboly (⚓ ⛵ 📅 💳 🖼 👤) nebo jednoduché CSS tvary – žádné externí závislosti
- Celá stránka musí být tisknutelná na 1× A4 (použij @media print a @page { size: A4; margin: 1cm; })
- Žádné scroll, vše viditelné na jedné stránce

Výstup: pouze čistý HTML kód, bez jakéhokoli markdown formátování, bez markdown bloků.
```
