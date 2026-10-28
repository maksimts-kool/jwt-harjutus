# JWT harjutus

JWT testiks valmistumise veebileht (Moodle'i test „TEST: JWT token”). Kasutajaliides on eesti, inglise ja vene keeles (`/et`, `/en`, `/ru`); küsimused ja vastused on alati eesti keeles nagu Moodle'i testis.

- **Harjutustest** (`/et/harjutustest`) – harjutusrežiim kohese tagasisidega, eksamirežiim juhusliku järjekorra ja taimeriga, valesti vastatud küsimuste kordamine. Progress salvestub `localStorage`-isse.
- **Vastused** (`/et/vastused`) – kõik küsimused teemade kaupa koos õige vastusega ühel lehel, otsinguga.

## Käivitamine

```bash
npm install
npm run dev        # http://localhost:3000/personal/jwt-harj/
npm run build      # staatiline sait kausta out/
npm run types:check
```

`npm run build` loob täiesti staatilise saidi (`output: 'export'`). Kausta `out/` võib panna mis tahes staatilisse hostingusse (GitHub Pages, Netlify, Nginx). Serverit, andmebaasi ega sisselogimist pole.

### Avaldamine (Zone)

Sait elab aadressil https://maksimtsikvasvili24.thkit.ee/personal/jwt-harj/ (`basePath` failis `next.config.mjs`). PM2 rakendust pole vaja – Apache serveerib staatilisi faile otse:

```bash
npm run build && rsync -az --delete --chmod=D755,F644 out/ virt140715@maksimtsikvasvili24.thkit.ee:domeenid/www.maksimtsikvasvili24.thkit.ee/htdocs/personal/jwt-harj/
```

## Struktuur

| Fail / kaust | Sisu |
| --- | --- |
| `data/questions.json` | **Ühine küsimustepank** – mõlemad jaotised loevad küsimusi ainult siit |
| `lib/questions.ts` | Küsimuste tüübid ja abifunktsioonid |
| `lib/messages.ts` | Kasutajaliidese tekstid (et / en / ru) |
| `data/i18n/*.json` | Teemade nimed inglise ja vene keeles |
| `lib/grading.ts` | Vastuste hindamine (valik, mitu õiget, tõene/väär, lühivastus, seostamine, vabavastus) |
| `lib/survey.ts` | Küsimuse teisendamine SurveyJS-i JSON-iks |
| `lib/progress.ts` | `localStorage` progress (vastused, eksamid, pooleli harjutus) |
| `components/quiz/` | Harjutustest: SurveyJS, tagasiside, eksami tulemused |
| `components/answers/` | Vastuste loend otsinguga |

## Küsimuse lisamine

Lisa objekt `data/questions.json` massiivi `questions`. Väljad: `id`, `number`, `topic`, `type` (`single`, `multiple`, `truefalse`, `text`, `matching`, `essay`), `prompt` ja tüübist sõltuv vastus (`answer`, `options`, `pairs`, `accept`, `modelAnswer`). `useToken: true` näitab ühist näidistokenit. Küsimus ilmub automaatselt nii testi kui ka vastuste lehele.

## Märkused

- Ekraanipiltidel puudusid küsimused 1, 9 ja 30.
- Küsimuse 15 rippmenüü valikud polnud pildil näha; kasutatud on vastuskoode 200 / 401 / 403.
- Näidistokeni vastused on kontrollitud: allkiri klapib võtmega `saladus123`, `iat` = 23.10.2025 11:00 (Tallinn), kehtivus 60 min.

Tehnoloogiad: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Fumadocs UI, SurveyJS.

© Maksim Tsikvasvili
