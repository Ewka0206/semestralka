# Sail Connect (semestrální práce)

Sail Connect je SPA aplikace v React + TypeScript (Vite), která propojuje kapitány a posádku.
Uživatel si může prohlížet nabídky plaveb, filtrovat je, vytvářet vlastní nabídky, spravovat rezervace a upravovat profil.

## Funkce
- **Discover (Domů)**: seznam plaveb + filtry (destinace, typ, datum, max cena)
- **Detail plavby**: hero obrázek, popis, highlights, rezervace (blokace rezervace vlastní nabídky)
- **Dashboard (Můj přehled)**:
  - moje rezervace (detail, editace, zrušení)
  - moje nabídky (detail, editace, smazání)
- **Auth**: registrace, přihlášení, odhlášení
- **Profil**: detail uživatele + editace (vč. role), datum registrace a poslední změny
- **Obrázky**: responsive načítání přes `srcSet` / `sizes`

## Tech stack
- React + TypeScript
- Vite
- React Router
- React Hook Form + Zod (validace formulářů)
- Vitest + Testing Library (unit testy)

## Požadavky
- **Node.js**: doporučeno 18+ (ideálně 20+)
- **npm** (součást Node.js)

## Instalace
V kořeni projektu:

```bash
npm install
```

## Spuštění (dev server)
```bash
npm run dev
```

Aplikace je nastavena aby běžela:
http://127.0.0.1:5173/

## Build (produkční)
```bash
npm run build
npm run preview
```

##Testy
Testy jsou umístěné ve složce src/test.
Spuštění testů jednorázově:
```bash
npm run test:run
```

Spuštění testů v watch režimu:
```bash
npm run test
```

Pozn.: konfigurace Vitestu používá jsdom a setupFiles: ./src/test/setup.ts.

## Data a persistence (LocalStorage)
Aplikace ukládá data do LocalStorage (repo vrstva):
uživatelé / session (auth)
nabídky (user trips)
rezervace (bookings)
Pokud chceš aplikaci „vyčistit“, smaž LocalStorage pro daný origin (DevTools → Application → Local Storage).

## Obrázky (assets)
Obrázky pro plavby jsou v public/images/trips/ a používají varianty:
_400 / _800 / _1200 (pro responsive načítání)

Příklad názvu:
zapad_slunce_plaz_400.jpg, zapad_slunce_plaz_800.jpg, zapad_slunce_plaz_1200.webp
Pokud je imageUrl u tripu prázdné, používá se placeholder.

## Routy (přehled)
Ve zkratce:
/ – Domů (Discover)
/trips/:tripId – Detail plavby
/login, /register – Přihlášení / Registrace
/dashboard – Můj přehled (chráněné)
/offers/new, /offers/:tripId/edit – Vytvořit / upravit nabídku (chráněné)
/bookings/:bookingId, /bookings/:bookingId/edit – Detail / edit rezervace (chráněné)
/me, /me/edit – Profil / editace profilu (chráněné)

## Poznámky
Aplikace je čistě klientská (bez backendu).
Chráněné stránky jsou dostupné pouze po přihlášení (ProtectedRoute).
Správa stavu přihlášení je řešena pomocí AuthContext.
