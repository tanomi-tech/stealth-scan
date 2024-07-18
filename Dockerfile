FROM ghcr.io/puppeteer/puppeteer:latest

ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-stable
ENV DBUS_SESSION_BUS_ADDRESS disable:

USER root

RUN mkdir -p ./stealth-scan

WORKDIR /home/pptruser/stealth-scan

COPY . ./
RUN npm install

USER pptruser

EXPOSE 3000
CMD [ "npm", "start"]