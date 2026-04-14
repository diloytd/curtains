/**
 * Блокирует переходы по ссылкам на другие origin (в т.ч. на оригинальный karniz.ru).
 * Относительные и якорные ссылки на текущем зеркале работают как раньше.
 */
const isExternalHttpNavigation = (hrefAttr: string): boolean => {
  const trimmed = hrefAttr.trim();
  if (!trimmed || trimmed.startsWith("#")) return false;
  try {
    const url = new URL(trimmed, window.location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
};

const handleLinkActivation = (e: Event): void => {
  const t = e.target;
  if (!(t instanceof Element)) return;
  const anchor = t.closest("a[href]");
  if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
  const href = anchor.getAttribute("href");
  if (href === null) return;
  if (!isExternalHttpNavigation(href)) return;
  e.preventDefault();
  e.stopPropagation();
};

const handleAuxClick = (e: MouseEvent): void => {
  if (e.button !== 1) return;
  handleLinkActivation(e);
};

document.addEventListener("click", handleLinkActivation, true);
document.addEventListener("auxclick", handleAuxClick, true);
