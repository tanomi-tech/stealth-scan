FROM node:lts

RUN apt update

RUN apt-get install -y sqlite3

WORKDIR /home/app/stealth-scan

COPY . ./
RUN npm install

RUN node --env-file=.env ./database.js

RUN sqlite3 reports.db -cmd '.mode csv' -cmd '.import ./reports/reports.csv reports'

USER node

EXPOSE 3000
CMD [ "npm", "start"]