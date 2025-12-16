declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const trackPageView = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-989ZNCGXML', {
      page_path: url,
    });
  }
};

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackSignUp = () => {
  trackEvent('sign_up', {
    method: 'email',
  });
};

export const trackLogin = () => {
  trackEvent('login', {
    method: 'email',
  });
};

export const trackScan = (fileType: string) => {
  trackEvent('scan_file', {
    file_type: fileType,
  });
};

export const trackTokenPurchase = (amount: number) => {
  trackEvent('purchase', {
    currency: 'USD',
    value: amount,
    items: [
      {
        item_id: 'tokens',
        item_name: 'Scan Tokens',
      },
    ],
  });
};

export const trackGamePlay = () => {
  trackEvent('game_play');
};
