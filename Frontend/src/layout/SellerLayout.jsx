import SellerSidebar from "./SellerSidebar";
import "../layout/SellerLayout.css";

export default function SellerLayout({ children }) {
    return (
        <div className="seller-layout">
            <SellerSidebar />
            <main className="seller-content">
                {children}
            </main>
        </div>
    );
}
