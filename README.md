# Identity Frontend

A Next.js authentication service frontend designed for `accounts.mycompany.com`, providing centralized user authentication for multiple company products.

## Features

- **Dedicated Authentication Service**: Standalone auth service for company-wide SSO
- **Return URL Support**: Redirects users back to originating products after authentication
- **Email/Password Authentication**: Secure registration and login
- **OAuth Integration**: Google, GitHub, and Microsoft OAuth support
- **User Profile Management**: Profile editing and account management
- **JWT Token Management**: Automatic token refresh and secure storage
- **Role-Based Access Control**: Support for roles, permissions, and scopes
- **Heroicons UI**: Modern interface with Tailwind CSS v3.4.17

## Architecture

This app is designed to work as a centralized authentication service:

1. **Product Integration**: Other company products redirect to `accounts.mycompany.com` for authentication
2. **Return URL Handling**: After authentication, users are redirected back to the originating product
3. **Profile Access**: Direct access to `accounts.mycompany.com` shows user profile and account management
4. **Flexible Domains**: Works in development (`localhost`) and production (company domains)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Identity Service backend running

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure environment variables in `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Company domain for production redirect validation
NEXT_PUBLIC_COMPANY_DOMAIN=mycompany.com
```

### Running the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Usage

### Authentication Flow

#### From Another Product
1. Product redirects to `accounts.mycompany.com/signin?return_url=https://product.mycompany.com/dashboard`
2. User authenticates (signin/signup)
3. User is redirected back to the originating product with authentication

#### Direct Access
1. User visits `accounts.mycompany.com` directly
2. If authenticated: Shows profile/account management
3. If not authenticated: Redirects to signin page

### URL Patterns

- `/` - Root redirect (to signin or profile based on auth state)
- `/signin` - Sign in page with OAuth options
- `/signup` - Registration page with OAuth options
- `/profile` - User profile and account management (protected)
- `/oauth/[provider]/callback` - OAuth callback handler

### Return URL Integration

Products can integrate by redirecting to:
```
https://accounts.mycompany.com/signin?return_url=https://your-product.mycompany.com/callback
```

The auth service will:
1. Store the return URL securely
2. Authenticate the user
3. Redirect back to the return URL after successful auth

### Security

- **Return URL validation**: Only allows redirects to same domain or trusted subdomains
- **Secure token storage**: HTTP-only cookies with automatic refresh
- **CORS protection**: Configured for company domains
- **Input validation**: Form validation and sanitization

## Environment Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.mycompany.com/api/v1` |
| `NEXT_PUBLIC_COMPANY_DOMAIN` | Company domain for redirect validation | `mycompany.com` |

## Development vs Production

### Development
- Allows `localhost` and `*.localhost` redirects
- Uses local backend API
- Relaxed domain validation

### Production
- Strict domain validation (`*.mycompany.com`)
- Production backend API
- Secure cookie settings

## Integration Examples

### Product A redirecting to auth:
```javascript
// Redirect user to accounts for authentication
window.location.href = 'https://accounts.mycompany.com/signin?return_url=' + 
  encodeURIComponent('https://product-a.mycompany.com/dashboard');
```

### Handling return from auth:
```javascript
// On your product's callback page
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('authenticated') === 'true') {
  // User is now authenticated, proceed with your app
}
```