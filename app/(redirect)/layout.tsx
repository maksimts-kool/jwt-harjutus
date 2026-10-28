import '../global.css';

// Eraldi juurpaigutus keeleta aadressidele, mis ainult suunavad edasi.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="et">
      <body>{children}</body>
    </html>
  );
}
