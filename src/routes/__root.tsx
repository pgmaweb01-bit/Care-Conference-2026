import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth-context";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-gold/5 px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative max-w-md text-center animate-fade-in-up">
        <h1 className="font-display text-8xl font-black text-foreground">404</h1>
        <h2 className="mt-4 text-2xl font-extrabold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-gold/5 px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-destructive/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative max-w-md text-center animate-fade-in-up">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium shadow-sm transition-all hover:border-gold/30 hover:bg-gold/5 hover:text-gold-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Care Conference 2026 — Registration" },
      {
        name: "description",
        content:
          "Register for Care Conference 2026: Care as Infrastructure — Designing Nigeria's Next Decade of Homecare.",
      },
      { property: "og:title", content: "Care Conference 2026 — Registration" },
      {
        property: "og:description",
        content:
          "Register for Care Conference 2026: Care as Infrastructure — Designing Nigeria's Next Decade of Homecare.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Care Conference 2026 — Registration" },
      {
        name: "twitter:description",
        content:
          "Register for Care Conference 2026: Care as Infrastructure — Designing Nigeria's Next Decade of Homecare.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f5a92cc5-0f4f-45b3-9286-2258cf248e2b/id-preview-5249a2f7--f0ba3dd2-d697-4ab8-a4b5-f3fc24a69b47.lovable.app-1782151136908.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f5a92cc5-0f4f-45b3-9286-2258cf248e2b/id-preview-5249a2f7--f0ba3dd2-d697-4ab8-a4b5-f3fc24a69b47.lovable.app-1782151136908.png",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;700;800;900&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
