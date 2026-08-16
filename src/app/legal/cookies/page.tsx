import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import { legalLastUpdated } from "@/lib/legal";

export const metadata: Metadata = { title: "Cookie Notice" };

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Notice" intro={`Last updated: ${legalLastUpdated}. Non-essential analytics are disabled until you make an affirmative choice.`}>
      <h2>1. What we use</h2>
      <p>AI Career OS may use browser storage and cookies that are strictly necessary for authentication, security, session continuity and user-requested settings. These are required for the service to function and are not used for advertising.</p>

      <h2>2. Optional analytics</h2>
      <p>Google Analytics or Google Tag Manager may be enabled in Production. They are treated as optional analytics technologies and are not loaded unless you accept analytics in the consent banner. If you reject non-essential technologies, the platform remains usable without those analytics tags.</p>

      <h2>3. Consent record</h2>
      <p>Your analytics choice is stored locally in your browser so the platform can respect it on later visits. You may clear site storage in your browser to reset the choice. The site also exposes a cookie-settings event so a persistent settings control can reopen the consent interface.</p>

      <h2>4. Categories</h2>
      <ul>
        <li><strong>Strictly necessary:</strong> security, authentication/session, request routing and essential preferences.</li>
        <li><strong>Analytics:</strong> optional measurement of visits and product usage where consent has been granted.</li>
      </ul>

      <h2>5. Third parties</h2>
      <p>Where analytics is accepted, the relevant analytics provider may receive technical and usage data according to its own processing terms. The exact enabled tags must be kept aligned with this notice and the production tag-manager configuration.</p>

      <h2>6. Changing your choice</h2>
      <p>You can reject optional analytics when first prompted. A persistent “Cookie settings” control is provided in the site footer so you can reopen the consent interface and change your choice at any time.</p>
    </LegalShell>
  );
}
