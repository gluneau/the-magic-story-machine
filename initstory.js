const steem = require('steem');

steem.api.getDiscussionsByBlog({
  tag: 'lagrenouillemagique',
  limit: 1
}, (err, posts) => {
  if (err) {
    console.log(err);
  } else {
    const post = posts[0];
    let meta = JSON.parse(post.json_metadata);
    meta.commands = [];
    meta.startPhrase = 'Il était une fois, ...';
    meta.toBeContinued = 'À suivre...';
    meta.day = 1;
    meta.storyNumber = 1;
    BOT_KEY = process.env.BOT_KEY;

    steem.broadcast.comment(BOT_KEY, '', meta.tags[0], post.author, post.permlink, post.title, post.body, meta, function(err, result) {
      console.log(err, result);
    });
  }
});
