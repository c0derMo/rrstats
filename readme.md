# rrstats
[![forthebadge](https://forthebadge.com/images/badges/contains-technical-debt.svg)](https://forthebadge.com)

Website for displaying statistics about Roulette Rivals-players.

# Deployed version
To visit the official version, go to [the website.](https://rrstats.currymaker.net).

# Development
Unorganized notes about development:
- Frontend & backend are split. Frontend is developed using Vue & Vuetify, backend using MongoDB & Hapi.
- Use `yarn build` to build the project, `yarn start` to run it, `yarn deploy` to create a "deployment-ready" version in `deploy/*`.
- Use `yarn clean` to clean builds & deployments.
- There are windows alternatives for `yarn deploy` and `yarn clean` called `yarn deploy-win` and `yarn clean-win`.
- This project is linted using ESLint and a redicilous config, linted using `yarn lint`.
- ~~too many errors have been ignored~~

# Environment variables
- `DISCORD_TOKEN`: Token for accessing the discord API to grab player profile pictures.
- `MONGODB_URI`: URI for connecting to the mongoDB database.
- `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_TOKEN_SECRET`: For accessing the twitter API to tweet from the backend.