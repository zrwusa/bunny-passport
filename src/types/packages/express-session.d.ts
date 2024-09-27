import 'express-session';

// Extend the Session type to include the redirect_uri attribute
declare module 'express-session' {
  interface Session {
    redirect_uri?: string;
  }
}
