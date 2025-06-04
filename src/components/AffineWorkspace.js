import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../context/TenantContext';
import useChatwoot from '../hooks/useChatwoot';
import './AffineWorkspace.css';

import defaultLogo from '../Assets/default.png';
const CHATWOOT_CONFIG = {
  default: {
    websiteToken: 'EnLeUXWwQeFicdvkKFDJkkfQ',
    baseUrl: 'https://app.chatwoot.com',
    launcherTitle: 'Chat with default Support'
  }
};

const NotificationBanner = ({ message, type = 'info' }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`notification-banner ${type}`}>
      <p>{message}</p>
      <button 
        className="close-banner" 
        onClick={() => setIsVisible(false)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

const AffineWorkspace = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const { currentTenant } = useTenant();
  const { initializeChatwoot } = useChatwoot();
  const affineUrl = 'http://localhost:3010';
  const locationRef = useRef(window.location);

  const getLogoImage = () => {
    return currentTenant?.branding?.logo || defaultLogo;
  };

  useEffect(() => {
    const checkTenantRedirect = () => {
      const params = new URLSearchParams(locationRef.current.search);
      const requestedTenant = params.get('tenant');
      const hostname = locationRef.current.hostname;
      const path = locationRef.current.pathname;
      const subdomain = hostname !== 'localhost' ? hostname.split('.')[0] : null;

      if (path.startsWith('/tenant=')) {
        const tenantFromPath = path.split('=')[1];
        const newUrl = new URL(locationRef.current.href);
        newUrl.pathname = '/';
        newUrl.searchParams.set('tenant', tenantFromPath);
        window.history.replaceState({}, '', newUrl.toString());
        locationRef.current = newUrl;
        
        setNotification({
          message: `Redirecting to the correct URL format for ${tenantFromPath} tenant...`,
          type: 'info'
        });
        return;
      }

      if (currentTenant?.id === 'default') {
        if (path !== '/' && path !== '/index.html' && !path.startsWith('/tenant=')) {
          setNotification({
            message: "Invalid path detected. You've been redirected to the default workspace.",
            type: 'warning'
          });
        }
        else if (requestedTenant && requestedTenant !== 'default') {
          setNotification({
            message: "The requested tenant was not found. You've been redirected to the default workspace.",
            type: 'warning'
          });
        }
        else if (subdomain && subdomain !== 'default') {
          setNotification({
            message: "Invalid tenant parameter detected. Showing default configuration.",
            type: 'info'
          });
        }
      }
    };

    const handleLocationChange = () => {
      locationRef.current = window.location;
      checkTenantRedirect();
    };

    checkTenantRedirect();

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);
    window.addEventListener('replacestate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
      window.removeEventListener('replacestate', handleLocationChange);
    };
  }, [currentTenant]); 

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(affineUrl);
        if (response.ok) {
          setIsLoading(false);
          setError(null);
          initializeChatwoot();
        } else {
          setError('AFFiNE server is not responding properly');
          setIsLoading(false);
        }
      } catch (err) {
        setError('AFFiNE server is not running. Please start the server using Docker Compose.');
        setIsLoading(false);
      }
    };

    checkServerStatus();
  }, [initializeChatwoot]);

  useEffect(() => {
    let chatwootInstance = null;

    const loadChatwoot = async () => {
      try {
        const existingScript = document.getElementById('chatwoot-script');
        if (existingScript) {
          existingScript.remove();
        }

        if (window.chatwootSDK) {
          window.chatwootSDK.reset();
        }

        const tenantConfig = currentTenant?.chatwoot || CHATWOOT_CONFIG.default;
        
        const script = document.createElement('script');
        script.id = 'chatwoot-script';
        script.src = `${tenantConfig.baseUrl}/packs/js/sdk.js`;
        script.defer = true;
        script.async = true;
        
        script.onload = () => {
          if (window.chatwootSDK) {
            const userDetails = {
              name: localStorage.getItem('userName') || 'Guest',
              email: localStorage.getItem('userEmail') || '',
              customAttributes: {
                tenant: currentTenant?.id,
                tenantName: currentTenant?.name,
                lastLogin: new Date().toISOString()
              }
            };

            chatwootInstance = window.chatwootSDK.run({
              ...tenantConfig,
              user: userDetails,
              onLoad: () => {
                console.log('Chatwoot loaded for tenant:', currentTenant?.id);
              },
              onError: (error) => {
                console.error('Chatwoot error:', error);
                setError('Failed to initialize chat support');
              }
            });
          }
        };

        script.onerror = (error) => {
          console.error('Failed to load Chatwoot script:', error);
          setError('Failed to load chat support');
        };

        document.body.appendChild(script);
      } catch (err) {
        console.error('Error initializing Chatwoot:', err);
        setError('Failed to initialize chat support');
      }
    };

    if (currentTenant) {
      loadChatwoot();
    }

    return () => {
      if (chatwootInstance) {
        try {
          window.chatwootSDK.reset();
        } catch (err) {
          console.error('Error cleaning up Chatwoot:', err);
        }
      }
      const script = document.getElementById('chatwoot-script');
      if (script) {
        script.remove();
      }
    };
  }, [currentTenant]); 

  const handleOpenWorkspace = () => {
    window.open(affineUrl, 'affine-workspace', 'width=1200,height=800');
    setIsOpen(true);
  };

  // Feature content and layout by tenant
  const getFeatureContent = () => {
    switch (currentTenant?.id) {
      case 'acme':
        // Column layout, custom text
        return (
          <div className="workspace-features column-layout">
            <div className="feature">
              <h4>Enterprise Security</h4>
              <p>All your data is protected with advanced encryption.</p>
            </div>
            <div className="feature">
              <h4>Instant Team Chat</h4>
              <p>Connect with support and your team in real time.</p>
            </div>
            <div className="feature">
              <h4>Smart Collaboration</h4>
              <p>AI-powered tools for seamless teamwork.</p>
            </div>
          </div>
        );
      case 'nexus':
        // Row layout, custom text
        return (
          <div className="workspace-features row-layout">
            <div className="feature">
              <h4>Cloud Native</h4>
              <p>Scale your workspace with our robust cloud platform.</p>
            </div>
            <div className="feature">
              <h4>24/7 Tech Support</h4>
              <p>Expert help is always available for your team.</p>
            </div>
            <div className="feature">
              <h4>Live Sync</h4>
              <p>Collaborate in real time, from anywhere.</p>
            </div>
          </div>
        );
      case 'harmony':
        // Overlapped layout, custom text, less overlap for readability
        return (
          <div className="workspace-features overlap-layout harmony-overlap">
            <div className="feature overlap1">
              <h4>Creative Freedom</h4>
              <p>Design, write, and brainstorm with no limits.</p>
            </div>
            <div className="feature overlap2">
              <h4>Personal Support</h4>
              <p>Our team is here to help you grow your ideas.</p>
            </div>
            <div className="feature overlap3">
              <h4>Harmony Sync</h4>
              <p>Work together in perfect sync, always.</p>
            </div>
          </div>
        );
      case 'atlassian':
        // Unique zigzag/stepped layout, custom text
        return (
          <div className="workspace-features atlassian-zigzag-layout">
            <div className="feature zigzag1">
              <h4>Cloud Reliability</h4>
              <p>Always-on infrastructure for your global teams.</p>
            </div>
            <div className="feature zigzag2">
              <h4>AI Chat Assistant</h4>
              <p>Smart, automated help and live support, 24/7.</p>
            </div>
            <div className="feature zigzag3">
              <h4>Agile Collaboration</h4>
              <p>Empower your teams to build, plan, and deliver together.</p>
            </div>
          </div>
        );
      default:
        // Default fallback (column)
        return (
          <div className="workspace-features column-layout">
            <div className="feature">
              <h4>Self-Hosted Solution</h4>
              <p>Your data stays on your server</p>
            </div>
            <div className="feature">
              <h4>Integrated Chat Support</h4>
              <p>Get help anytime with our chat widget</p>
            </div>
            <div className="feature">
              <h4>Collaborative Editing</h4>
              <p>Work together in real-time with your team</p>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="workspace-container">
        {notification && <NotificationBanner {...notification} />}
        <div className="workspace-content">
          <div className="workspace-placeholder loading">
            <h3>Loading {currentTenant?.name || 'Workspace'}...</h3>
            <p>Please wait while we connect to the server.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspace-container">
        {notification && <NotificationBanner {...notification} />}
        <div className="workspace-content">
          <div className="workspace-placeholder error">
            <h3>Connection Error</h3>
            <p>{error}</p>
            <div className="error-instructions">
              <h4>To start the server:</h4>
              <ol>
                <li>Navigate to the docker/affine directory</li>
                <li>Run: docker compose up -d</li>
                <li>Wait for all services to start</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-container">
      {notification && <NotificationBanner {...notification} />}
      <div className="workspace-header">
        <div className="workspace-branding">
          <img 
            src={getLogoImage()} 
            alt={`${currentTenant?.name || 'Company'} logo`} 
            className="tenant-logo"
          />
          <h2>{currentTenant?.name || 'Company'} Workspace</h2>
        </div>
        <div className="workspace-actions">
          <button 
            onClick={handleOpenWorkspace}
            className="open-workspace-btn"
            style={{
              backgroundColor: currentTenant?.branding?.colors?.primary || '#4a90e2',
              color: '#ffffff'
            }}
          >
            {isOpen ? 'Workspace Opened' : 'Open Workspace'}
          </button>
        </div>
      </div>
      <div className="workspace-content">
        <div className="workspace-placeholder">
          <h3>Welcome to {currentTenant?.name || 'Company'} Workspace</h3>
          <p>Click the button above to open your workspace in a new window.</p>
          {getFeatureContent()}
          {currentTenant?.contact && (
            <div className="tenant-contact">
              <h4>Contact Information</h4>
              <p>Email: {currentTenant.contact.email}</p>
              <p>Phone: {currentTenant.contact.phone}</p>
              <p>Address: {currentTenant.contact.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffineWorkspace; 