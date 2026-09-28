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
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
