import React, { createContext, useContext, useState, useEffect } from 'react';
import '../styles/themes.css';

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

const API_BASE_URL = 'http://localhost:4000/api';

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateAndSetTenant = async (tenantId, subdomain = null) => {
    try {
      setLoading(true);
      setError(null);

      // Validate tenant through backend
      const response = await fetch(
        `${API_BASE_URL}/validate-tenant?tenant=${tenantId}${subdomain ? `&subdomain=${subdomain}` : ''}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate tenant');
      }

      const { tenant } = await response.json();
      setCurrentTenant(tenant);
    } catch (err) {
      setError(err.message);
      // Set default tenant on error
      const defaultResponse = await fetch(`${API_BASE_URL}/tenants/default`);
      const defaultTenant = await defaultResponse.json();
      setCurrentTenant(defaultTenant);
    } finally {
      setLoading(false);
    }
  };

  const validateSubdomain = async (subdomain) => {
    try {
      const response = await fetch(`${API_BASE_URL}/validate-subdomain?subdomain=${subdomain}`);
      if (!response.ok) {
        throw new Error('Invalid subdomain');
      }
      const { tenant } = await response.json();
      return tenant;
    } catch (err) {
      return null;
    }
  };

  const applyTenantStyles = (tenant) => {
    const { colors, theme } = tenant.branding;
    
    // Remove all theme classes
    document.body.classList.remove(
      'theme-modern-minimalist',
      'theme-corporate-professional',
      'theme-tech-forward',
      'theme-creative-studio'
    );

    // Add current theme class
    document.body.classList.add(`theme-${theme.name}`);

    // Create CSS variables for tenant colors
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--background-color', colors.background);
    root.style.setProperty('--success-color', colors.success);
    root.style.setProperty('--error-color', colors.error);
    root.style.setProperty('--warning-color', colors.warning);
    root.style.setProperty('--info-color', colors.info);

    // Apply typography
    root.style.setProperty('--font-primary', theme.typography.primary);
    root.style.setProperty('--font-secondary', theme.typography.secondary);
    root.style.setProperty('--font-size-base', theme.typography.baseSize);
    root.style.setProperty('--font-scale', theme.typography.scale);

    // Apply layout settings
    root.style.setProperty('--border-radius', theme.layout.borderRadius);
    root.style.setProperty('--container-width', theme.layout.containerWidth);
    root.style.setProperty('--header-height', theme.components.headerHeight);

    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
    favicon.type = 'image/x-icon';
    favicon.rel = 'shortcut icon';
    favicon.href = tenant.branding.favicon;
    document.getElementsByTagName('head')[0].appendChild(favicon);

    // Update page title
    document.title = tenant.name;

    // Load theme-specific fonts
    const fontFamilies = [
      theme.typography.primary,
      theme.typography.secondary
    ].map(font => font.replace(/['"]/g, ''));

    // Load Google Fonts
    const fontLinks = fontFamilies.map(font => {
      const fontName = font.split(',')[0].trim();
      return `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
    });

    // Remove existing font links
    document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => link.remove());

    // Add new font links
    fontLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  };

  const updateTenant = async (tenantId) => {
    try {
      setLoading(true);
      setError(null);
      await validateAndSetTenant(tenantId);
      
      // Update URL to reflect new tenant
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tenant', tenantId);
      window.history.replaceState({}, '', newUrl.toString());
      
      // Apply tenant styles if tenant is loaded successfully
      if (currentTenant) {
        applyTenantStyles(currentTenant);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to update tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeTenant = async () => {
      const params = new URLSearchParams(window.location.search);
      const requestedTenant = params.get('tenant');
      const hostname = window.location.hostname;
      const subdomain = hostname !== 'localhost' ? hostname.split('.')[0] : null;

      if (subdomain) {
        const subdomainTenant = await validateSubdomain(subdomain);
        if (subdomainTenant) {
          await validateAndSetTenant(subdomainTenant.id, subdomain);
          return;
        }
      }

      if (requestedTenant) {
        await validateAndSetTenant(requestedTenant);
      } else {
        await validateAndSetTenant('default');
      }
    };

    initializeTenant();
  }, []);

  const value = {
    currentTenant,
    loading,
    error,
    validateAndSetTenant,
    validateSubdomain,
    updateTenant
  };

  if (loading) {
    return (
      <div className={`loading-container theme-${currentTenant?.branding?.theme?.name || 'modern-minimalist'}`}>
        <div className="loading-spinner"></div>
        <p>Loading {currentTenant?.name || 'tenant'} configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`error-container theme-${currentTenant?.branding?.theme?.name || 'modern-minimalist'}`}>
        <div className="error-icon">⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext; 