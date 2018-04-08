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

##### Add to the story or start a new one:
#####

<sup>Simply leave a command in the comments!<br>**The command with the highest number of upvotes will be executed the next day at 12:30 PM (CET)!**</sup>
<sup>**The user get's a lottery ticket to win the story pot: 50 % of the author rewards from all story posts (10 minimum)! Released every time a story ends.**</sup>

- <sup>Write \`> word/sentence/whatever\` to add *word/sentence/whatever* to the current story. (Can also contain image urls!)</sup>
- <sup>Write \`> !new\` to end the current story. The next post will start a new story. **(Available only after the 10th day of a story!)**</sup>

<sup>**Important:** The command must be the first line of your comment and 150 characters at most! After that, leave a blank line if you want to add a normal comment.</sup>`;

  const newStory = startPhrase + '\n\n' + toBeContinued + '\n\n' + footer;

  let story = helper.getStoryPart(lastPost.body, startPhrase, toBeContinued);

  if (command && story) {
    story += '\n\n' + command.appendText;

    if (command.type === 'new') {
      helper.post(BOT_ACCOUNT_NAME, BOT_KEY, newStory, lastPostMeta.storyNumber + 1, 1);
    } else if (command.type === 'append') {
      story += '\n\n' + toBeContinued + footer;
      helper.post(BOT_ACCOUNT_NAME, BOT_KEY, story, lastPostMeta.storyNumber, lastPostMeta.day + 1);
    }

    // upvote comment
    // helper.upvote(BOT_KEY, BOT_ACCOUNT_NAME, command.comment.author, command.comment.permlink, 10000);
  }
})();