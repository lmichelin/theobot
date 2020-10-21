import { Injectable, NestMiddleware } from "@nestjs/common"
import { createEventAdapter } from "@slack/events-api"
import SlackEventAdapter from "@slack/events-api/dist/adapter"
import { ImageBlock, KnownBlock } from "@slack/web-api"
import { Request, Response } from "express"
import { SlackApiClient } from "./slackApiClient.service"
import { SlackWorkspaceUsers } from "./slackWorkspaceUsers.service"
import { Event } from "./types/slack"
import { normalizeString } from "./utils"

@Injectable()
export class SlackEventsMiddleware implements NestMiddleware {
  use: (req: Request, res: Response, next: () => void) => unknown
  slackEvents: SlackEventAdapter

  constructor(
    private readonly slackApiClient: SlackApiClient,
    private readonly slackWorkspaceUsers: SlackWorkspaceUsers,
  ) {
    this.slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET ?? "")
    this.use = this.slackEvents.expressMiddleware()

    this.registerEventListeners()
  }

  registerEventListeners(): void {
    this.slackEvents.on("message", async (event: Event) => {
      console.log("MESSAGE EVENT", event)
      if (event.bot_id) return // prevent bot from responding to itself

      try {
        const historyMessages = await this.slackApiClient.getConversationHistory(event.channel, 2)

        const imageToGuessUrl = (historyMessages[1]?.blocks?.[0] as ImageBlock | undefined)?.image_url

        const userToGuess = imageToGuessUrl
          ? (await this.slackWorkspaceUsers.getUsers()).find(({ profile }) => profile.image_192 === imageToGuessUrl)
          : null

        const normalizedMessage = normalizeString(event.text)

        if (userToGuess) {
          if (
            normalizedMessage === normalizeString(userToGuess.profile.first_name) ||
            normalizedMessage === normalizeString(userToGuess.profile.real_name)
          ) {
            await this.slackApiClient.addReaction(event.channel, event.ts, "heavy_check_mark")
            await this.slackApiClient.sendMessage(
              event.channel,
              event.thread_ts,
              `Congratulations :tada:, this is *${userToGuess.profile.real_name}* :wink:`,
            )
          } else {
            await this.slackApiClient.addReaction(event.channel, event.ts, "x")
            await this.slackApiClient.sendMessage(
              event.channel,
              event.thread_ts,
              `Oh! no :cry:, this is *${userToGuess.profile.real_name}* :wink:`,
            )
          }

          await this.slackApiClient.sendMessage(event.channel, event.thread_ts, `Let's play again :smiley:`)
        } else {
          await this.slackApiClient.addReaction(event.channel, event.ts, "wave")
          await this.slackApiClient.sendMessage(
            event.channel,
            event.thread_ts,
            `Hello :smiley: Nice to meet you, let's break the ice :wink:`,
          )
        }

        const users = await this.slackWorkspaceUsers.getUsers()

        if (!users.length) {
          await this.slackApiClient.sendMessage(event.channel, event.thread_ts, `Oh! No theodoer found :cry:`)
        } else {
          const randomUser = users[Math.floor(Math.random() * users.length)]

          const instructionsText = `_Give ${randomUser.profile.first_name ? "the first name or " : ""}the full name._`

          const messageText = `Who is this awesome theodoer? :hugging_face:`

          const messageBlocks: KnownBlock[] = [
            { type: "image", image_url: randomUser.profile.image_192, alt_text: "profile picture" },
            { type: "section", text: { type: "mrkdwn", text: messageText } },
            { type: "context", elements: [{ type: "mrkdwn", text: instructionsText }] },
          ]
          await this.slackApiClient.sendMessage(event.channel, event.thread_ts, messageText, messageBlocks)
        }
      } catch (error) {
        console.log(error)
      }
    })

    this.slackEvents.on("app_mention", async (event: Event) => {
      console.log("APP_MENTION EVENT", event)

      try {
        await this.slackApiClient.addReaction(event.channel, event.ts, "wave")
        await this.slackApiClient.sendMessage(
          event.channel,
          event.thread_ts,
          `Hello <@${event.user}> :smiley: Nice to meet you! Send me a direct message to start breaking the ice :wink:`,
        )
      } catch (error) {
        console.log(error)
      }
    })
  }
}
