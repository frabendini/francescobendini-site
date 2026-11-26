/* Progressive enhancement for the static portfolio. */
(() => {
  const script = document.currentScript;
  const root = new URL(".", script.src);
  const routes = new Set(["", "about/", "statement/", "portrait/", "work-work-work/"].map(path => new URL(path, root).pathname));
  const main = document.querySelector("main.layout");
  const header = main?.querySelector("header");
  const title = header?.querySelector(".artist-title");
  if (!main || !header || !title || !window.fetch || !history.pushState || !routes.has(location.pathname)) return;
  const stateKey = "__portfolioScroll";
  const cache = new Map();
  let activeUrl = location.href, serial = 0, pending = false, scrollFrame = 0, prefetchTimer = 0;
  let animation;
  function eligible(url) {
    return url.origin === root.origin && routes.has(url.pathname) && !url.search && !url.hash;
  }
  function linkUrl(a) {
    if (!a || !a.hasAttribute("href") || a.hasAttribute("download") || (a.target && a.target !== "_self")) return null;
    const url = new URL(a.href, location.href);
    return eligible(url) && url.href !== activeUrl ? url : null;
  }
  function rememberScroll() {
    if (pending || location.href !== activeUrl) return;
    history.replaceState({...history.state, [stateKey]: [scrollX, scrollY]}, "", location.href);
  }
  history.scrollRestoration = "manual";
  rememberScroll();
  addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; rememberScroll(); });
  }, {passive: true});
  function load(url) {
    const key = url.href;
    const existing = cache.get(key);
    if (existing && Date.now() - existing.time < 30000) return existing.promise;
    const promise = fetch(key, {credentials: "same-origin", headers: {"Accept": "text/html"}}).then(async response => {
      if (!response.ok || !response.headers.get("content-type")?.includes("text/html") || !eligible(new URL(response.url))) throw Error("Page unavailable");
      const doc = new DOMParser().parseFromString(await response.text(), "text/html");
      const layout = doc.querySelector("main.layout");
      if (!layout?.querySelector("header .artist-title") || !doc.querySelector("#floating-sculpture") || !doc.querySelector('script[src$="navigation.js"]')) throw Error("Unsupported page layout");
      return {doc, layout, url: new URL(response.url)};
    }).catch(error => { cache.delete(key); throw error; });
    cache.set(key, {time: Date.now(), promise});
    return promise;
  }
  function cloneContent(node, base) {
    const copy = document.importNode(node, true);
    if (copy.nodeType === 1) {
      for (const el of [copy, ...copy.querySelectorAll("[href], [src]")]) {
        for (const attr of ["href", "src"]) {
          if (el.hasAttribute(attr)) el.setAttribute(attr, new URL(el.getAttribute(attr), base).href);
        }
      }
    }
    return copy;
  }
  async function navigate(url, {pop = false, position = [0, 0], keyboard = false} = {}) {
    const id = ++serial;
    if (!pop) rememberScroll();
    pending = true;
    try {
      const {doc, layout, url: dest} = await load(url);
      if (id !== serial) return;
      const nextHeader = layout.querySelector("header");
      const nextTitle = nextHeader.querySelector(".artist-title");
      const headerNodes = [...nextHeader.childNodes].filter(n => n !== nextTitle).map(n => cloneContent(n, dest));
      const bodyNodes = [...layout.childNodes].filter(n => n !== nextHeader).map(n => cloneContent(n, dest));
      if (!pop) history.pushState({[stateKey]: [0, 0]}, "", dest.href);
      activeUrl = location.href;
      title.href = new URL(nextTitle.getAttribute("href"), dest).href;
      for (const n of [...header.childNodes]) if (n !== title) n.remove();
      header.append(...headerNodes);
      for (const n of [...main.childNodes]) if (n !== header) n.remove();
      main.append(...bodyNodes);
      document.title = doc.title;
      document.documentElement.lang = doc.documentElement.lang;
      const nextDescription = doc.querySelector('meta[name="description"]');
      const oldDescription = document.querySelector('meta[name="description"]');
      if (nextDescription) {
        if (oldDescription) oldDescription.content = nextDescription.content;
        else document.head.append(document.importNode(nextDescription, true));
      } else oldDescription?.remove();
      if (keyboard) { main.setAttribute("tabindex", "-1"); main.focus({preventScroll: true}); }
      window.scrollTo({left: position[0], top: position[1], behavior: "instant"});
      animation?.forEach(a => a.cancel());
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches && typeof Element.prototype.animate === "function") {
        animation = [...header.children, ...main.children].filter(el => el !== title && el !== header).map(el => el.animate([{opacity: 0.25}, {opacity: 1}], {duration: 160, easing: "ease-out"}));
      }
      pending = false;
      rememberScroll();
    } catch (error) {
      if (id !== serial) return;
      pending = false;
      if (pop) location.reload();
      else location.assign(url.href);
    }
  }
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = linkUrl(event.target.closest("a[href]"));
    if (!url) return;
    event.preventDefault();
    navigate(url, {keyboard: event.detail === 0});
  });
  document.addEventListener("pointerover", event => {
    if (event.pointerType === "touch" || navigator.connection?.saveData) return;
    const url = linkUrl(event.target.closest("a[href]"));
    clearTimeout(prefetchTimer);
    if (url) prefetchTimer = setTimeout(() => load(url).catch(() => {}), 100);
  });
  addEventListener("popstate", event => {
    const url = new URL(location.href);
    if (!eligible(url)) { location.reload(); return; }
    navigate(url, {pop: true, position: event.state?.[stateKey] || [0, 0]});
  });
})();
