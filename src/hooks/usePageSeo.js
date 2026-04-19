import { useEffect } from "react";

export function usePageSeo({
  title,
  description,
  keywords,
  canonicalPath = "",
  image = "/favicon.svg"
}) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionNode = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionNode?.getAttribute("content") || "";
    const keywordsNode = document.querySelector('meta[name="keywords"]');
    const previousKeywords = keywordsNode?.getAttribute("content") || "";
    const ogTitleNode = document.querySelector('meta[property="og:title"]');
    const ogDescriptionNode = document.querySelector('meta[property="og:description"]');
    const ogImageNode = document.querySelector('meta[property="og:image"]');
    const twitterTitleNode = document.querySelector('meta[name="twitter:title"]');
    const twitterDescriptionNode = document.querySelector('meta[name="twitter:description"]');
    const twitterImageNode = document.querySelector('meta[name="twitter:image"]');
    const canonicalNode = document.querySelector('link[rel="canonical"]');

    const previousOgTitle = ogTitleNode?.getAttribute("content") || "";
    const previousOgDescription = ogDescriptionNode?.getAttribute("content") || "";
    const previousOgImage = ogImageNode?.getAttribute("content") || "";
    const previousTwitterTitle = twitterTitleNode?.getAttribute("content") || "";
    const previousTwitterDescription = twitterDescriptionNode?.getAttribute("content") || "";
    const previousTwitterImage = twitterImageNode?.getAttribute("content") || "";
    const previousCanonical = canonicalNode?.getAttribute("href") || "";

    const canonicalUrl = canonicalNode && canonicalPath
      ? new URL(canonicalPath, window.location.origin).toString()
      : "";
    const imageUrl = image ? new URL(image, window.location.origin).toString() : "";

    if (title) document.title = title;
    if (descriptionNode && description) descriptionNode.setAttribute("content", description);
    if (keywordsNode && keywords) keywordsNode.setAttribute("content", keywords);
    if (ogTitleNode && title) ogTitleNode.setAttribute("content", title);
    if (ogDescriptionNode && description) ogDescriptionNode.setAttribute("content", description);
    if (ogImageNode && imageUrl) ogImageNode.setAttribute("content", imageUrl);
    if (twitterTitleNode && title) twitterTitleNode.setAttribute("content", title);
    if (twitterDescriptionNode && description) twitterDescriptionNode.setAttribute("content", description);
    if (twitterImageNode && imageUrl) twitterImageNode.setAttribute("content", imageUrl);
    if (canonicalNode && canonicalUrl) canonicalNode.setAttribute("href", canonicalUrl);

    return () => {
      document.title = previousTitle;
      if (descriptionNode) descriptionNode.setAttribute("content", previousDescription);
      if (keywordsNode) keywordsNode.setAttribute("content", previousKeywords);
      if (ogTitleNode) ogTitleNode.setAttribute("content", previousOgTitle);
      if (ogDescriptionNode) ogDescriptionNode.setAttribute("content", previousOgDescription);
      if (ogImageNode) ogImageNode.setAttribute("content", previousOgImage);
      if (twitterTitleNode) twitterTitleNode.setAttribute("content", previousTwitterTitle);
      if (twitterDescriptionNode) twitterDescriptionNode.setAttribute("content", previousTwitterDescription);
      if (twitterImageNode) twitterImageNode.setAttribute("content", previousTwitterImage);
      if (canonicalNode) canonicalNode.setAttribute("href", previousCanonical);
    };
  }, [canonicalPath, description, image, keywords, title]);
}
