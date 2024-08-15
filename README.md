# Stealth Scan

Stealth Scan is tool that aims to uncover invisible trackers on popular websites. It lists websites along with the number of trackers found and the likelihood of fingerprinting. The site aims to enhance secure browsing by identifying and reporting these trackers. Users can view detailed reports for each website and filter results based on the fingerprinting score.

The repository contains the node.js application code in addition to the "collector" script that generates the fingerprinting reports at your disposal.

## How to run the collector script locally

If you'd like to generate your own reports for yourself, or if you'd like to consider contributing to our own database, please run the following to generate your own report for a website:

1. In the root directory of the project, run `node collector.js <SITE_URL>`
2. if you'd like to save the contents of the output to a JSON file, run the following: `node collector.js <SITE_URL> > <FILE_NAME>.json`

## How to run the app locally using Docker

The application requires the following environment variables to activate some of it's features.

To enable emails, provide values for the following keys:
SMTP Settings:
`SMTP_HOST`
`SMTP_PORT`
`SMTP_USER`
`SMTP_PASS`

TO/FROM Email options:
`SS_RQST_TO`
`SS_RQST_FROM`

Botpoison Spam Protection:
`SS_BP_SECRET`

SQLite Database name
`SS_DB_NAME`

Optional Umami analytics ID
`SS_UMAMI_ID`

Once thats configured, you can easily start the application by running the following docker commands:

1. Build the Docker image based on the included `Dockerfile` 
`docker build --platform linux/amd64 . -t stealth-scan`
2.  Start a new container using the docker image just created
`docker run -p 3000:3000 --name local-stealthscan -d stealth-scan`
3. Open `http://localhost:3000`

## Questions or Comments

Have questions, comments or ways to improve the tool? Feel free to open up a GitHub Issue!
