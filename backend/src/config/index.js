import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'colorido-2026-festival-secret-key-9921',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  email: {
    from: process.env.EMAIL_FROM || 'COLORIDO 26 <fest@colorido.college.edu>',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
  },
  clientUrl: process.env.CLIENT_URL || 'https://colorido2026-five.vercel.app',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyD-ALfshtHT1f_0uby_G9AI7gZII9c7TP8',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
};
