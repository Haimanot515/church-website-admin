import React, { useEffect, useRef } from "react";
import "./InfiniteScrollSentinel.css";

/**
 * Invisible marker placed under a list. When it scrolls into view and there is
 * more data, onLoadMore() is called. Shows `text` while more is loading.
 */
const InfiniteScrollSentinel = ({ hasMore, loading, onLoadMore, text = "Loading more..." }) => {
  const ref = useRef(null);
  const cbRef = useRef(onLoadMore);
  cbRef.current = onLoadMore;

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) cbRef.current && cbRef.current();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Re-observe after every load so a still-visible sentinel triggers the next page.
  }, [hasMore, loading]);

  if (!hasMore && !loading) return null;

  return (
    <div ref={ref} className="isl-sentinel" aria-live="polite">
      {loading ? text : ""}
    </div>
  );
};

export default InfiniteScrollSentinel;
