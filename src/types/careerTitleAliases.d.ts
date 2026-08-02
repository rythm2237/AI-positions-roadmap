import type { CareerTitleAlias } from "@/data/careerTitleAliases";

declare module "@/types/careerWorkspace" {
  interface CareerWorkspaceData {
    /**
     * Alternative job titles that resolve to this canonical career.
     * Admin-created careers should provide at least one alias.
     */
    titleAliases?: CareerTitleAlias[];
  }
}

export {};
