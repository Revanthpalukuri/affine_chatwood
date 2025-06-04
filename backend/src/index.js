const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

const CHATWOOT_CONFIG = {
  baseUrl: 'https://app.chatwoot.com',
  accessToken: 'S6S2h4ZXbaeKtARgqyZ8dm43',
  accountId: '121861'
};

const chatwootApi = axios.create({
  baseURL: CHATWOOT_CONFIG.baseUrl,
  headers: {
    'api_access_token': CHATWOOT_CONFIG.accessToken,
    'Content-Type': 'application/json'
  }
});

const WELCOME_TAGLINES = [
  "We're here to help you succeed!",
  "How can we make your day better?",
  "Your support team is just a message away!",
  "Let us know how we can assist you.",
  "Welcome! How can we help you today?",
  "Need help? We're always here!",
  "Ask us anything, anytime!",
  "We're happy to support you!",
  "Your satisfaction is our priority!",
  "Let's solve it together!"
];

function getRandomWelcomeTagline() {
  return WELCOME_TAGLINES[Math.floor(Math.random() * WELCOME_TAGLINES.length)];
}

const chatwootService = {
  async createInbox(tenantName, branding) {
    try {
      const inboxResponse = await chatwootApi.post(`/api/v1/accounts/${CHATWOOT_CONFIG.accountId}/inboxes`, {
        name: `${tenantName} Support`,
        greeting_enabled: true,
        greeting_message: `Welcome to ${tenantName} Support! How can we help you today?`,
        enable_email_collect: true,
        csat_survey_enabled: true,
        enable_auto_assignment: true,
        working_hours_enabled: true,
        out_of_office_message: "We are currently out of office. Please leave a message and we will get back to you.",
        timezone: "America/New_York",
        allow_messages_after_resolved: true,
        lock_to_single_conversation: true,
        sender_name_type: "friendly",
        business_name: tenantName,
        channel: {
          type: "web_widget",
          website_url: "http://localhost:3001/",
          welcome_title: `Welcome to ${tenantName} support`,
          welcome_tagline: getRandomWelcomeTagline(),
          widget_color: branding.colors.primary
        },
        working_hours: [
          {
            day_of_week: 0,
            closed_all_day: true,
            open_hour: null,
            open_minutes: null,
            close_hour: null,
            close_minutes: null,
            open_all_day: false
          },
          {
            day_of_week: 1,
            closed_all_day: false,
            open_hour: 9,
            open_minutes: 0,
            close_hour: 17,
            close_minutes: 0,
            open_all_day: false
          },
          {
            day_of_week: 2,
            closed_all_day: false,
            open_hour: 9,
            open_minutes: 0,
            close_hour: 17,
            close_minutes: 0,
            open_all_day: false
          },
          {
            day_of_week: 3,
            closed_all_day: false,
            open_hour: 9,
            open_minutes: 0,
            close_hour: 17,
            close_minutes: 0,
            open_all_day: false
          },
          {
            day_of_week: 4,
            closed_all_day: false,
            open_hour: 9,
            open_minutes: 0,
            close_hour: 17,
            close_minutes: 0,
            open_all_day: false
          },
          {
            day_of_week: 5,
            closed_all_day: false,
            open_hour: 9,
            open_minutes: 0,
            close_hour: 17,
            close_minutes: 0,
            open_all_day: false
          },
          {
            day_of_week: 6,
            closed_all_day: true,
            open_hour: null,
            open_minutes: null,
            close_hour: null,
            close_minutes: null,
            open_all_day: false
          }
        ],
        pre_chat_form_enabled: true,
        pre_chat_form_options: {
          pre_chat_message: "Please share your details to help us serve you better.",
          pre_chat_fields: [
            {
              field_type: "standard",
              label: "Email Id",
              name: "emailAddress",
              type: "email",
              required: true,
              enabled: true
            },
            {
              field_type: "standard",
              label: "Full name",
              name: "fullName",
              type: "text",
              required: true,
              enabled: true
            },
            {
              field_type: "standard",
              label: "Phone number",
              name: "phoneNumber",
              type: "text",
              required: false,
              enabled: true
            }
          ]
        }
      });

      const inbox = inboxResponse.data;
      return {
        inboxId: inbox.id,
        channelId: inbox.channel_id,
        websiteToken: inbox.website_token,
        hmacToken: inbox.hmac_token,
        widgetScript: inbox.web_widget_script,
        configuration: {
          greetingEnabled: inbox.greeting_enabled,
          greetingMessage: inbox.greeting_message,
          enableEmailCollect: inbox.enable_email_collect,
          csatSurveyEnabled: inbox.csat_survey_enabled,
          enableAutoAssignment: inbox.enable_auto_assignment,
          workingHoursEnabled: inbox.working_hours_enabled,
          outOfOfficeMessage: inbox.out_of_office_message,
          timezone: inbox.timezone,
          allowMessagesAfterResolved: inbox.allow_messages_after_resolved,
          lockToSingleConversation: inbox.lock_to_single_conversation,
          senderNameType: inbox.sender_name_type,
          businessName: inbox.business_name,
          widgetColor: inbox.widget_color,
          welcomeTitle: inbox.welcome_title,
          welcomeTagline: inbox.welcome_tagline,
          workingHours: inbox.working_hours,
          preChatFormEnabled: inbox.pre_chat_form_enabled,
          preChatFormOptions: inbox.pre_chat_form_options,
          selectedFeatureFlags: inbox.selected_feature_flags,
          replyTime: inbox.reply_time
        }
      };
    } catch (error) {
      console.error('Chatwoot API Error:', error.response?.data || error.message);
      throw new Error('Failed to create Chatwoot inbox');
    }
  },

  async updateInbox(inboxId, updates) {
    try {
      const response = await chatwootApi.patch(
        `/api/v1/accounts/${CHATWOOT_CONFIG.accountId}/inboxes/${inboxId}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error('Chatwoot API Error:', error.response?.data || error.message);
      throw new Error('Failed to update Chatwoot inbox');
    }
  },

  async deleteInbox(inboxId) {
    try {
      await chatwootApi.delete(
        `/api/v1/accounts/${CHATWOOT_CONFIG.accountId}/inboxes/${inboxId}`
      );
    } catch (error) {
      console.error('Chatwoot API Error:', error.response?.data || error.message);
      throw new Error('Failed to delete Chatwoot inbox');
    }
  },

  async getInboxDetails(inboxId) {
    try {
      const response = await chatwootApi.get(
        `/api/v1/accounts/${CHATWOOT_CONFIG.accountId}/inboxes/${inboxId}`
      );
      return response.data;
    } catch (error) {
      console.error('Chatwoot API Error:', error.response?.data || error.message);
      throw new Error('Failed to get Chatwoot inbox details');
    }
  }
};

const BRAND_COLORS = [
  '#2563EB', 
  '#7C3AED', 
  '#059669', 
  '#DC2626', 
  '#D97706', 
  '#4F46E5', 
  '#EA580C', 
  '#16A34A', 
  '#9333EA', 
  '#0891B2', 
];

const getRandomBrandColor = () => {
  const randomIndex = Math.floor(Math.random() * BRAND_COLORS.length);
  return BRAND_COLORS[randomIndex];
};

let tenants = {
  default: {
    id: 'default',
    name: 'Default Workspace',
    branding: {
      logo: 'https://shorturl.at/KPwIT',
      colors: { primary: '#4A90E2' }
    },
    chatwoot: {
      websiteToken: 'EnLeUXWwQeFicdvkKFDJkkfQ',
      launcherTitle: 'Chat with default Support',
      baseUrl: 'https://app.chatwoot.com',
      widgetSettings: {
        position: 'right',
        type: 'expanded_bubble',
        launcherTitle: 'Chat with default Support',
        widgetStyle: {
          launcherIcon: 'https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740'
        }
      }
    },
    contact: {
      email: 'support@default.com',
      phone: '+1-555-0123',
      address: '123 Default St'
    }
  },
  acme: {
    id: 'acme',
    name: 'Acme Corporation',
    branding: {
      logo: 'https://shorturl.at/Ch5Kt',
      colors: { primary: '#FF5722' },
      theme: {
        name: 'acme',
      }
    },
    chatwoot: {
      websiteToken: 'GuMkHPTdgVy8BAnpNWpeJ7VQ',
      launcherTitle: 'Chat with Acme Support',
      baseUrl: 'https://app.chatwoot.com',
      widgetSettings: {
        position: 'right',
        type: 'expanded_bubble',
        launcherTitle: 'Chat with Acme Support',
        widgetStyle: {
          launcherIcon: 'https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740'
        }
      }
    },
    contact: {
      email: 'support@acme.com',
      phone: '+1-555-0124',
      address: '456 Acme Ave'
    }
  },
  nexus: {
    id: 'nexus',
    name: 'Nexus Technologies',
    branding: {
      logo: 'https://shorturl.at/tRckz',
      colors: { primary: '#00BCD4' },
      theme: {
        name: 'nexus',
      }
    },
    chatwoot: {
      websiteToken: '4sJ5CR3RrfdLPMKxxQXCuuJR',
      launcherTitle: 'Chat with Nexus Support',
      baseUrl: 'https://app.chatwoot.com',
      widgetSettings: {
        position: 'right',
        type: 'expanded_bubble',
        launcherTitle: 'Chat with Nexus Support',
        widgetStyle: {
          launcherIcon: 'https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740'
        }
      }
    },
    contact: {
      email: 'support@nexus.com',
      phone: '+1-555-0125',
      address: '789 Nexus Blvd'
    }
  },
  harmony: {
    id: 'harmony',
    name: 'Harmony Solutions',
    branding: {
      logo: 'https://shorturl.at/q5Vca',
      colors: { primary: '#8E24AA' },
      theme: {
        name: 'harmony',
      }
    },
    chatwoot: {
      websiteToken: 'c5D2WBBS3TQMuL4mijvvsxa8',
      launcherTitle: 'Chat with Harmony Support',
      baseUrl: 'https://app.chatwoot.com',
      widgetSettings: {
        position: 'right',
        type: 'expanded_bubble',
        launcherTitle: 'Chat with Harmony Support',
        widgetStyle: {
          launcherIcon: 'https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740'
        }
      }
    },
    contact: {
      email: 'support@harmony.com',
      phone: '+1-555-0126',
      address: '321 Harmony Way'
    }
  }
};

const validateTenantData = (req, res, next) => {
  const { id, name, branding, contact } = req.body;

  if (!id || !name) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Tenant ID and name are required'
    });
  }

  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Tenant ID can only contain letters, numbers, and hyphens'
    });
  }

  if (req.method === 'POST' && tenants[id]) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'A tenant with this ID already exists'
    });
  }

  if (!branding || !contact) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Branding and contact information are required'
    });
  }

  if (!branding.logo) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Branding must include logo'
    });
  }

  if (!contact.email || !contact.phone || !contact.address) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Contact information must include email, phone, and address'
    });
  }

  next();
};

app.post('/api/tenants', validateTenantData, async (req, res) => {
  try {
    const { id, name, branding, contact } = req.body;

    const theme = branding.theme || {
      name: 'aurora-vivid',
      typography: {
        primary: 'Orbitron, sans-serif',
        secondary: 'Arial, sans-serif',
        baseSize: '16px',
        scale: '1.13'
      },
      layout: {
        borderRadius: '32px',
        containerWidth: '1250px'
      },
      components: {
        headerHeight: '80px'
      }
    };

    const tenantBranding = {
      ...branding,
      colors: {
        primary: branding.colors?.primary || getRandomBrandColor()
      },
      theme
    };

    const chatwootConfig = await chatwootService.createInbox(name, tenantBranding);

    const newTenant = {
      id,
      name,
      branding: tenantBranding,
      chatwoot: {
        ...chatwootConfig,
        launcherTitle: `Chat with ${name} Support`,
        baseUrl: CHATWOOT_CONFIG.baseUrl,
        widgetSettings: {
          position: 'right',
          type: 'expanded_bubble',
          launcherTitle: `Chat with ${name} Support`,
          widgetStyle: {
            launcherIcon: 'https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?semt=ais_hybrid&w=740'
          }
        }
      },
      contact
    };

    tenants[id] = newTenant;
    
    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: newTenant
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
});

app.put('/api/tenants/:id', validateTenantData, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, branding, contact } = req.body;

    if (!tenants[id]) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tenant not found'
      });
    }

    if (tenants[id].chatwoot.inboxId) {
      const updates = {};
      
      if (name !== tenants[id].name) {
        updates.name = `${name} Support`;
        updates.business_name = name;
        updates.welcome_title = `Welcome to ${name}`;
      }

      if (branding.colors.primary !== tenants[id].branding.colors.primary) {
        updates.channel = {
          ...updates.channel,
          widget_color: branding.colors.primary
        };
      }

      if (Object.keys(updates).length > 0) {
        await chatwootService.updateInbox(tenants[id].chatwoot.inboxId, updates);
      }
    }

    const updatedTenant = {
      ...tenants[id],
      name,
      branding,
      contact,
      chatwoot: {
        ...tenants[id].chatwoot,
        launcherTitle: `Chat with ${name} Support`
      }
    };

    tenants[id] = updatedTenant;
    
    res.json({
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
});

app.delete('/api/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'default') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cannot delete the default tenant'
      });
    }

    if (!tenants[id]) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Tenant not found'
      });
    }

    if (tenants[id].chatwoot.inboxId) {
      await chatwootService.deleteInbox(tenants[id].chatwoot.inboxId);
    }

    delete tenants[id];
    
    res.json({
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
});

const validateTenant = (req, res, next) => {
  const tenantId = req.params.id || req.query.tenant;
  if (!tenantId || !tenants[tenantId]) {
    return res.status(404).json({ 
      error: 'Tenant not found',
      message: 'The requested tenant does not exist'
    });
  }
  req.tenant = tenants[tenantId];
  next();
};

app.get('/api/tenants', (req, res) => {
  res.json(Object.values(tenants).map(({ id, name }) => ({ id, name })));
});

app.get('/api/tenants/:id', validateTenant, (req, res) => {
  res.json(req.tenant);
});

app.get('/api/validate-subdomain', (req, res) => {
  const subdomain = req.query.subdomain;
  const tenant = Object.values(tenants).find(t => t.id === subdomain);
  
  if (!tenant) {
    return res.status(404).json({
      error: 'Invalid subdomain',
      message: 'No tenant found for this subdomain'
    });
  }
  
  res.json({ 
    valid: true, 
    tenant: { id: tenant.id, name: tenant.name }
  });
});

app.get('/api/validate-tenant', (req, res) => {
  const { tenant, subdomain } = req.query;
  let tenantId = tenant;

  if (subdomain && subdomain !== 'localhost') {
    tenantId = subdomain;
  }

  if (!tenantId || !tenants[tenantId]) {
    return res.status(404).json({
      error: 'Invalid tenant',
      message: 'The requested tenant does not exist'
    });
  }

  res.json({
    valid: true,
    tenant: tenants[tenantId]
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Tenant service running on port ${PORT}`);
}); 