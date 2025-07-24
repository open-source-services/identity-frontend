export const getReturnUrl = () => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('return_url') || urlParams.get('redirect_uri') || urlParams.get('redirect_url');
};

export const setReturnUrl = (url) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('auth_return_url', url);
};

export const getStoredReturnUrl = () => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('auth_return_url');
};

export const clearReturnUrl = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_return_url');
};

export const redirectToReturnUrl = () => {
  const returnUrl = getStoredReturnUrl() || getReturnUrl();
  
  if (returnUrl) {
    clearReturnUrl();
    window.location.href = returnUrl;
    return true;
  }
  
  return false;
};

export const isValidReturnUrl = (url) => {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      return parsedUrl.hostname === 'localhost' || 
             parsedUrl.hostname.endsWith('.localhost') ||
             parsedUrl.hostname.endsWith('.mycompany.com');
    }
    
    // In production, only allow same domain or trusted subdomains
    const allowedHosts = [
      process.env.NEXT_PUBLIC_COMPANY_DOMAIN || 'mycompany.com'
    ];
    
    return allowedHosts.some(host => 
      parsedUrl.hostname === host || 
      parsedUrl.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
};

/**
 * Add redirect URL to API request data
 */
export const addRedirectToRequest = (data) => {
  const returnUrl = getStoredReturnUrl() || getReturnUrl();
  
  if (returnUrl && isValidReturnUrl(returnUrl)) {
    return {
      ...data,
      redirect_url: returnUrl
    };
  }
  
  return data;
};