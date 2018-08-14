require('dotenv').config();
const steem = require('steem');

steem.api.getDiscussionsByBlog({
  tag: 'lagrenouillemagique',
  limit: 1,
}, (err, posts) => {
  if (err) {
    console.log(err);
  } else {
    const post = posts[0];
    const meta = JSON.parse(post.json_metadata);
    meta.commands = [];
    meta.startPhrase = 'Il était une fois, ...';
    meta.toBeContinued = 'À suivre...';
    meta.day = 1;
    meta.storyNumber = 1;

    steem.broadcast.comment(process.env.BOT_KEY, '', meta.tags[0], post.author, post.permlink, post.title, post.body, meta, (errs, result) => {
      console.log(errs, result);
    });
  }
});
