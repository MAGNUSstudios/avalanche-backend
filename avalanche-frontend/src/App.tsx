import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import GuildsPage from './pages/GuildsPage';
import CreateGuildPage from './pages/CreateGuildPage';
import GuildDetailPage from './pages/GuildDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectPaymentPage from './pages/ProjectPaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import EscrowPage from './pages/EscrowPage';
import SecureCheckoutPage from './pages/SecureCheckoutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminGuildsPage from './pages/AdminGuildsPage';
import AdminAIAnalyticsPage from './pages/AdminAIAnalyticsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import MessagesPage from './pages/MessagesPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import UserProfilePage from './pages/UserProfilePage';
import HelpPage from './pages/HelpPage';
import SelectPlanPage from './pages/SelectPlanPage';
import PlanSuccessPage from './pages/PlanSuccessPage';
import CartPage from './pages/CartPage';
import WalletPage from './pages/WalletPage';
import AIChatInterface from './components/ai/AIChatInterface';
import AdminAuthGuard from './components/auth/AdminAuthGuard';
import AuthGuard from './components/auth/AuthGuard';
import { AIChatContext } from './context/AIChatContext';
import { AdminProvider } from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './context/CartContext';
import { globalStyles } from './styles/globalStyles';
import { startTokenManager, stopTokenManager } from './utils/tokenManager';

function App() {
  globalStyles();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const { i18n } = useTranslation();

  // Initialize language from localStorage on app load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('avalanche_language');

    // Validate that the saved language is a valid language code
    const validLanguages = ['en', 'es', 'fr', 'de'];

    if (savedLanguage && validLanguages.includes(savedLanguage)) {
      if (savedLanguage !== i18n.language) {
        console.log('App: Applying saved language:', savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    } else {
      // Clean up invalid language value
      console.log('App: Invalid language in localStorage, cleaning up:', savedLanguage);
      localStorage.removeItem('avalanche_language');
      localStorage.setItem('avalanche_language', 'en');
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  // Start token manager if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('avalanche_token');
    if (token) {
      startTokenManager();
    }

    // Cleanup on unmount
    return () => {
      stopTokenManager();
    };
  }, []);

  return (
    <CartProvider>
      <AIChatContext.Provider value={{ isAIChatOpen, setIsAIChatOpen }}>
        <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/select-plan" element={<SelectPlanPage />} />
          <Route path="/plan-success" element={<PlanSuccessPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/create" element={<CreateListingPage />} />
          <Route path="/marketplace/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/:productId" element={<CheckoutPage />} />
          <Route path="/secure-checkout" element={<SecureCheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/guilds" element={<GuildsPage />} />
          <Route path="/guilds/create" element={<CreateGuildPage />} />
          <Route path="/guilds/:id" element={<GuildDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/create" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/payment" element={<ProjectPaymentPage />} />
          <Route path="/escrow" element={<AuthGuard><EscrowPage /></AuthGuard>} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><SettingsPage /></AuthGuard>} />
          <Route path="/wallet" element={<AuthGuard><WalletPage /></AuthGuard>} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Admin Routes - Login not protected, all other admin routes protected */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminOverviewPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/dashboard" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminOverviewPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/transactions" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminTransactionsPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/guilds" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminGuildsPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/ai-analytics" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminAIAnalyticsPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/users" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminDashboardPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
          <Route path="/admin/settings" element={<AdminAuthGuard><NotificationProvider><AdminProvider><AdminSettingsPage /></AdminProvider></NotificationProvider></AdminAuthGuard>} />
        </Routes>

        {/* AI chat interface (when clicking sparkles icon in header) */}
        <AIChatInterface isOpen={isAIChatOpen} onToggle={setIsAIChatOpen} />
      </Router>
    </AIChatContext.Provider>
    </CartProvider>
  );
}

export default App;
