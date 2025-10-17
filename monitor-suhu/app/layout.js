'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { AuthProvider } from './(auth)/context/authContext';

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-dark-indigo/theme.css`} rel="stylesheet" />
                <link id="theme-override-css" href={`/themes/my-theme-override.css`} rel="stylesheet" />
            </head>
            <body>
                <AuthProvider>
                <PrimeReactProvider>
                    <LayoutProvider>{children}</LayoutProvider>
                </PrimeReactProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
