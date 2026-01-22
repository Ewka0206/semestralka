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


## Spuštění (dev server)
npm run dev

Aplikace je nastavena aby běžela:
http://127.0.0.1:5173/
