import { Injectable } from "@nestjs/common"
import { SlackApiClient } from "./slackApiClient.service"
import { User } from "./types/slack"

const CACHE_USERS_DURATION_IN_SECONDS = 3600

@Injectable()
export class SlackWorkspaceUsers {
  private users: User[] = []
  private lastUpdated = Date.now() - CACHE_USERS_DURATION_IN_SECONDS * 1000

  constructor(private readonly slackApiClient: SlackApiClient) {}

  async getUsers(): Promise<User[]> {
    if (Date.now() - this.lastUpdated >= CACHE_USERS_DURATION_IN_SECONDS * 1000) await this.refreshUsers()

    return this.users
  }

  private async refreshUsers() {
    const everybodyUserIds = await this.slackApiClient.getConversationUserIds(process.env.EVERYBODY_CHANNEL_ID ?? "")
    const allUsers = await this.slackApiClient.getWorkspaceUsers()
    this.users = allUsers.filter(({ id, deleted, is_bot }) => !deleted && !is_bot && everybodyUserIds.includes(id))
    this.lastUpdated = Date.now()
  }
}
