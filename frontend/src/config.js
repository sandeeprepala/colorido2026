export const APP_CONFIG = {
  PRODUCTION_DOMAIN: 'https://colorido2026-five.vercel.app',
  getRegistrationVerifyUrl: (token) => `https://colorido2026-five.vercel.app/registration/verify/${token}`,
  getCertificateVerifyUrl: (certId) => `https://colorido2026-five.vercel.app/certificate/verify/${certId}`,
};

export default APP_CONFIG;
