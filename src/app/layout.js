import "./globals.css";
import SiteNavbar from "../components/SiteNavbar";

export const metadata = {
  title: "7PView",
  description: "7PView",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteNavbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
