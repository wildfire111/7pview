import "./globals.css";
import NavigationBar from "../components/Navbar";

export const metadata = {
    title: "7PView",
    description: "7PView",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body>
                <NavigationBar />
                <main className="p-6">{children}</main>
            </body>
        </html>
    );
}
