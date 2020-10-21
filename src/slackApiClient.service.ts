import { Injectable } from "@nestjs/common"
import { KnownBlock, WebAPICallResult, WebClient } from "@slack/web-api"
import { ConversationHistoryResult, ConversationMembersResult, User, UsersResult } from "./types/slack"

@Injectable()
export class SlackApiClient {
  client: WebClient

  constructor() {
    this.client = new WebClient(process.env.SLACK_TOKEN)
  }

  async getWorkspaceUsers(): Promise<User[]> {
    const { members } = (await this.client.users.list()) as UsersResult

    return members
  }

  async getConversationUserIds(conversationId: string, limit = 1000): Promise<string[]> {
    const { members } = (await this.client.conversations.members({
      channel: conversationId,
      limit,
    })) as ConversationMembersResult

    return members
  }

  sendMessage(
    channel: string,
    threadTimestamp: string | undefined,
    text: string,
    blocks?: KnownBlock[],
  ): Promise<WebAPICallResult> {
    return this.client.chat.postMessage({ channel, thread_ts: threadTimestamp, text, blocks })
  }

  addReaction(channel: string, messageTimestamp: string, emojiName: string): Promise<WebAPICallResult> {
    return this.client.reactions.add({ channel, timestamp: messageTimestamp, name: emojiName })
  }

  async getConversationHistory(conversationId: string, limit: number): Promise<ConversationHistoryResult["messages"]> {
    const { messages } = (await this.client.conversations.history({
      channel: conversationId,
      limit,
    })) as ConversationHistoryResult

    return messages
  }
}
