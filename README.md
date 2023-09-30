# menu-telegram-bot

## Related Projects

- [menu-api](https://github.com/virtbad/menu-api)
- [menu-updater](https://github.com/virtbad/menu-updater)
- [menu-website](https://github.com/virtbad/menu-website)
- [menu-cli](https://github.com/virtbad/menu-cli)

## Setup

The telegram bot uses a local SQLite database with the [Prisma](https://www.prisma.io/) ORM. In order to host the bot on your own you'll need to setup the ORM first. The easiest way to achieve this is by globally installing prisma if you haven't done this already. You'll need to have [Node.js](https://nodejs.org/en/) installed first in order to install Prisma.

```bash
# install prisma globally via npm
npm install -g prisma
```

After installing Prisma you can generate a new SQLite database using the Prisma CLI.

```bash
# generate a new database
prisma generate
# migrate changes to the database (if made any)
prisma migrate dev
```

Additionally you'll have to create a `.env` file which contains at least the following environment variables:

```javascript
DATABASE_URL=   // local path to the database file. Default: "file:./menu_telegram_bot.db"
API_URL=        // your api url e.g. https://api.example.com
```
The following environment variables are optional:
```javascript
WEBSITE_URL=    // your website url e.g. https://example.com

```

## Deploy

### Using Docker

The docker image for the telegram bot can be pulled from the github container registry:
```bash
docker pull ghcr.io/virtbad/menu-telegram-bot:latest
```

When running the as a container you'll have to mount a config into the container which contains the following entries:
```typescript
{
  "token": "YOUR_TELEGRAM_BOT_TOKEN",
  "selfDescructingTimeout": 2000,
  "waitFoReplyTimeout": 30000
}
```
The config has to be mounted to `/app/config.json` inside the container. Additionally, you'll need to set the environment variables mentioned above for the container. 

Since the telegram bot stores the chats it is part of in a sqlite database you'll idealy mount the database into the container as well. The location of the database is `/app/prisma/<DATABASE_URL_FILE>.db`.

An example for a run command would be:
```
docker run menu-telegram-bot:latest -v ./config.json:/app/config.json -v ./prisma/menu_telegram_bot.db:/app/prisma/menu_telegram_bot.db -e API_URL=http://localhost:80
```

### The Classic Way

In order to deploy the telegram bot you'll still need to specify some configurations and install all project dependencies. When running the bot for the first time it will throw an error and initialize a `config.json` file containing placeholder and default values. You must replace the `token` entry in order to host the bot.

```bash
# install dependencies
npm install
# run the telegram bot
npm run start
```
