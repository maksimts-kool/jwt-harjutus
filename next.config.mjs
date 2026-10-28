/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Täiesti staatiline sait: `npm run build` loob kausta `out/`, mida saab serveerida igal veebiserveril.
  output: 'export',
  images: { unoptimized: true },
};

export default config;
