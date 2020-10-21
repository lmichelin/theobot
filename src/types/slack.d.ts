import { KnownBlock, WebAPICallResult } from "@slack/web-api"

interface UserProfile {
  real_name: string
  first_name?: string
  last_name?: string
  image_192: string
}

export interface User {
  id: string
  profile: UserProfile
  deleted: boolean
  is_bot: boolean
}

export interface UsersResult extends WebAPICallResult {
  members: User[]
}

export interface ConversationMembersResult extends WebAPICallResult {
  members: string[]
}

export interface ConversationHistoryResult extends WebAPICallResult {
  messages: {
    user: string
    text: string
    blocks?: KnownBlock[]
  }[]
}

export interface Event {
  client_msg_id: string
  bot_id?: string
  ts: string
  thread_ts?: string
  text: string
  user: string
  channel: string
}
