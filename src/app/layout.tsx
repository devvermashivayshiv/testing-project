import "../cssdesign/header.css";
import "../cssdesign/footer.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "../cssdesign/login.css";
import { Poppins } from "next/font/google";
import SessionProviderWrapper from "./components/SessionProviderWrapper";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ padding: 0, margin: 0 }}>
      <body className={poppins.className} style={{ background: "#f9f9f9", overflowX: "hidden", maxWidth: "100vw", padding: 0, margin: 0 }}>
        <SessionProviderWrapper>
          <Header />
          <div style={{ minHeight: "80vh", maxWidth: "100vw", overflowX: "hidden", padding: 0, margin: 0 }}>{children}</div>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
