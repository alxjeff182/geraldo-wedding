import { useContext } from "react";
import { WeddingContentContext } from "./wedding-content-context";

export function useWeddingContent() {
  return useContext(WeddingContentContext);
}
