// Sait asub Zone serveris aadressil https://maksimtsikvasvili24.thkit.ee/personal/jwt-harj/
const basePath = '/personal/jwt-harj';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Täiesti staatiline sait: `npm run build` loob kausta `out/`, mida saab serveerida igal veebiserveril.
  output: 'export',
  basePath,
  // Iga leht on kaustas `index.html`-ina, et Apache leiaks selle ilma ümbersuunamisreegliteta.
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default config;
