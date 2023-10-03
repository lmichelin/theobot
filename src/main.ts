import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  const port = process.env.PORT ?? 3000
  const hostname = process.env.HOSTNAME ?? "0.0.0.0"
  await app.listen(port, hostname)
  console.log(`App listening on port ${port}`)
}

void bootstrap()
