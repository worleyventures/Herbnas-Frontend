// Cookie utility functions
export const setCookie = (name, value, days = 7) => {
  // Check if value is valid
  if (!value || value === 'undefined' || value === 'null') {
    console.error('🍪 setCookie: Invalid value provided:', { name, value });
    return;
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  document.cookie = cookieString;
  
  console.log('🍪 setCookie debug:', {
    name,
    value: value ? value.substring(0, 20) + '...' : 'null',
    days,
    cookieString,
    allCookies: document.cookie
  });
};

export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  console.log('🍪 getCookie debug:', {
    name,
    allCookies: document.cookie,
    cookieArray: ca
  });
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      console.log('🍪 Found cookie:', { name, value: value.substring(0, 20) + '...' });
      return value;
    }
  }
  console.log('🍪 Cookie not found:', name);
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const clearAllCookies = () => {
  // Get all cookies and delete them
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    deleteCookie(name);
  }
};
