import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

// Code-split pages for faster initial load
const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/entrepreneur/DashboardPage'));
const BusinessProfilePage = lazy(() => import('@/pages/entrepreneur/BusinessProfilePage'));
const IntelligencePage = lazy(() => import('@/pages/entrepreneur/IntelligencePage'));
const RoadmapPage = lazy(() => import('@/pages/entrepreneur/RoadmapPage'));
const ApplicationPage = lazy(() => import('@/pages/entrepreneur/ApplicationPage'));
const VaultPage = lazy(() => import('@/pages/entrepreneur/VaultPage'));
const QueryPage = lazy(() => import('@/pages/entrepreneur/QueryPage'));
const IncentivesPage = lazy(() => import('@/pages/entrepreneur/IncentivesPage'));
const GovDashboardPage = lazy(() => import('@/pages/government/GovDashboardPage'));
const ApplicationsPage = lazy(() => import('@/pages/government/ApplicationsPage'));
const ApplicationDetailPage = lazy(() => import('@/pages/government/ApplicationDetailPage'));
const AnalyticsPage = lazy(() => import('@/pages/government/AnalyticsPage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#64748b' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
        <div style={{ width: '16px', height: '16px', border: '2px solid #cbd5e1', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <span>Loading...</span>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 85px)' }}>
        <Sidebar />
        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />

            {/* Entrepreneur Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/business-profile" element={<BusinessProfilePage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/application/:id" element={<ApplicationPage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/query/:id" element={<QueryPage />} />
            <Route path="/incentives" element={<IncentivesPage />} />

            {/* Government Officer Routes */}
            <Route path="/government/dashboard" element={<GovDashboardPage />} />
            <Route path="/government/applications" element={<ApplicationsPage />} />
            <Route path="/government/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/government/analytics" element={<AnalyticsPage />} />

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
