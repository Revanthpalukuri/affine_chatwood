# Chatwoot & Affine Integration with White Labelling

This project integrates Chatwoot (customer support chat) with Affine (workspace tool) while supporting multi-tenant white labelling capabilities.

## Quick Start

For faster setup, we're kept our Chatwoot credentials in codebase. These are temporary and should be replaced in production.

## create .env file in docker/affine 

with these variables 

AFFINE_ADMIN_EMAIL=your-email

AFFINE_ADMIN_PASSWORD= your-password

CHATWOOT_SECRET_KEY_BASE=your-secret-key

## Running the Services

### 1. Frontend Application
```bash

# install required packages
npm i

# In the root directory
npm start
```

### 2. Backend Server
```bash
# Navigate to backend directory
cd backend

# install required packages
npm i

# install express
npm i express

# Start backend server
node src/index.js
```

### 3. Affine Workspace (Docker) 
```bash
# Navigate to affine directory
cd docker/affine

# Start Affine service
docker compose up -d

# To stop Affine service
docker compose down
```



The services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Affine Workspace: http://localhost:3010

## Adding a New Tenant

You can add a new tenant using the API endpoint. Here's a curl command example:

```bash
curl -X POST http://localhost:4000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "id": "atlassian",
    "name": "Atlassian",
    "branding": {
      "logo": "https://shorturl.at/l8fD5",
      "colors": {
        "primary": "#0052CC"
      },
      "theme": "corporate-professional"
    },
    "contact": {
      "email": "support@atlassian.com",
      "phone": "+1-555-0127",
      "address": "341 George Street, Sydney"
    }
  }'
```

## White Labelling System

The white labelling system supports multiple aspects of customization:

### 1. Themes
Four pre-built themes are available:
- `modern-minimalist`: Clean, modern design with Inter font
- `corporate-professional`: Professional look with Roboto font
- `tech-forward`: Technical aesthetic with JetBrains Mono font
- `creative-studio`: Creative design with Playfair Display font

### 2. Branding Elements
Each tenant can customize:
- Logo
- Primary color
- Theme selection
- Typography
- Favicon
- Page title

### 3. Chatwoot Integration
Tenant-specific Chatwoot configuration includes:
- Custom launcher title
- Branded widget colors
- Pre-chat form
- Working hours
- Greeting messages
- CSAT surveys
- Many of these things are hardcoded as of now but we can make it configurable

### 4. URL-Based Tenant Detection
The system supports two methods of tenant identification:
1. URL Parameter: `http://localhost:3000?tenant=atlassian`


### 5. Dynamic Styling
The system automatically:
- Loads tenant-specific fonts
- Applies custom color schemes
- Updates UI components
- Manages theme transitions
- Handles responsive design

### 6. Default Tenant
A default tenant is always available at:
- http://localhost:3000
- http://localhost:3000/?tenant=default

## Project Structure
```
chatwoot-aviyel/
├── backend/           # Node.js backend service
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── controllers/ # API controllers
│   │   ├── services/ # Business logic
│   │   └── data/     # Tenant data
├── src/              # React frontend
│   ├── components/   # React components
│   ├── context/      # React context
│   ├── hooks/        # Custom hooks
│   └── styles/       # CSS styles
└── docker/           # Docker configuration
    └── affine/       # Affine service setup
```

## Important Notes for Hackathon

1. We're using shared Chatwoot credentials for faster development
2. Each service runs independently:
   - Affine runs in Docker
   - Backend runs with Node.js
   - Frontend runs with npm
3. No need to set up individual Chatwoot accounts for testing
4. The system is configured for quick development and testing

## Production Considerations

For a production environment:
1. Each tenant should have their own Chatwoot account
2. Implement proper authentication and authorization
3. Use secure environment variables
4. Set up proper monitoring and logging
5. Implement proper error handling
6. Add rate limiting and security measures

## API Endpoints

### Tenant Management
- `POST /api/tenants` - Create new tenant
- `GET /api/tenants` - List all tenants
- `GET /api/tenants/:id` - Get tenant details
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Tenant Validation
- `GET /api/validate-tenant?tenant=:id` - Validate tenant by ID
- `GET /api/validate-subdomain?subdomain=:name` - Validate tenant by subdomain

### Chatwoot Integration
- `GET /api/chatwoot/inboxes/:id` - Get inbox details
- `PUT /api/chatwoot/inboxes/:id` - Update inbox
- `DELETE /api/chatwoot/inboxes/:id` - Delete inbox

## Tenant Access

The application supports multi-tenant access through URL parameters. Each tenant has its own isolated workspace.

### Default Tenant
- URL: `http://localhost:3000?tenant=default`
- This is the default workspace that users see when no tenant is specified.

### Available Tenants
The following tenant workspaces are available:
- Atlassian: `http://localhost:3000?tenant=atlassian`
- Acme: `http://localhost:3000?tenant=acme`
- Nexus: `http://localhost:3000?tenant=nexus`
- Harmony: `http://localhost:3000?tenant=harmony`

### Tenant Not Found
If you try to access a non-existent tenant (e.g., `http://localhost:3000?tenant=unknown`), the system will display a "Tenant not found" error page.
