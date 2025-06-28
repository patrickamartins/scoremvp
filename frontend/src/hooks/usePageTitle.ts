import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `ScoreMVP | ${title}`;
  }, [title]);
} 