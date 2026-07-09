import { createMemoryStorage } from "@hogsend/js";
import { FeedPopover, HogsendProvider, NotificationBell } from "@hogsend/react";
import "@hogsend/react/styles.css";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

/**
 * The notification-bell ISLAND for the demo landing page. The landing is a
 * server-rendered HTML string (no React app), so the bell ships as this
 * self-contained browser bundle (tsup → /assets/demo-bell.js, styles
 * inlined): it finds `#hs-bell-root`, reads the dogfood engine URL + `pk_`
 * key from its data attributes, and mounts the same provider + bell the docs
 * and course navs use — pointed at the SAME dogfood engine, so a feed item a
 * journey sends to this visitor shows up here too.
 *
 * Identity mirrors the docs pattern: a `*.hogsend.com` SSO session (checked
 * at /api/sso/get-session) mints a server-side feed userToken via
 * /api/demo/hogsend-token — the bell then polls the contact's CANONICAL feed
 * key. Signed out it runs anonymous. Storage is MEMORY-ONLY either way
 * (course model): the bell persists no id in the browser, which is what lets
 * the /cookies page say "a sign-in cookie, and nothing else".
 */

type FeedIdentity = { token: string; userId: string };

async function fetchFeedIdentity(): Promise<FeedIdentity | null> {
  try {
    const res = await fetch("/api/demo/hogsend-token", { method: "POST" });
    if (!res.ok) return null;
    const body = (await res.json()) as { token?: unknown; userId?: unknown };
    if (typeof body.token !== "string" || typeof body.userId !== "string") {
      return null;
    }
    return { token: body.token, userId: body.userId };
  } catch {
    return null;
  }
}

async function hasSsoSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/sso/get-session", {
      credentials: "include",
    });
    if (!res.ok) return false;
    const body = (await res.json().catch(() => null)) as {
      user?: unknown;
    } | null;
    return Boolean(body?.user);
  } catch {
    return false;
  }
}

function Island({
  apiUrl,
  publishableKey,
}: {
  apiUrl: string;
  publishableKey: string;
}): ReactNode {
  const [identity, setIdentity] = useState<FeedIdentity | null>(null);
  const [storage] = useState(createMemoryStorage);

  useEffect(() => {
    let alive = true;
    void hasSsoSession().then(async (signedIn) => {
      if (!signedIn || !alive) return;
      const id = await fetchFeedIdentity();
      if (alive) setIdentity(id);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <HogsendProvider
      // The provider constructs its client ONCE, so identity arriving after
      // the session check must remount it (same fix as the docs provider).
      key={identity ? `user:${identity.userId}` : "anon"}
      apiUrl={apiUrl}
      publishableKey={publishableKey}
      colorMode="dark"
      storage={storage}
      onUserTokenExpiring={async () => (await fetchFeedIdentity())?.token ?? ""}
      {...(identity
        ? { userId: identity.userId, userToken: identity.token }
        : {})}
    >
      <Bell />
    </HogsendProvider>
  );
}

const POPOVER_ID = "hs-demo-feed";

function Bell(): ReactNode {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    // Positioned wrapper: FeedPopover anchors to its nearest positioned
    // ancestor, and the landing nav has room below-right of the bell.
    <span style={{ position: "relative", display: "inline-flex" }}>
      <NotificationBell
        ref={buttonRef}
        isOpen={open}
        popoverId={POPOVER_ID}
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        badgeCountType="unread"
      />
      <FeedPopover
        id={POPOVER_ID}
        isVisible={open}
        onClose={() => setOpen(false)}
        buttonRef={buttonRef}
        placement="bottom-end"
        renderEmpty={() => (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              No notifications yet.
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Enter the demo — the journeys in there send real ones.
            </p>
          </div>
        )}
      />
    </span>
  );
}

const root = document.getElementById("hs-bell-root");
const apiUrl = root?.dataset.apiUrl ?? "";
const publishableKey = root?.dataset.pk ?? "";
if (root && apiUrl && publishableKey.startsWith("pk_")) {
  createRoot(root).render(
    <Island apiUrl={apiUrl} publishableKey={publishableKey} />,
  );
}
