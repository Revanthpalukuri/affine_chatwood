import React from 'react';
import { useTenant } from '../context/TenantContext';
import '../styles/AppLayout.css';

import defaultLogo from '../Assets/default.png';

const AppLayout = ({ children }) => {
  const { currentTenant } = useTenant();

  const getLogoImage = () => {
    return currentTenant?.branding?.logo || defaultLogo;
  };

  const getHeaderContent = () => {
    switch (currentTenant?.id) {
      case 'acme':
        return {
          title: 'Acme Enterprise',
          navItems: ['Dashboard', 'Solutions', 'Enterprise', 'Support']
        };
      case 'nexus':
        return {
          title: 'Nexus Tech',
          navItems: ['Platform', 'Innovation', 'Developers', 'Support']
        };
      case 'harmony':
        return {
          title: 'Harmony Studio',
          navItems: ['Portfolio', 'Services', 'Creative']
        };
      default:
        return {
          title: 'Modern Store',
          navItems: ['Home', 'Products', 'About', 'Contact']
        };
    }
  };

  const getFooterContent = () => {
    const year = new Date().getFullYear();
    switch (currentTenant?.id) {
      case 'acme':
        return `© ${year} Acme Enterprise Solutions. All rights reserved.`;
      case 'nexus':
        return `© ${year} Nexus Technologies. Innovating the future.`;
      case 'harmony':
        return `© ${year} Harmony Creative Studio. Where ideas come to life.`;
      default:
        return `© ${year} Modern Store. All rights reserved.`;
    }
  };

  const headerContent = getHeaderContent();
  const footerContent = getFooterContent();

  return (
    <div className={`app-layout theme-${currentTenant?.branding?.theme?.name || 'modern-minimalist'}`}>
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <img 
              src={getLogoImage()}
              alt={currentTenant?.name || 'Company'} 
              className="tenant-logo"
            />
            <h1 className="tenant-title">{currentTenant?.name || 'Company'}</h1>
          </div>
          <nav className="main-nav">
            {headerContent.navItems.map((item, index) => (
              <a 
                key={index} 
                href={`#${item.toLowerCase()}`}
                className="nav-item"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-text">{footerContent}</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout; 