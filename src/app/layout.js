import "./globals.css";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
    title: "Thoughtca.st",
    description: "7 Point Highlander Tournament Analytics",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark" data-theme="dark">
            <body className="min-h-screen flex flex-col bg-black text-white">
                <NavigationBar />
                <main className="p-6 flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
