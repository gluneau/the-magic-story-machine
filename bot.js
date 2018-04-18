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

  // TODO: make pot value dynamic
  const intro = `<center>
![avatar.png](https://steemitimages.com/DQmeK9D1q35gERzGWfQBD9MKGzuU5wjDNSM1q561dbGxdmL/avatar.png)
</center>

### <center>It's me again...<br>The Magic Frog</center>
## <center>[Read my story](https://steemit.com/introduceyourself/@the-magic-frog/this-is-the-magic-story-machine-help-the-not-so-magic-frog-collaborative-storytelling-click-it-there-s-money-to-win)</center>
##

<center>The Pot full of Gold:<br>**$ 15.72**<br><sup>(Cast your Upvote Spell on this post or a previous one to raise the pot!)</sup></center>`;

  const footer = `

<hr>

### <center><sup>To participate visit:</sup><br>[the-magic-frog.com](http://the-magic-frog.com)</center>
###

### <center><sup>Or copy the following template for your comment:</sup></center>

\`\`\`
> Write here what you want append to the story, in one line. Leave a space after the > and use no more than 250 characters.

And here you can write an additional, personal comment. (optional)
\`\`\` `;

  const newStory = startPhrase + '\n\n' + toBeContinued + '\n\n' + footer;

  let story = intro + '\n\n' + helper.getStoryPart(lastPost.body, startPhrase, toBeContinued);

  if (command && story) {
    if (command.type === 'new') {
      helper.post(BOT_ACCOUNT_NAME, BOT_KEY, newStory, lastPostMeta.storyNumber + 1, 1);
    } else if (command.type === 'append') {
      story += '\n\n' + command.appendText + '\n\n' + toBeContinued + footer;
      helper.post(BOT_ACCOUNT_NAME, BOT_KEY, story, lastPostMeta.storyNumber, lastPostMeta.day + 1);
    }

    // upvote comment
    // helper.upvote(BOT_KEY, BOT_ACCOUNT_NAME, command.comment.author, command.comment.permlink, 10000);
  }
})();