import { useEffect, useCallback } from 'react';
import { useTenant } from '../context/TenantContext';

export const useChatwoot = () => {
  const { currentTenant } = useTenant();

  const initializeChatwoot = useCallback(() => {
    if (!currentTenant?.chatwoot) return;

    const { websiteToken, baseUrl, widgetSettings } = currentTenant.chatwoot;

    const existingScript = document.getElementById('chatwoot-sdk');
    if (existingScript) {
      existingScript.remove();
    }

    const existingContainer = document.getElementById('chatwoot-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    const script = document.createElement('script');
    script.id = 'chatwoot-sdk';
    script.src = `${baseUrl}/packs/widgets.js`;
    script.async = true;

    script.onload = () => {
      if (window.chatwootSettings) {
        window.chatwootSettings = {};
      }

      window.chatwootSettings = {
        websiteToken,
        baseUrl,
        ...widgetSettings,
        locale: 'en',
        type: widgetSettings.type || 'standard',
        position: widgetSettings.position || 'right',
        launcherTitle: widgetSettings.launcherTitle || 'Chat with us',
        showPopoverButton: widgetSettings.showPopoverButton ?? true,
        showEmojiPicker: widgetSettings.showEmojiPicker ?? true,
        showFileUpload: widgetSettings.showFileUpload ?? true,
        widgetStyle: widgetSettings.widgetStyle || {},
        preChatForm: currentTenant.chatwoot.preChatForm || {},
        customMessages: currentTenant.chatwoot.customMessages || {}
      };

      if (window.$chatwoot) {
        window.$chatwoot.toggleBubbleVisibility(false);
        window.$chatwoot.toggle(false);
        window.$chatwoot.run();
      }
    };

    document.body.appendChild(script);
  }, [currentTenant]);

  const destroyChatwoot = useCallback(() => {
    const script = document.getElementById('chatwoot-sdk');
    if (script) {
      script.remove();
    }

    const container = document.getElementById('chatwoot-container');
    if (container) {
      container.remove();
    }

    if (window.chatwootSettings) {
      window.chatwootSettings = {};
    }

    if (window.$chatwoot) {
      window.$chatwoot.toggleBubbleVisibility(false);
      window.$chatwoot.toggle(false);
    }
  }, []);

  useEffect(() => {
    if (currentTenant?.chatwoot) {
      const timer = setTimeout(initializeChatwoot, 1000);

      return () => {
        clearTimeout(timer);
        destroyChatwoot();
      };
    }
  }, [currentTenant, initializeChatwoot, destroyChatwoot]);

  return {
    initializeChatwoot,
    destroyChatwoot
  };
};

export default useChatwoot; 