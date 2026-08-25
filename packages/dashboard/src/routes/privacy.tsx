import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "#/components/LegalLayout.tsx";
import { getPublicConfig } from "#/server/fns/public.ts";

export const Route = createFileRoute("/privacy")({
  loader: async () => ({ config: await getPublicConfig() }),
  component: Privacy,
});

function Privacy() {
  const { config } = Route.useLoaderData();

  return (
    <LegalLayout title="Privacy Policy" updated="25 August 2026">
      <LegalSection title="Who is responsible">
        <p>
          This service is operated by Dominic Stilma (Headpat), Germany. For any privacy request,
          contact us through the{" "}
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

      <LegalSection title="What we collect">
        <p>
          <span className="text-text">Account data.</span> When you sign in with Discord we store
          your Discord user ID, username, email address and avatar URL, together with the OAuth
          access and refresh tokens needed to keep you signed in and to read the list of servers you
          manage.
        </p>
        <p>
          <span className="text-text">Session data.</span> Each active session records its IP
          address and browser user agent so sessions can be identified and revoked.
        </p>
        <p>
          <span className="text-text">Ticket data.</span> When a user opens a ticket we store their
          Discord user ID, the full content of the messages exchanged, the display name and avatar
          shown on each message, links to any attachments, and timestamps. Internal staff notes are
          stored the same way and are never shown to the user who opened the ticket.
        </p>
        <p>
          <span className="text-text">Moderation data.</span> Blocks (with any reason and expiry),
          staff assignments, tags and an audit log of administrative actions taken in a server.
        </p>
        <p>We do not use tracking cookies, advertising, or third-party analytics.</p>
      </LegalSection>

      <LegalSection title="Why we process it">
        <p>
          Account and session data is processed to authenticate you and to determine which servers
          you may manage. Ticket and moderation data is processed to provide the support inbox
          itself. The legal basis is performance of a contract (Art. 6(1)(b) GDPR) for operating the
          service, and legitimate interest (Art. 6(1)(f) GDPR) in keeping an audit trail and
          preventing abuse.
        </p>
      </LegalSection>

      <LegalSection title="Who controls your ticket data">
        <p>
          Each Discord server operates its own inbox. The staff of the server you contact decide who
          may read your tickets, how long they keep them, and what they do with them. For anything
          concerning the content of a specific ticket, contact that server's staff. We act as a
          processor on their behalf for that data.
        </p>
      </LegalSection>

      <LegalSection title="Where it is stored and who else sees it">
        <p>
          Data is stored in a PostgreSQL database on servers we operate in Germany. It is not sold,
          rented, or shared for marketing.
        </p>
        <p>
          Two third parties necessarily see data in transit: Discord, which delivers every message
          and provides your account details, under its own privacy policy; and Cloudflare, which
          proxies traffic to the dashboard and processes connection metadata.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          Tickets and their messages are retained until the server that owns them deletes them, or
          until the bot is removed from that server. Sessions expire automatically. Removing the bot
          from a server, or asking us to delete your account, removes the associated records.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Under the GDPR you may request access to your data, correction of inaccurate data,
          erasure, restriction of processing, portability, and you may object to processing based on
          legitimate interest. Contact us through the support server and we will respond within one
          month.
        </p>
        <p>
          You also have the right to lodge a complaint with a supervisory authority in the EU member
          state where you live or work.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Discord requires users to be at least 13, and older in some countries. This service is not
          directed at anyone below the minimum age for their country.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy as the service changes. The date above always reflects the
          current version.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
