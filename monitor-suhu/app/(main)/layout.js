import Layout from '../../layout/layout';

export const metadata = {
  title: 'Inventory Management System',
  description: 'Modern inventory management system with dark blue theme.',
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    title: 'Inventory Management System',
    url: 'https://sakai.primereact.org/',
    description: 'Modern inventory management system with dark blue theme.',
    images: ['https://www.primefaces.org/static/social/sakai-react.png'],
    ttl: 604800
  },
  icons: {
    icon: '/favicon.ico'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function AppLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          body, html {
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%) !important;
            min-height: 100vh;
            margin: 0;
            padding: 0;
            color: #f1f5f9 !important;
          }
          * {
            color: #f1f5f9;
          }
          .layout-wrapper,
          .layout-main-container,
          .layout-main {
            background: transparent !important;
          }
          .layout-sidebar {
            background: rgba(30, 41, 59, 0.95) !important;
            backdrop-filter: blur(10px);
            border-right: 1px solid #475569 !important;
          }
          .layout-sidebar * {
            color: #cbd5e1 !important;
          }
          .layout-topbar {
            background: rgba(30, 41, 59, 0.95) !important;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #475569 !important;
          }
          .layout-topbar *,
          .layout-topbar-logo,
          .layout-topbar-button {
            color: #f1f5f9 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #f1f5f9 !important;
          }
          p, span, div, a, label {
            color: #cbd5e1;
          }
          .layout-menu a {
            color: #cbd5e1 !important;
            transition: all 0.3s ease;
          }
          .layout-menu a:hover {
            color: #1e3a8a !important;
            background: rgba(255, 255, 255, 0.15) !important;
          }
          .layout-menu a.active-route,
          .layout-menu a.router-link-active {
            color: white !important;
          }
        `
      }} />
      <Layout>{children}</Layout>
    </>
  );
}