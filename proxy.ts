import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse
} from 'next/server';

// Define protected routes with the route matcher utility
const protectedRoutes = createRouteMatcher(['/dashboard(.*)']);

const clerk = clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};

const middleware = (req: NextRequest, event: NextFetchEvent) => {
  // Used for the test suite
  if (process.env.MOCK_AUTH === '1') {
    return NextResponse.next();
  }
  return clerk(req, event);
};

export default middleware;
