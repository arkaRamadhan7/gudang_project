import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppTopbar = forwardRef((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo flex items-center gap-2">
                <img src="/layout/images/cnc.png" width="47.22px" height="35px" alt="logo" />
                <div className="leading-tight">
                    <div className="text-lg font-semibold">PERGUDANGAN</div>
                    <div className="text-sm text-gray-500 uppercase">SAKTI</div>
                    <div className="text-sm text-blue-500 uppercase">MULTIUSAHA</div>
                </div>
            </Link>

            <button 
                ref={menubuttonRef} 
                type="button" 
                className="p-link layout-menu-button layout-topbar-button" 
                onClick={onMenuToggle}
            >
                <i className="pi pi-bars" />
            </button>

            <button 
                ref={topbarmenubuttonRef} 
                type="button" 
                className="p-link layout-topbar-menu-button layout-topbar-button" 
                onClick={showProfileSidebar}
            >
                <i className="pi pi-ellipsis-v" />
            </button>

            <div 
                ref={topbarmenuRef} 
                className={classNames('layout-topbar-menu', { 
                    'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible 
                })}
            >
                <Link href="/profile">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                </Link>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';
export default AppTopbar;

