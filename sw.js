/*
 * EveryNickel service worker: caches the app shell so the PWA is installable
 * and opens offline. Data is never cached here — it is live over the Convex
 * websocket (cross-origin requests are ignored).
 *
 * - Navigations: network-first, falling back to the cached SPA shell.
 * - Same-origin static assets (hashed JS bundles, fonts, icons): cache-first,
 *   precached at install (list injected at build time) and on first use.
 *
 * Each production build gets a new CACHE_VERSION, which drops old caches.
 */
// Both placeholders are replaced at build time by scripts/inject-sw-manifest.mjs
// with a content hash and the list of exported bundles/fonts/icons.
const CACHE_VERSION = "c9646a5ad1c2";
const BUILD_ASSETS = ["/_expo/static/js/web/[id]-101614f90e5f67302e06f0c00ec5b7f4.js","/_expo/static/js/web/[id]-7a8f9b06498a48061e5378cefd2eb124.js","/_expo/static/js/web/[id]-b723100699d42594d3b085739bc78a25.js","/_expo/static/js/web/[id]-de69178516e1f425a22d77dcaf78cf29.js","/_expo/static/js/web/__common-e47c6f056e146129a5051085990e88d0.js","/_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js","/_expo/static/js/web/_layout-53197bb3af557a0d39a3f54adf24111b.js","/_expo/static/js/web/_layout-77312cebd50a73703018ca7b0bc30d6f.js","/_expo/static/js/web/_layout-9dd938e60d9bdd9f4b191b69970e880e.js","/_expo/static/js/web/accounts-72ba0ffe55624ac897e70da6e9001aff.js","/_expo/static/js/web/deleted-33e6a465bc41046ece7b319088fbb5a2.js","/_expo/static/js/web/entry-81b72f1f558582a8554afe9cef229fb6.js","/_expo/static/js/web/index-f1c2e0619a5df43f9170e6e2a3fe4b2c.js","/_expo/static/js/web/new-f69e8dbf8ab7e01b41a283904fe30ac7.js","/_expo/static/js/web/sign-in-7e35ad50319af9935ed86056f3d2adf4.js","/_expo/static/js/web/transactions-34c79c5ac8df16d3a3dd8cb3cea59dca.js","/assets/__node_modules/.pnpm/@expo+vector-icons@15.1.1_expo-font@58.0.12_expo@58.0.26_react-native@0.88.1_@babel+cor_ea9f8ed8ab01ca891cdf3bed02feb0b3/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","/assets/__node_modules/.pnpm/@expo+vector-icons@15.1.1_expo-font@58.0.12_expo@58.0.26_react-native@0.88.1_@babel+cor_ea9f8ed8ab01ca891cdf3bed02feb0b3/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","/assets/__node_modules/.pnpm/expo-router@58.0.32_cbed0c92c7c703875802fdcf3cbb0c70/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","/favicon.ico","/icons/apple-touch-icon.png","/icons/icon-192.png","/icons/icon-512.png","/icons/maskable-192.png","/icons/maskable-512.png","/manifest.json"];
const CACHE_NAME = `everynickel-shell-${CACHE_VERSION}`;
// Static hosts often redirect /index.html -> /, so the shell is keyed on "/".
const SHELL_URL = "/";
const PRECACHE_URLS = [
  SHELL_URL,
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/** Browsers refuse redirected responses for navigations; strip the redirect. */
function unredirect(response) {
  if (!response.redirected) return Promise.resolve(response);
  return response.blob().then(
    (body) =>
      new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }),
  );
}

function precache(cache, url) {
  return fetch(new Request(url, { cache: "reload" }))
    .then((response) => {
      if (!response.ok) return undefined;
      return unredirect(response).then((clean) => cache.put(url, clean));
    })
    .catch(() => undefined);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all([...PRECACHE_URLS, ...BUILD_ASSETS].map((url) => precache(cache, url))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("everynickel-shell-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const STATIC_DESTINATIONS = new Set(["script", "style", "font", "image", "manifest"]);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Every route serves the same SPA shell; keep the freshest copy.
          if (response.ok) {
            const copy = response.clone();
            unredirect(copy).then((clean) =>
              caches.open(CACHE_NAME).then((cache) => cache.put(SHELL_URL, clean)),
            );
          }
          return response;
        })
        .catch(() =>
          caches
            .match(SHELL_URL)
            .then((cached) => (cached ? unredirect(cached) : Response.error())),
        ),
    );
    return;
  }

  // Only cache static build assets. Anything else (auth, API, data) always
  // goes to the network so the cache can never serve stale or private data.
  if (!STATIC_DESTINATIONS.has(request.destination)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
