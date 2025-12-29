import type { AuthConfig } from 'convex/server';

// Our Clerk issuer domain public variable used at deploy time by convex
const domain = 'https://distinct-bedbug-71.clerk.accounts.dev';

export default {
  providers: [
    {
      domain,
      applicationID: 'convex'
    }
  ]
} satisfies AuthConfig;
