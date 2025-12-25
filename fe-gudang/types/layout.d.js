import React from 'react';

/**
 * @typedef {Object} AppBreadcrumbProps
 * @property {string} [className]
 */

/**
 * @typedef {Object} Breadcrumb
 * @property {string[]} [labels]
 * @property {string} [to]
 */

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label
 * @property {string} [to]
 * @property {BreadcrumbItem[]} [items]
 */

/**
 * @typedef {Object} LayoutState
 * @property {boolean} staticMenuDesktopInactive
 * @property {boolean} overlayMenuActive
 * @property {boolean} profileSidebarVisible
 * @property {boolean} configSidebarVisible
 * @property {boolean} staticMenuMobileActive
 * @property {boolean} menuHoverActive
 */

/**
 * @typedef {Object} LayoutConfig
 * @property {boolean} ripple
 * @property {string} inputStyle
 * @property {string} menuMode
 * @property {string} colorScheme
 * @property {string} theme
 * @property {number} scale
 */

/**
 * @typedef {Object} LayoutContextProps
 * @property {LayoutConfig} layoutConfig
 * @property {React.Dispatch<React.SetStateAction<LayoutConfig>>} setLayoutConfig
 * @property {LayoutState} layoutState
 * @property {React.Dispatch<React.SetStateAction<LayoutState>>} setLayoutState
 * @property {() => void} onMenuToggle
 * @property {() => void} showProfileSidebar
 */

/**
 * @typedef {Object} MenuContextProps
 * @property {string} activeMenu
 * @property {React.Dispatch<React.SetStateAction<string>>} setActiveMenu
 */

/**
 * @typedef {Object} AppConfigProps
 * @property {boolean} [simple]
 */

/**
 * @typedef {Object} AppTopbarRef
 * @property {HTMLButtonElement | null} [menubutton]
 * @property {HTMLDivElement | null} [topbarmenu]
 * @property {HTMLButtonElement | null} [topbarmenubutton]
 */

/**
 * @typedef {Object} CommandProps
 * @property {React.MouseEvent<HTMLAnchorElement, MouseEvent>} originalEvent
 * @property {MenuModelItem} item
 */

/**
 * @typedef {Object} MenuProps
 * @property {MenuModel[]} model
 */

/**
 * @typedef {Object} MenuModel
 * @property {string} label
 * @property {string} [icon]
 * @property {MenuModel[]} [items]
 * @property {string} [to]
 * @property {string} [url]
 * @property {string} [target]
 * @property {boolean} [seperator]
 */

/**
 * @typedef {Object} AppMenuItem
 * @property {string} label
 * @property {string} [icon]
 * @property {AppMenuItem[]} [items]
 * @property {string} [to]
 * @property {string} [url]
 * @property {string} [target]
 * @property {boolean} [seperator]
 * @property {'UPDATED' | 'NEW'} [badge]
 * @property {string} [badgeClass]
 * @property {string} [class]
 * @property {boolean} [preventExact]
 * @property {boolean} [visible]
 * @property {boolean} [disabled]
 * @property {boolean} [replaceUrl]
 * @property {(props: CommandProps) => void} [command]
 */

/**
 * @typedef {Object} AppMenuItemProps
 * @property {AppMenuItem} [item]
 * @property {string} [parentKey]
 * @property {number} [index]
 * @property {boolean} [root]
 * @property {string} [className]
 */
