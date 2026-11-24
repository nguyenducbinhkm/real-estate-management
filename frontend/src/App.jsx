import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ListingsPage from './pages/ListingsPage';
import ListingDetail from './pages/ListingDetail';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';
import SellerPost from './pages/SellerPost';
import SellerDashboard from './pages/SellerDashboard';
import UserProfile from './pages/UserProfile';
import SavedListings from './pages/SavedListings';
import Login from './pages/Login';
import Register from './pages/Register';
import PlaceholderPage from './pages/PlaceholderPage';
import NewsPage from './pages/NewsPage';
import NewsDetail from './pages/NewsDetail';
import ImageCredits from './pages/ImageCredits';
import { mainMenu } from './config/navigation';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? children : <Navigate to="/login" replace />;
}

function MenuSectionPage({ section }) {
  const { slug } = useParams();
  const menu = mainMenu.find((item) => item.label === section);
  const child = menu?.children?.find((item) => item.to.endsWith(`/${slug}`));
  return <PlaceholderPage title={child ? `${section} – ${child.label}` : section} />;
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
        <Route path="wiki" element={<MenuSectionPage section="Wiki BĐS" />} />
        <Route path="wiki/:slug" element={<MenuSectionPage section="Wiki BĐS" />} />
        <Route path="analysis" element={<MenuSectionPage section="Phân tích đánh giá" />} />
        <Route path="analysis/:slug" element={<MenuSectionPage section="Phân tích đánh giá" />} />
        <Route path="utilities/:slug" element={<PlaceholderPage title="Hỗ trợ tiện ích" />} />
        <Route path="support/:slug" element={<PlaceholderPage title="Hướng dẫn & hỗ trợ" />} />
        <Route path="policy/:slug" element={<PlaceholderPage title="Quy định" />} />
        <Route path="sitemap" element={<PlaceholderPage title="Sitemap" />} />
        <Route path="image-credits" element={<ImageCredits />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="saved" element={protectedPage(<SavedListings />)} />
        <Route path="seller/post" element={protectedPage(<SellerPost />)} />
        <Route path="seller/dashboard" element={protectedPage(<SellerDashboard />)} />
        <Route path="seller/listings" element={protectedPage(<PlaceholderPage title="Quản lý tin đăng" description="Danh sách tin của bạn sẽ kết nối endpoint /api/listings/my." />)} />
        <Route path="seller/customers" element={protectedPage(<PlaceholderPage title="Quản lý khách hàng" />)} />
        <Route path="seller/membership" element={protectedPage(<PlaceholderPage title="Gói hội viên" />)} />
        <Route path="seller/top-up" element={protectedPage(<PlaceholderPage title="Nạp tiền" />)} />
        <Route path="profile" element={protectedPage(<UserProfile />)} />
        <Route path="profile/password" element={protectedPage(<PlaceholderPage title="Đổi mật khẩu" />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
