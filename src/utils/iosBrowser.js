export const isIosBrowser = () => {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(userAgent)) return true;

  // iPadOS desktop mode reports as a Mac, but still has a touch screen.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
};

// Mobile browsers, especially iOS, open the Google popup as a new tab and
// drop the result before this page can finish sign-in.
export const prefersRedirectGoogleLogin = () => {
  if (isIosBrowser()) return true;
  if (typeof navigator === 'undefined') return false;

  return /Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent || '',
  );
};
