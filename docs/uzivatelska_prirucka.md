    # Uživatelská příručka – SailConnect

**Verze:** 1.0  
**Datum:** 2026-05-27  
**Aplikace:** SailConnect – Najdi plavbu nebo posádku  
**URL aplikace:** `http://localhost:5173` (vývojové prostředí)

---

## Obsah

1. [Úvod](#1-úvod)
2. [Základní orientace v aplikaci](#2-základní-orientace-v-aplikaci)
3. [Registrace a přihlášení](#3-registrace-a-přihlášení)
4. [Prohlížení nabídek plaveb](#4-prohlížení-nabídek-plaveb)
5. [Detail plavby a rezervace](#5-detail-plavby-a-rezervace)
6. [Můj přehled (Dashboard)](#6-můj-přehled-dashboard)
7. [Správa rezervací](#7-správa-rezervací)
8. [Vytváření a správa vlastních nabídek (Kapitán)](#8-vytváření-a-správa-vlastních-nabídek-kapitán)
9. [Správa profilu](#9-správa-profilu)
10. [Odhlášení](#10-odhlášení)
11. [Časté otázky a řešení problémů](#11-časté-otázky-a-řešení-problémů)

---

## 1. Úvod

**SailConnect** je webová aplikace, která propojuje námořní kapitány a zájemce o plachtění. Kapitáni zde zveřejňují nabídky plaveb, členové posádky si vyhlédnou svou vysněnou plavbu a snadno si rezervují místo na palubě.

### Role uživatelů

| Role | Označení | Možnosti |
|------|----------|----------|
| **Člen posádky** | `crew` | Prohlíží nabídky, rezervuje místa, spravuje rezervace |
| **Kapitán** | `captain` | Vše jako člen posádky + vytváří, upravuje a maže vlastní nabídky plaveb |

> **Tip:** Roli si zvolíte při registraci. Lze ji kdykoli změnit v nastavení profilu.

---

## 2. Základní orientace v aplikaci

### Navigační lišta (horní menu)

| Odkaz | Dostupnost | Popis |
|-------|------------|-------|
| **Domů** | Vždy | Přehled všech nabídek plaveb s filtrem |
| **Můj přehled** | Po přihlášení | Vaše rezervace a vaše nabídky plaveb |
| **Vytvořit nabídku** | Po přihlášení | Formulář pro novou nabídku plavby |
| **Jméno (role)** | Po přihlášení | Váš profil |
| **Přihlášení / Registrace** | Nepřihlášený | Přístup k účtu |
| **Odhlášení** | Po přihlášení | Odhlásí vás z aplikace |

Na mobilním zařízení je menu dostupné přes tlačítko ☰ (hamburger) v pravém horním rohu.

---

## 3. Registrace a přihlášení

### 3.1 Registrace nového účtu

1. Klikněte na **Registrace** v navigačním menu.
2. Vyplňte registrační formulář:
   - **Jméno** – vaše celé jméno (min. 1 znak)
   - **Email** – platná e-mailová adresa (musí být unikátní v systému)
   - **Role** – vyberte ze seznamu:
     - *Člen posádky* – hledáte místo na plavbě
     - *Kapitán* – nabízíte vlastní plavby
   - **Heslo** – minimálně 6 znaků
3. Klikněte na **Vytvořit účet**.
4. Po úspěšné registraci budete automaticky přesměrováni na **Můj přehled**.

> ⚠️ Pokud je e-mail již zaregistrován, zobrazí se chyba „Uživatel s tímto emailem už existuje."

### 3.2 Přihlášení

1. Klikněte na **Přihlášení** v navigačním menu.
2. Zadejte:
   - **Email** – váš registrovaný e-mail
   - **Heslo** – vaše heslo
3. Klikněte na **Přihlásit se**.
4. Po úspěšném přihlášení budete přesměrováni na **Můj přehled**.

> ⚠️ Pokud zadáte nesprávné údaje, zobrazí se chyba „Špatné přihlašovací údaje."

---

## 4. Prohlížení nabídek plaveb

Domovská stránka (dostupná i bez přihlášení) zobrazuje všechny dostupné nabídky plaveb.

### 4.1 Filtr nabídek

V horní části stránky je k dispozici filtrační panel:

| Pole | Popis | Příklad |
|------|-------|---------|
| **Destinace** | Hledá v názvu, místě a státu plavby | `Korfu`, `Řecko`, `Stockholm` |
| **Typ plavby** | Filtruje dle kategorie (Cokoliv / Trénink dovedností / Dobrodružství / Rekreační plavba) | Dobrodružství |
| **Datum od** | Plavby začínající nejdříve v tento den | 2026-06-01 |
| **Datum do** | Plavby začínající nejpozději v tento den | 2026-08-31 |
| **Maximální cena (CZK)** | Plavby s cenou do zadané hodnoty | 20000 |

- Klikněte na **Hledat** pro aplikování filtru.
- Klikněte na **Vymazat filtry** pro zobrazení všech nabídek.

### 4.2 Karta plavby

Každá karta zobrazuje:
- Fotografii plavby
- Název a destinaci
- Termín (datum od – do)
- Cenu v Kč za osobu
- Typ plavby
- Počet volných míst
- Tlačítko **Detail** pro zobrazení podrobností

---

## 5. Detail plavby a rezervace

Kliknutím na **Detail** na kartě plavby (nebo přes přímý odkaz `/trips/{id}`) zobrazíte stránku s úplnými informacemi.

### 5.1 Obsah stránky

- **Název a umístění** – název plavby, přístav, stát, termín, typ
- **Fotografie** – hlavní snímek plavby
- **Popis** – podrobné informace o programu plavby
- **Souhrn** (highlights) – klíčové body plavby jako seznam
- **Kapacita** – počet volných míst z celkové kapacity
- **Cena** – cena za osobu v Kč

### 5.2 Vytvoření rezervace

> Rezervaci může vytvořit **přihlášený i nepřihlášený** uživatel. Vlastní nabídku si nelze rezervovat.

1. Přejděte na detail plavby.
2. V sekci **Rezervace** vyplňte:
   - **Jméno** – kontaktní jméno
   - **Email** – kontaktní e-mail
   - **Počet míst** – kolik míst chcete rezervovat (max. počet volných míst)
3. Klikněte na **Rezervovat**.
4. Po úspěšné rezervaci se zobrazí potvrzení s odkazem na **Můj přehled**.

> ⚠️ Pokud plavba nemá dostatek volných míst, zobrazí se chybová zpráva.

---

## 6. Můj přehled (Dashboard)

Stránka dostupná po přihlášení na adrese `/dashboard`. Obsahuje dvě sekce:

### 6.1 Moje rezervace

- Přehled všech vašich rezervací
- U každé rezervace jsou zobrazeny:
  - Název plavby, počet míst, datum rezervace
  - Kontaktní jméno a e-mail
- Dostupné akce:
  - **Detail plavby** – přejde na stránku plavby
  - **Detail rezervace** – zobrazí podrobnosti rezervace
  - **Upravit** – úprava rezervace
  - **Zrušit** – smazání rezervace (po potvrzení)

### 6.2 Moje plavby

- Přehled nabídek plaveb, které jste vytvořili
- Dostupné akce:
  - **Detail plavby** – zobrazí veřejný detail
  - **Upravit** – editační formulář nabídky
  - **Zrušit** – smazání nabídky (po potvrzení)
- Tlačítko **+ Nová plavba** pro přidání nové nabídky

---

## 7. Správa rezervací

### 7.1 Detail rezervace

Dostupný přes odkaz na Mém přehledu nebo na adrese `/bookings/{id}`.

Zobrazuje:
- Název propojené plavby
- Datum a čas vytvoření rezervace
- Počet rezervovaných míst
- Kontaktní jméno a e-mail

Dostupné akce:
- **Upravit rezervaci** – přejde na editační formulář
- **Zrušit rezervaci** – po potvrzení smaže rezervaci a vrátí na Můj přehled

### 7.2 Úprava rezervace

Dostupná přes tlačítko **Upravit** (z Mého přehledu nebo z detailu rezervace).

Lze změnit:
- Počet míst
- Kontaktní jméno
- Kontaktní e-mail

---

## 8. Vytváření a správa vlastních nabídek (Kapitán)

> Tato část je dostupná všem přihlášeným uživatelům, ale doporučena zejména pro uživatele s rolí **Kapitán**.

### 8.1 Vytvoření nové nabídky

1. Klikněte na **Vytvořit nabídku** v navigačním menu nebo tlačítko **+ Nová plavba** na Mém přehledu.
2. Vyplňte formulář:

| Pole | Povinné | Popis |
|------|---------|-------|
| **Název** | ✓ | Název plavby (min. 3 znaky) |
| **Destinace** | ✓ | Přístav nebo místo odjezdu |
| **Stát** | – | Stát / region (př. Řecko) |
| **Typ** | ✓ | Trénink dovedností / Dobrodružství / Rekreační plavba |
| **Datum od** | ✓ | Datum zahájení plavby |
| **Datum do** | ✓ | Datum ukončení (nesmí být dříve než datum od) |
| **Cena (CZK)** | ✓ | Cena v Kč za osobu (min. 0) |
| **Počet míst** | ✓ | Celková kapacita plavidla (min. 1) |
| **Detail** | – | Podrobný popis plavby |
| **Souhrn** | – | Klíčové body, každý na samostatný řádek |
| **Obrázek** | – | Fotografie – nahraje se tlačítkem Vybrat soubor (JPG, PNG, WEBP, max. 10 MB) |

3. Klikněte na **Uložit**.
4. Po vytvoření budete automaticky přesměrováni na detail nové plavby.

### 8.2 Úprava nabídky

1. Přejděte na detail plavby nebo na Můj přehled.
2. Klikněte na **Upravit plavbu** / **Upravit**.
3. Formulář je předvyplněn stávajícími údaji – změňte, co potřebujete.
4. Klikněte na **Uložit** nebo **Zrušit** pro návrat bez uložení.

### 8.3 Smazání nabídky

1. Přejděte na detail plavby nebo Můj přehled.
2. Klikněte na **Smazat plavbu** / **Zrušit**.
3. Potvrďte dialog „Opravdu smazat tuto nabídku?".
4. Nabídka bude odstraněna a budete přesměrováni zpět.

> ⚠️ **Upozornění:** Smazání nabídky je nevratné. Existující rezervace k dané plavbě zůstanou v databázi, ale plavba se uživatelům již nezobrazí.

---

## 9. Správa profilu

### 9.1 Zobrazení profilu

Klikněte na své **jméno (role)** v navigačním menu nebo přejděte na `/me`.

Zobrazuje:
- Jméno, e-mail, roli
- Datum registrace a poslední změny

### 9.2 Úprava profilu

1. Na stránce profilu klikněte na **Upravit profil** nebo přejděte na `/me/edit`.
2. Lze změnit:
   - **Jméno** (min. 2 znaky)
   - **E-mail** (platný formát)
   - **Role** (Člen posádky / Kapitán)
3. Klikněte na **Uložit změny** nebo **Zrušit** pro návrat bez uložení.

> ℹ️ Změna hesla v aktuální verzi probíhá přes API; v UI lze změnit jméno, e-mail a roli.

---

## 10. Odhlášení

Klikněte na tlačítko **Odhlášení** v navigačním menu. Budete odhlášeni a přesměrováni na domovskou stránku.

---

## 11. Časté otázky a řešení problémů

### Nelze se přihlásit
- Zkontrolujte, zda zadáváte správný e-mail a heslo.
- Heslo je citlivé na velká/malá písmena.
- Pokud jste zapomněli heslo, kontaktujte správce systému.

### Rezervace se neuložila
- Zkontrolujte, zda plavba má volná místa (počet míst ≥ 1).
- Ujistěte se, že jste správně vyplnili všechna povinná pole (jméno, e-mail, počet míst).

### Obrázek se nenahrál
- Povolené formáty jsou: JPG, JPEG, PNG, WEBP.
- Maximální velikost souboru je **10 MB**.
- Zkontrolujte připojení k internetu a zkuste to znovu.

### Stránka zobrazuje „Načítám…"
- Stránka čeká na odpověď serveru. Pokud načítání trvá déle než 10 sekund, obnovte stránku (F5) nebo kontaktujte správce.

### Zobrazuje se stránka „404 – Stránka nenalezena"
- Zadali jste neplatnou adresu, nebo odkazovaná plavba / rezervace byla smazána.
- Klikněte na **Domů** pro návrat na hlavní stránku.