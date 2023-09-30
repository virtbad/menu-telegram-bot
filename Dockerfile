FROM node:16-alpine3.16

WORKDIR /app
COPY . /app

RUN npm install

ENV DATABASE_URL=file:./menu_telegram_bot.db

RUN echo "npm run migrate" > "startup.sh"
RUN echo "npm run generate" >> "startup.sh"
RUN echo "npm start" >> "startup.sh"
RUN chmod +x startup.sh

CMD [ "./startup.sh" ]