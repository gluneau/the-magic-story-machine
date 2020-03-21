# The Magic Story Machine

The Magic Story Machine is a bot for the Hive network. The bot publishes a post everyday and tells a story that is made up by the community.

More details:

- http://the-magic-frog.com
- https://hive.blog/utopian-io/@mkt/the-magic-frog-collaborative-storytelling-bot-and-website

```
git clone https://github.com/mktcode/the-magic-story-machine.git
cd the-magic-story-machine
yarn
```

You also need to export environment variables by putting them in `.env` file, the bot will automatically source it:

```
BOT_ACCOUNT_NAME=account-name
BOT_KEY=PostingKey
BOT_TAGS=themagicfrog,writing,story,funny
BOT_LANG=en
BOT_PROD=false
```

The bot needs one initial post that you have to set up manually. This post must contain the following `json_metadata`:

```
{
  day: 1,
  storyNumber: 1,
  commands: [],
  startPhrase: 'Once upon a time,'
  toBeContinued: 'To be continued!'
}
```

You can lint the code by running `npm run lint`
