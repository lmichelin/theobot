import { MiddlewareConsumer, Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { SlackApiClient } from "./slackApiClient.service"
import { SlackEventsMiddleware } from "./slackEvents.middleware"
import { SlackWorkspaceUsers } from "./slackWorkspaceUsers.service"

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, SlackApiClient, SlackWorkspaceUsers],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SlackEventsMiddleware).forRoutes("/slack/events")
  }
}
