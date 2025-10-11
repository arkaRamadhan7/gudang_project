import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchUserRole = async () => {
        try {
            console.log('Fetching user role...'); 
            
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Response status:', response.status); 

            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data); 
                
                const role = data.role || data.user?.role || data.payload?.role;
                
                if (role) {
                    setUserRole(role);
                    console.log('User role set to:', role);
                } else {
                    console.error('No role found in response:', data);
                    setError('Role not found in response');
                }
            } else {
                console.error('Response not ok:', response.statusText);
                setError(`API Error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mounted) {
            fetchUserRole();
        }
    }, [mounted]);

    const canAccessItem = (item) => {
        if (!item.roles) return true;
        
        if (!userRole) return false;
        
        return item.roles.includes(userRole);
    };

    const filterMenuItems = (items) => {
        if (!items) return [];
        return items.filter(item => canAccessItem(item));
    };

    const model = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }],
            roles: ['user', 'admin', 'superadmin'],
        },
        {
            label: 'Kode',
            icon: 'pi pi-fw pi-sitemap',
            roles: ['superadmin'],
            items: [
                {
                    label: 'Rak',
                    icon: 'pi pi-fw pi-database',
                    to: '/kode/rak',
                    roles: ['superadmin']
                },
                {   
                    label: 'Satuan Stock', 
                    icon: 'pi pi-list', 
                    to: '/kode/satuanstock',
                    roles: ['superadmin'] 
                },
                {
                    label: 'Golongan Stock',
                    icon: 'pi pi-fw pi-th-large',
                    to: '/kode/golonganstock',
                    roles: ['superadmin']
                },
                {
                    label: "Toko",
                    icon: "pi pi-building",
                    to: '/kode/toko'
                },
            ]
        },
        {
            label: "PENJUALAN",
            items: [
                {
                    label:"Master",
                    icon: "pi pi-briefcase",
                    items: [
                        {
                           label:"Perubahan Harga",
                           icon: "pi pi-tag", 
                           to: "/penjualan/master/perubahanHarga"
                        },
                        {
                           label:"Discount Periode",
                           icon:"pi pi-percentage",
                           to: "/penjualan/master/diskonPeriode"

                        },
                        {
                            label:"Tambah Stock",
                            icon:"pi pi-box", 
                            to:"/penjualan/master/tambah-stock-dari-gudang"
                        },
                    ] 
                },
                
                {
                 label: "Penjualan",
                 icon: "pi pi-shopping-cart",
                 to: "/penjualan/penjualan"
                },
            ]
        },

        {
            label: 'GUDANG',
            icon: 'pi pi-fw pi-sitemap',
            roles: ['user', 'admin', 'superadmin'],
            items: [
                {
                    label: 'Gudang',
                    icon: 'pi pi-fw pi-building',
                    to: '/master/gudang',
                    roles: ['superadmin']
                },
                {
                    label: 'Stock',
                    icon: 'pi pi-fw pi-box',
                    to: '/master/stock',
                    roles: ['user', 'admin', 'superadmin']
                },
                {
                    label: 'Kirim Barang',
                    icon: 'pi pi-send',
                    to: '/master/kirim-barang',
                    roles: ['user', 'admin', 'superadmin']
                },
                {
                    label: 'Terima Barang',
                    icon: 'pi pi-inbox',
                    to: '/master/terima-barang',
                    roles: ['user', 'admin', 'superadmin']
                },
                {
                    label: "Request Stock",
                    icon: "pi pi-box",
                    to: "/master/request-stock"

                },

                {
                    label: 'Users', 
                    icon: 'pi pi-users',
                    to: '/master/user',
                    roles: ['superadmin'] 
                },
                {
                    label : 'Jenis Role',
                    icon : 'pi pi-shield',
                    to : '/master/jenis-role',
                    roles : ['superadmin']
                }
            ]
        },
        {
            label: 'Laporan',
            icon: 'pi pi-fw pi-chart-bar',
            roles: ['user', 'admin', 'superadmin'],
            items: [
                {
                    label: 'Kartu Stock',
                    icon: 'pi pi-fw pi-sync',
                    to: '/laporan/kartustock',
                    roles: ['user', 'admin', 'superadmin']
                },
                {
                    label: "Laporan Sisa Stock",
                    icon: 'pi pi-shopping-cart',
                    to: '/laporan/stock'

                },
                {
                    label: "Laporan Mutasi Gudang",
                    icon: "pi pi-truck",
                    to: "/laporan/mutasi"
                }
            ]
        }
    ];

    if (!mounted || loading) {
        return (
            <MenuProvider>
                <ul className="layout-menu">
                    <li style={{ padding: '1rem', color: '#666' }}>
                        <i className="pi pi-spin pi-spinner" style={{ marginRight: '0.5rem' }}></i>
                        Loading menu...
                    </li>
                </ul>
            </MenuProvider>
        );
    }

    if (error) {
        return (
            <MenuProvider>
                <ul className="layout-menu">
                    <li style={{ padding: '1rem', color: '#e74c3c' }}>
                        <i className="pi pi-exclamation-triangle" style={{ marginRight: '0.5rem' }}></i>
                        Error loading menu: {error}
                    </li>
                    <li style={{ padding: '0.5rem 1rem' }}>
                        <button 
                            onClick={fetchUserRole}
                            style={{ 
                                padding: '0.25rem 0.5rem', 
                                backgroundColor: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </li>
                </ul>
            </MenuProvider>
        );
    }

    const filteredModel = model.map(category => {
        if (!canAccessItem(category)) {
            return null;
        }

        const filteredItems = category.items ? filterMenuItems(category.items) : [];
        
        if (category.items && filteredItems.length === 0) {
            return null;
        }

        return {
            ...category,
            items: filteredItems
        };
    }).filter(Boolean);

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {process.env.NODE_ENV === 'development'}
                
                {filteredModel.map((item, i) => {
                    return !item?.separator ? (
                        <AppMenuitem item={item} root={true} index={i} key={item.label} />
                    ) : (
                        <li className="menu-separator" key={`separator-${i}`}></li>
                    );
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;