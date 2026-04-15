import { useEffect } from "react";

export function usePageSeo({
  title,
  description
}) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionNode = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionNode?.getAttribute("content") || "";

    if (title) document.title = title;
    if (descriptionNode && description) descriptionNode.setAttribute("content", description);

    return () => {
      document.title = previousTitle;
      if (descriptionNode) descriptionNode.setAttribute("content", previousDescription);
    };
  }, [description, title]);
}
