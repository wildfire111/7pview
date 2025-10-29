import "./globals.css";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
    title: "7PView",
    description: "7PView",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body className="min-h-screen flex flex-col">
                <NavigationBar />
                <main className="p-6 flex-1">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
