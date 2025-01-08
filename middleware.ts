
import {
  ClerkMiddlewareAuth,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { hostname } from "os";

const isPublicRoute = createRouteMatcher([
  "/site",
  "/api/uploadthing",
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
]);

const afterAuth = async (auth: ClerkMiddlewareAuth,req: NextRequest) => {
  const userId = (await auth()).userId;
  console.log("afterAuth logic", userId);


//rewrite for domains
const url = req.nextUrl
const searchParams = url.searchParams.toString()
let hostname = req.headers

const pathWithSearchParams = `${url.pathname}${
  searchParams.length > 0 ? `?${searchParams}` : ''
}`

//if subdomain exists
const customSubDomain = hostname
  .get('host')
  ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
  .filter(Boolean)[0]

if (customSubDomain) {
  return NextResponse.rewrite(
    new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
  )
}

if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
  return NextResponse.redirect(new URL(`/agency/sign-in`, req.url))
}

if (
  url.pathname === '/' ||
  (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
) {
  return NextResponse.rewrite(new URL('/site', req.url))
}

if (
  url.pathname.startsWith('/agency') ||
  url.pathname.startsWith('/subaccount')
) {
  return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url))
}
// return NextResponse.next();

};
export default clerkMiddleware(async (auth, request) => {
  // Handle beforeAuth logic here
  const userId = (await auth()).userId;
  console.log("beforeAuth logic", userId);


  if (!isPublicRoute(request)) {
    await auth.protect()  
  }
  // Call afterAuth function
  return afterAuth(auth,request);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};