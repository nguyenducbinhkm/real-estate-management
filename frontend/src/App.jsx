import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ListingsPage from './pages/ListingsPage';
import ListingDetail from './pages/ListingDetail';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';
import SellerPost from './pages/SellerPost';
import SellerDashboard from './pages/SellerDashboard';
import SellerListings from './pages/SellerListings';
import SellerCustomers from './pages/SellerCustomers';
import AdminListings from './pages/AdminListings';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import PlaceholderPage from './pages/PlaceholderPage';
import NewsPage from './pages/NewsPage';
import NewsDetail from './pages/NewsDetail';
import ImageCredits from './pages/ImageCredits';
import WikiPage from './pages/WikiPage';
import UtilitiesPage from './pages/UtilitiesPage';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? children : <Navigate to="/login" replace />;
}

const protectedPage = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="listings/:id" element={<ListingDetail />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsDetail />} />
        <Route path="wiki" element={<WikiPage />} />
        <Route path="wiki/:category" element={<WikiPage />} />
        <Route path="wiki/:category/:article" element={<WikiPage />} />
        <Route path="utilities" element={<UtilitiesPage />} />
        <Route path="utilities/:slug" element={<UtilitiesPage />} />
        <Route path="support/:slug" element={<PlaceholderPage title="Hướng dẫn & hỗ trợ" />} />
        <Route path="policy/:slug" element={<PlaceholderPage title="Quy định" />} />
        <Route path="sitemap" element={<PlaceholderPage title="Sitemap" />} />
        <Route path="image-credits" element={<ImageCredits />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="seller/post" element={protectedPage(<SellerPost />)} />
        <Route path="seller/dashboard" element={protectedPage(<SellerDashboard />)} />
        <Route path="seller/listings" element={protectedPage(<SellerListings />)} />
        <Route path="seller/listings/:id/edit" element={protectedPage(<SellerPost />)} />
        <Route path="admin" element={protectedPage(<AdminDashboard />)} />
        <Route path="admin/listings" element={protectedPage(<AdminListings />)} />
        <Route path="admin/users" element={protectedPage(<AdminUsers />)} />
        <Route path="seller/customers" element={protectedPage(<SellerCustomers />)} />
        <Route path="profile" element={protectedPage(<UserProfile />)} />
        <Route path="profile/password" element={protectedPage(<UserProfile />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
