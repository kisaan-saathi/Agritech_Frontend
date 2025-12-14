import './globals.css';
import "./styles/styles.css";
import "./styles/styles_custom.css";
import "./styles/table-card.css";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

export const metadata = {
  title: "KISSAN SAATHI Admin",
  description: "Admin Web Application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}

