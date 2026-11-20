import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the top on page change, or to the #section when the URL has a hash
 * (e.g. /#knowledge clicked from another page).
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
