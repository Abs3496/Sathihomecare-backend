import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./legacy-pages/Home";
import Services from "./legacy-pages/Services";
import Checkout from "./legacy-pages/Checkout";
import ThankYou from "./legacy-pages/ThankYou";
import TrackBooking from "./legacy-pages/TrackBooking";
import PartnerLogin from "./legacy-pages/partner/PartnerLogin";
import PartnerDashboard from "./legacy-pages/partner/PartnerDashboard";
import Admin from "./legacy-pages/Admin";
import KnowFounders from "./legacy-pages/KnowFounders";
import PrivacyPolicy from "./legacy-pages/legal/PrivacyPolicy";
import TermsConditions from "./legacy-pages/legal/TermsConditions";
import RefundPolicy from "./legacy-pages/legal/RefundPolicy";
import Blogs from "./legacy-pages/Blogs";
import Faq from "./legacy-pages/Faq";
import CartBar from "./components/CartBar";
import ProtectedRoute from "./components/ProtectedRoute";
import SiteFooter from "./components/SiteFooter";
import SathiCareBot from "./components/SathiCareBot";

function App() {
  return (
    <BrowserRouter>
      <div className="app-frame">
        <CartBar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/services" element={<Services />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/founders" element={<KnowFounders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/track-booking" element={<TrackBooking />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-cancellation-policy" element={<RefundPolicy />} />
            <Route
              path="/partner/dashboard"
              element={
                <ProtectedRoute role="partner">
                  <PartnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <SiteFooter />
        <SathiCareBot phone="+91 94517 64251" />
      </div>
    </BrowserRouter>
  );
}

export default App;
