
import {
  ClerkMiddlewareAuth,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/site",
  "/api/uploadthing",
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
]);

const afterAuth = async (auth: ClerkMiddlewareAuth) => {
  // Handle afterAuth logic here
  const userId = (await auth()).userId;
  console.log("afterAuth logic", userId);
  return NextResponse.next();
};
export default clerkMiddleware(async (auth,request)=>{
   // Handle beforeAuth logic here
   const userId = (await auth()).userId;
   console.log("beforeAuth logic", userId);


  if(!isPublicRoute(request)){
    await auth.protect()
}
  // Call afterAuth function
  return afterAuth(auth);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};