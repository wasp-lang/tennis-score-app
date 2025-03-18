# Tennis Score Tracking App

<img width="1219" alt="score_page" src="https://github.com/user-attachments/assets/b2a7db57-8555-46d6-946b-38e5d1adb7d5" />

> Imagine you are organising a tennis tournament and you want to keep track of the scores in real-time. You want some judge to keep score while watching a game. We want to allow people to keep track of all the matches that are played right now / were played earlier. 

## Running it locally

1. Make sure you have the latest version of [Wasp](https://wasp-lang.dev) installed by running `curl -sSL https://get.wasp-lang.dev/installer.sh | sh` in your terminal.
2. Start the PostgreSQL database with `wasp db start`
3. Run `wasp db migrate-dev`
4. Run `wasp start`. This will install all dependencies and start the client and server for you :)
5. Go to `localhost:3000` in your browser (your NodeJS server will be running on port `3001`)
6. Install the Wasp extension for VSCode to get the best DX
