# The Magic Story Machine

The Magic Story Machine is a bot for the Steem network. The bot publishes a post everyday and tells a story that is made up by the community.

More details:

- http://the-magic-frog.com
- https://steemit.com/utopian-io/@mkt/the-magic-frog-collaborative-storytelling-bot-and-website

```
git clone https://github.com/mktcode/the-magic-story-machine.git
cd the-magic-story-machine
npm i
```

You also need to export environment variables:

```
export BOT_ACCOUNT_NAME=account-name
export BOT_KEY=PostingKey
export BOT_TAGS=themagicfrog,writing,story,funny
export BOT_LANG=en
```

Put them in `.env` file and source it (`source .env`) before running scripts.

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
