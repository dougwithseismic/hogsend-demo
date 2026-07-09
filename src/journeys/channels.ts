import { sendConnectorAction } from "@hogsend/engine";
import type {
  DmMemberArgs,
  GrantRoleArgs,
  SendChannelMessageArgs,
} from "@hogsend/plugin-discord";
import type { DmArgs } from "@hogsend/plugin-telegram";

/**
 * Multi-channel outbound helpers for the Forgeline journeys — Discord + Telegram
 * on top of `sendConnectorAction`. Channel / guild / role ids come from env and
 * default to "" when unset, so an un-provisioned demo stays fully inert: the
 * connector actions SOFT-FAIL on an empty/unresolved id (no throw, nothing
 * leaves). Real delivery history lives in the seeded `connector_deliveries`.
 *
 * DM recipients are passed as the contact's email/external id — the actions
 * resolve that to a `discord_id` / Telegram chat id at run time.
 */

const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID ?? "";
const DISCORD_NEW_WORKSPACES_CHANNEL_ID =
  process.env.DISCORD_NEW_WORKSPACES_CHANNEL_ID ?? "";
const DISCORD_WINS_CHANNEL_ID = process.env.DISCORD_WINS_CHANNEL_ID ?? "";
const DISCORD_POWER_TEAM_ROLE_ID = process.env.DISCORD_POWER_TEAM_ROLE_ID ?? "";

/** Post to a Discord channel by id (no-op when the channel id is unset). */
export async function postToDiscordChannel(
  channelId: string,
  content: string,
): Promise<void> {
  if (!channelId) return;
  await sendConnectorAction({
    connectorId: "discord",
    action: "sendChannelMessage",
    args: { channelId, content } satisfies SendChannelMessageArgs,
  });
}

/** Announce a new workspace in the Discord #new-workspaces channel. */
export async function announceNewWorkspace(content: string): Promise<void> {
  await postToDiscordChannel(DISCORD_NEW_WORKSPACES_CHANNEL_ID, content);
}

/** Post a win in the Discord #wins channel. */
export async function postWin(content: string): Promise<void> {
  await postToDiscordChannel(DISCORD_WINS_CHANNEL_ID, content);
}

/** DM a member on Discord (resolved contact → discord_id; soft-fails on closed DMs). */
export async function dmDiscord(
  member: string,
  content: string,
): Promise<void> {
  await sendConnectorAction({
    connectorId: "discord",
    action: "dmMember",
    args: { member, content } satisfies DmMemberArgs,
  });
}

/** Grant the "power-team" Discord role (no-op when guild/role ids are unset). */
export async function grantPowerTeamRole(member: string): Promise<void> {
  if (!DISCORD_GUILD_ID || !DISCORD_POWER_TEAM_ROLE_ID) return;
  await sendConnectorAction({
    connectorId: "discord",
    action: "grantRole",
    args: {
      guildId: DISCORD_GUILD_ID,
      member,
      roleId: DISCORD_POWER_TEAM_ROLE_ID,
    } satisfies GrantRoleArgs,
  });
}

/** DM a contact on Telegram (resolved contact → chat id; soft-fails when unlinked). */
export async function dmTelegram(to: string, text: string): Promise<void> {
  await sendConnectorAction({
    connectorId: "telegram",
    action: "dm",
    args: { to, text } satisfies DmArgs,
  });
}
