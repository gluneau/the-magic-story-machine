const helper = require('./helper');

const BOT_ACCOUNT_NAME = process.env.BOT_ACCOUNT_NAME || 'the-magic-frog';
const BOT_KEY = process.env.BOT_KEY;

if (!BOT_ACCOUNT_NAME || !BOT_KEY) {
  console.log('You forgot to set the bot\'s credentials!');
  process.exit();
}

(async () => {
  // get data: all posts from bot account and all comments from latest story post
  let posts = await helper.getPosts(BOT_ACCOUNT_NAME);
  let comments = [];
  for (let i = 0; i < posts.length; i++) {
    let meta = JSON.parse(posts[i].json_metadata);
    if (meta.hasOwnProperty('day') && meta.hasOwnProperty('storyNumber')) {
      comments = await helper.getComments(BOT_ACCOUNT_NAME, posts[i].permlink);
      break;
    }
  }

  if (posts) {
    // prepare data
    const allStoryPosts = helper.getAllStoryPosts(posts);
    const lastPost = allStoryPosts[0];
    const lastPostMeta = JSON.parse(lastPost.json_metadata);
    const currentStoryPosts = helper.getCurrentStoryPosts(allStoryPosts, lastPostMeta.storyNumber);
    const pot = helper.getPotValue(currentStoryPosts);
    const command = helper.getMostUpvotedCommand(comments, lastPostMeta.day > 10);

    const startPhrase = '# Once upon a time,';
    const toBeContinued = '## To be continued!';

    const intro = `<center>
![avatar.png](https://steemitimages.com/DQmeK9D1q35gERzGWfQBD9MKGzuU5wjDNSM1q561dbGxdmL/avatar.png)
</center>

### <center>It's me again...<br>The Magic Frog</center>
## <center>[Read my story](https://steemit.com/introduceyourself/@the-magic-frog/this-is-the-magic-story-machine-help-the-not-so-magic-frog-collaborative-storytelling-click-it-there-s-money-to-win)</center>
##

<center>The Pot full of Gold:<br>[**$ ${pot}**](http://the-magic-frog.com)<br><sup>(Cast your Upvote Spell on this post to raise the pot!)</sup></center>`;

    const footer = `

<hr>

### <center><sup>To participate visit:</sup><br>[the-magic-frog.com](http://the-magic-frog.com)</center>
###

### <center><sup>Or copy the following template for your comment:</sup></center>

\`\`\`
> Write here what you want to append to the story, in one line. Leave a space after the > and use no more than 250 characters.

And here you can write an additional, personal comment. (optional)
\`\`\` `;

    const newStory = intro + '\n\n' + startPhrase + '\n\n' + toBeContinued + '\n\n' + footer;

    let story = intro + '\n\n' + helper.getStoryPart(lastPost.body, startPhrase, toBeContinued);

    if (command && story) {
      if (command.type === 'end') {
        // post last story post
        story += '\n\n' + command.appendText + '\n\n' + toBeContinued + footer;
        let participants = helper.addParticipant(command.author, lastPostMeta.participants);
        // helper.post(BOT_ACCOUNT_NAME, BOT_KEY, story, lastPostMeta.storyNumber, lastPostMeta.day + 1, participants);

        // start new story
        // helper.post(BOT_ACCOUNT_NAME, BOT_KEY, newStory, lastPostMeta.storyNumber + 1, 1, {});
      } else if (command.type === 'append') {
        // post next story post
        story += '\n\n' + command.appendText + '\n\n' + toBeContinued + footer;
        let participants = helper.addParticipant(command.author, lastPostMeta.participants);
        // helper.post(BOT_ACCOUNT_NAME, BOT_KEY, story, lastPostMeta.storyNumber, lastPostMeta.day + 1, participants);
      }
    }
  }
})();