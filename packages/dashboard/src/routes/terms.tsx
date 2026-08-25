import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "#/components/LegalLayout.tsx";
import { getPublicConfig } from "#/server/fns/public.ts";

export const Route = createFileRoute("/terms")({
  loader: async () => ({ config: await getPublicConfig() }),
  component: Terms,
});

function Terms() {
  const { config } = Route.useLoaderData();

  return (
    <LegalLayout title="Terms of Service" updated="25 August 2026">
      <LegalSection title="Who we are">
        <p>
          This service is operated by Dominic Stilma (Headpat), Germany. By adding the bot to a
          Discord server, or by signing in to the dashboard, you agree to these terms. If you do not
          agree, remove the bot and stop using the dashboard.
        </p>
      </LegalSection>

      <LegalSection title="What the service does">
        <p>
          The bot relays direct messages between Discord users and the staff of a server, and the
          dashboard lets staff manage those conversations. You are responsible for configuring it
          appropriately for your server.
        </p>
      </LegalSection>

      <LegalSection title="Your responsibilities as a server operator">
        <p>
          If you add the bot to a server, you decide who on your staff can read tickets. You are
          responsible for telling your members that their messages are recorded and visible to your
          staff, for handling that data lawfully, and for responding to your members' privacy
          requests.
        </p>
        <p>
          You must not use the service to collect data you have no right to collect, or in a way
          that breaches the Discord Terms of Service or Community Guidelines.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <p>
          use the service for harassment, abuse, or unlawful purposes; attempt to gain access to
          tickets, servers or accounts you are not authorised to see; interfere with or overload the
          infrastructure, including automated scraping or excessive request volume; or attempt to
          circumvent blocks, rate limits, or access controls.
        </p>
        <p>
          We may suspend or remove access to the service where these terms are breached, without
          notice where the breach is serious.
        </p>
      </LegalSection>

      <LegalSection title="Availability and warranty">
        <p>
          The service is provided as is and as available, without warranty of any kind. We do not
          guarantee uptime, that messages will always be delivered, or that data will never be lost.
          You should not rely on it as the sole record of anything important.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          To the extent permitted by law, we are not liable for indirect or consequential damage, or
          for loss of data or profit arising from use of the service. Nothing in these terms
          excludes liability for intent or gross negligence, for injury to life, body or health, or
          any other liability that cannot lawfully be excluded under German law.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You may stop using the service at any time by removing the bot from your server. We may
          discontinue the service, or withdraw access to it, at any time.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the law of the Federal Republic of Germany. Mandatory consumer
          protection rules of your country of residence remain unaffected.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms can be raised through the{" "}
          {config.supportUrl ? (
            <a href={config.supportUrl} className="text-accent hover:underline">
              support server
            </a>
          ) : (
            "support server"
          )}
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
