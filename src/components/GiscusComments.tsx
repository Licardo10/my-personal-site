"use client";

import { useEffect, useRef } from "react";

interface Props {
  term?: string;
}

export default function GiscusComments({ term }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || container.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "Licardo10/my-personal-site");
    script.setAttribute("data-repo-id", "REPO_ID_PLACEHOLDER");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "CATEGORY_ID_PLACEHOLDER");
    script.setAttribute("data-mapping", term ? "specific" : "pathname");
    script.setAttribute("data-term", term || "");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "dark_dimmed");
    script.setAttribute("data-lang", "zh-CN");
    container.appendChild(script);
  }, [term]);

  return <div ref={ref} className="mt-16" />;
}
