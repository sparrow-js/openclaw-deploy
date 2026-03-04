import { auth } from "auth"
import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/login') {
    const session = await auth();

    if (session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  return NextResponse.next();
}
