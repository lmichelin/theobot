import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`App listening on port ${port}`)
}

void bootstrap()
