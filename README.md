# Sail Connect (semestrální práce)

Sail Connect je SPA aplikace v React + TypeScript (Vite), která propojuje kapitány a posádku.
Uživatel si může prohlížet nabídky plaveb, filtrovat je, vytvářet vlastní nabídky, spravovat rezervace a upravovat profil.

## Funkce
- **Homepage (Domů)**: seznam plaveb + filtry (destinace, typ, datum, max cena)
- **Detail plavby**: hero obrázek, popis, highlights, rezervace (blokace rezervace vlastní nabídky)
- **Můj přehled**:
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

## Testy
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
- uživatelé / session (auth)
- nabídky (user trips)
- rezervace (bookings)
Pokud chceš aplikaci „vyčistit“, smaž LocalStorage pro daný origin (DevTools → Application → Local Storage).

## Obrázky (assets)
Obrázky pro plavby jsou v public/images/trips/ a používají varianty:
_400 / _800 / _1200 (pro responsive načítání)

Příklad názvu:
zapad_slunce_plaz_400.webp, zapad_slunce_plaz_800.webp, zapad_slunce_plaz_1200.webp
Pokud je imageUrl u tripu prázdné, používá se placeholder.

## Routy (přehled)
Ve zkratce:
- / – Domů
- /trips/:tripId – Detail plavby
- /login, /register – Přihlášení / Registrace
- /dashboard – Můj přehled (chráněné)
- /offers/new, /offers/:tripId/edit – Vytvořit / upravit nabídku (chráněné)
- /bookings/:bookingId, /bookings/:bookingId/edit – Detail / edit rezervace (chráněné)
- /me, /me/edit – Profil / editace profilu (chráněné)

## Poznámky
Aplikace je čistě klientská (bez backendu).
Chráněné stránky jsou dostupné pouze po přihlášení (ProtectedRoute).
Správa stavu přihlášení je řešena pomocí AuthContext.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
