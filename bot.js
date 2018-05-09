// TODO: automatic reward distribution
// TODO: multilanguage support

const helper = require('./helper');

if (!helper.BOT_ACCOUNT_NAME || !helper.BOT_KEY || !helper.BOT_TAGS) {
  console.log('You forgot to set the necessary environment variables!');
  process.exit();
}

(async () => {
  console.log('Fetching data...');
  // get data: all posts from bot account and all comments from latest story post
  let posts = await helper.getPosts();
  let comments = [];
  for (let i = 0; i < posts.length; i++) {
    let meta = JSON.parse(posts[i].json_metadata);
    if (
      meta.hasOwnProperty('day') &&
      meta.hasOwnProperty('storyNumber') &&
      meta.hasOwnProperty('commands') &&
      meta.hasOwnProperty('startPhrase') &&
      meta.hasOwnProperty('toBeContinued')
    ) {
      comments = await helper.getComments(posts[i].permlink);
      console.log('Found ' + posts.length + ' posts and ' + comments.length + ' comments for latest post.');
      break;
    }
  }

  if (posts) {
    // prepare data
    const allStoryPosts = helper.getAllStoryPosts(posts);
    const lastPost = allStoryPosts[0];
    const lastPostMeta = JSON.parse(lastPost.json_metadata);
    const storyHasEnded = helper.hasStoryEnded(lastPostMeta.commands);
    const currentStoryPosts = helper.getCurrentStoryPosts(allStoryPosts, lastPostMeta.storyNumber);
    const pot = helper.getPotValue(currentStoryPosts);
    const validComments = helper.getAllValidComments(comments, lastPostMeta.day > 10);
    const command = helper.getMostUpvotedCommand(validComments);
    const intro = helper.getPostIntro(pot);
    const footer = helper.getPostFooter();

    console.log('Found ' + currentStoryPosts.length + ' posts in current story.');
    console.log('Found ' + validComments.length + ' valid commands for latest story post.');
    console.log('Most upvoted command: ' + JSON.stringify(command));
    console.log('Pot value: ' + pot);

    if (storyHasEnded) {
      // start new story
      console.log('Story has ended. Starting a new one...');
      helper.post(
        intro + '\n\n# ' + lastPostMeta.startPhrase + '\n# \n\n## ' + lastPostMeta.toBeContinued + '\n\n' + footer,
        lastPostMeta,
        lastPostMeta.storyNumber + 1,
        1
      );
    } else if (command) {
      // continue story
      lastPostMeta.commands.push(command);

      let storyBody = helper.buildStoryBody(lastPostMeta.commands);

      if (command.type === 'end') {
        // publish last story post
        console.log('Story will end. Publishing last post...');
        helper.post(
          intro + '\n\n# ' + lastPostMeta.startPhrase + '\n# \n\n' + storyBody + ' \n\n' + footer,
          lastPostMeta,
          lastPostMeta.storyNumber,
          lastPostMeta.day + 1
        );
      } else if (command.type === 'append') {
        // publish next story post
        console.log('Story goes on. Publishing next post...');
        helper.post(
          intro + '\n\n# ' + lastPostMeta.startPhrase + '\n# \n\n' + storyBody + ' \n\n## ' + lastPostMeta.toBeContinued + footer,
          lastPostMeta,
          lastPostMeta.storyNumber,
          lastPostMeta.day + 1
        );
      }
    }

    // upvote comments
    if (validComments.length) {
      console.log('Upvoting ' + validComments.length + ' comments:');

      // calculate voting weights:
      // - we assume that we start at 100% voting power every day and we don't want to go below 80% to be fully recovered the next day
      // - the post that just got published already got a 100% vote, so we are at 98% now
      // - the winner comment will also get a 100% vote, leaving us at 96% voting power (roughly, actually a bit more)
      // - if there are more comments (hopefully :D) then we have 16% voting power left until we went down to 80%
      // - those 16% will then be distributed across all remaining comments
      // - if there are not that many comments, they will also receive a 100% vote
      // - (use timeouts to make sure we don't get a "don't be hasty" error from steem)

      // get the first/winning comment (removing it from the array) and vote at 100%
      let winningComment = validComments.shift();
      setTimeout(() => {
        console.log('Upvoting @' + winningComment.author + '/' + winningComment.permlink + ' (Weight: 100%)');
        helper.upvote(winningComment, 10000);
      }, 5000);

      // if there are comments left... do some math and then vote
      if (validComments.length) {
        let weight = Math.min(((16 / validComments.length) / 2 * 100), 100).toFixed(2) * 100;
        validComments.forEach((comment, i) => {
          setTimeout(() => {
            console.log('Upvoting @' + comment.author + '/' + comment.permlink + ' (' + weight / 100 + ' %)');
            helper.upvote(comment, weight);
          }, (i + 2) * 5000); // first run after 10s (0 + 2 * 5000), that's 5s after the vote on the winning comment (which itself is 5s after the vote on the story post)
        });
      }
    }
  }
})();