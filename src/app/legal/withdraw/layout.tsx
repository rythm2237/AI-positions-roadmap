import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Withdraw from a contract",
  description: "Online withdrawal function for eligible AI Career OS consumer contracts.",
  path: "/legal/withdraw",
});

export default function WithdrawLayout({ children }: { children: ReactNode }) {
  return children;
}
