const steem = require('steem');
const helper = require('./helper');

const BOT_ACCOUNT_NAME = process.env.BOT_ACCOUNT_NAME || 'the-magic-frog';
const BOT_KEY = process.env.BOT_KEY;

if (!BOT_ACCOUNT_NAME || !BOT_KEY) {
  console.log('You forgot to set the bot\'s credentials!');
  process.exit();
}

(async () => {
  const lastPost = await helper.getLastPost(BOT_ACCOUNT_NAME).catch(err => console.log(err));
  const lastPostMeta = JSON.parse(lastPost.json_metadata);
  const command = await helper.getMostUpvotedCommand(lastPost, lastPostMeta).catch(err => console.log(err));

  const startPhrase = '# Once upon a time,';
  const toBeContinued = '## To be continued!';
  const footer = `<hr>

<sup>**Comment Commands:**</sup>

<sup>\`> [word/sentence/whatever]\`<br>Appends "[word/sentence/whatever]" to the current story.</sup>

<sup>\`> image: [image url]\`<br>Appends "[image url]" to the current story.</sup>

<sup>\`> end\`<br>Appends "The End!" to the current story and starts a new one. **(Available only after 10th day of a story!)**</sup>

<sup>**The command with the highest number of upvotes will be executed the next day at 12:30 PM (CET)!**</sup>
<sup>The user get's a lottery ticket to win the story pot (**50 % of the author rewards from 10 posts minimum!**) every time a story ends.</sup>`;

  const newStory = startPhrase + '\n\n' + toBeContinued + footer;

  let story = helper.getStoryPart(lastPost.body, startPhrase, toBeContinued);

  if (command) {
    story += '\n\n' + command.append;

    if (command.type === 'end') {
      story += '\n\n[A new story](https://steemit.com/@' + BOT_ACCOUNT_NAME + ') has started!';
      helper.update(BOT_ACCOUNT_NAME, BOT_KEY, story, lastPostMeta.storyNumber, lastPostMeta.day);

      helper.post(BOT_ACCOUNT_NAME, BOT_KEY, newStory, lastPostMeta.storyNumber + 1, 1);
    } else if (command.type === 'append') {
      story += '\n\n' + toBeContinued + footer;
      helper.post(BOT_ACCOUNT_NAME, BOT_KEY, story, lastPostMeta.storyNumber, lastPostMeta.day + 1);
    }

    // upvote comment
    helper.upvote(BOT_KEY, BOT_ACCOUNT_NAME, command.author, command.permlink, 10000);
  }
})();