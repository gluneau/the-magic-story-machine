const helper = require('./helper');

// TODO: add more verbose logs

if (!helper.BOT_ACCOUNT_NAME || !helper.BOT_KEY || !helper.BOT_TAGS) {
  console.log('You forgot to set the necessary environment variables!');
  process.exit();
}

(async () => {
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

    if (storyHasEnded) {
      // start new story
      helper.post(
        intro + '\n\n# ' + lastPostMeta.startPhrase + '\n# \n\n' + lastPostMeta.toBeContinued + '\n\n' + footer,
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
        helper.post(
          intro + '\n\n# ' + lastPostMeta.startPhrase + '\n# \n\n' + storyBody + ' \n\n' + footer,
          lastPostMeta,
          lastPostMeta.storyNumber,
          lastPostMeta.day + 1
        );
      } else if (command.type === 'append') {
        // publish next story post
        helper.post(
          intro + '\n\n# ' + lastPostMeta.startPhrase + '\n# \n\n' + storyBody + ' \n\n' + lastPostMeta.toBeContinued + footer,
          lastPostMeta,
          lastPostMeta.storyNumber,
          lastPostMeta.day + 1
        );
      }
    }

    // upvote comments
    if (validComments.length) {
      let weight = 10000; // 100% for the first one
      validComments.forEach(comment => {
        setTimeout(() => {
          helper.upvote(comment, weight);
          weight = 1000; // 10% for all others
        }, 5000);
      });
    }
  }
})();