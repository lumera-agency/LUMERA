import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // everything but the API, Next internals, files with an extension and the share pictures (/uk/…/opengraph-image is
  // their own address: the default locale's prefix is not redirected away there)
  matcher: "/((?!api|_next|_vercel|.*opengraph-image|.*\\..*).*)",
};
