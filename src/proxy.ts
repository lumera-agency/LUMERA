import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // everything but the API, Next internals, files with an extension and the static AI pages
  // (public/ai-avtomatyzatsiia, public/keisy: plain HTML with their own UA/RU switch, see next.config.ts)
  matcher: "/((?!api|_next|_vercel|ai-avtomatyzatsiia|keisy|.*\\..*).*)",
};
