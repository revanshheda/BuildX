import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

// Code-split pages for faster initial load
const LandingPage = lazy(() => import('@/Pages/LandingPage'));
const DashboardPage = lazy(() => import('@/Pages/entrepreneur/DashboardPage'));
const BusinessProfilePage = lazy(() => import('@/Pages/entrepreneur/BusinessProfilePage'));
const IntelligencePage = lazy(() => import('@/Pages/entrepreneur/IntelligencePage'));
const RoadmapPage = lazy(() => import('@/Pages/entrepreneur/RoadmapPage'));
const ApplicationPage = lazy(() => import('@/Pages/entrepreneur/ApplicationPage'));
const VaultPage = lazy(() => import('@/Pages/entrepreneur/VaultPage'));
const QueryPage = lazy(() => import('@/Pages/entrepreneur/QueryPage'));
const IncentivesPage = lazy(() => import('@/Pages/entrepreneur/IncentivesPage'));
const GovDashboardPage = lazy(() => import('@/Pages/government/GovDashboardPage'));
const ApplicationsPage = lazy(() => import('@/Pages/government/ApplicationsPage'));
const ApplicationDetailPage = lazy(() => import('@/Pages/government/ApplicationDetailPage'));
const AnalyticsPage = lazy(() => import('@/Pages/government/AnalyticsPage'));

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

function AppLayout({ children }: { children: React.ReactNode }) {
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

function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Standalone Landing Page */}
          <Route
            path="/"
            element={
              <LandingLayout>
                <LandingPage />
              </LandingLayout>
            }
          />

          {/* Internal Entrepreneur Routes */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            }
          />
          <Route
            path="/business-profile"
            element={
              <AppLayout>
                <BusinessProfilePage />
              </AppLayout>
            }
          />
          <Route
            path="/intelligence"
            element={
              <AppLayout>
                <IntelligencePage />
              </AppLayout>
            }
          />
          <Route
            path="/roadmap"
            element={
              <AppLayout>
                <RoadmapPage />
              </AppLayout>
            }
          />
          <Route
            path="/application/:id"
            element={
              <AppLayout>
                <ApplicationPage />
              </AppLayout>
            }
          />
          <Route
            path="/vault"
            element={
              <AppLayout>
                <VaultPage />
              </AppLayout>
            }
          />
          <Route
            path="/query/:id"
            element={
              <AppLayout>
                <QueryPage />
              </AppLayout>
            }
          />
          <Route
            path="/incentives"
            element={
              <AppLayout>
                <IncentivesPage />
              </AppLayout>
            }
          />

          {/* Internal Government Officer Routes */}
          <Route
            path="/government/dashboard"
            element={
              <AppLayout>
                <GovDashboardPage />
              </AppLayout>
            }
          />
          <Route
            path="/government/applications"
            element={
              <AppLayout>
                <ApplicationsPage />
              </AppLayout>
            }
          />
          <Route
            path="/government/applications/:id"
            element={
              <AppLayout>
                <ApplicationDetailPage />
              </AppLayout>
            }
          />
          <Route
            path="/government/analytics"
            element={
              <AppLayout>
                <AnalyticsPage />
              </AppLayout>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <LandingLayout>
                <LandingPage />
              </LandingLayout>
            }
          />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
