const steem = require('steem');

module.exports = {
  commands: {
    end: '> end',
    image: '> image: ',
    append: '> '
  },
  getLastPost(accountName) {
    return new Promise((resolve, reject) => {
      steem.api.getDiscussionsByBlog({tag: accountName, limit: 1}, (err, posts) => {
        if (err) {
          reject(err);
        } else {
          resolve(posts[0]);
        }
      });
    });
  },
  getMostUpvotedCommand(post, meta) {
    return new Promise((resolve, reject) => {
      steem.api.getContentReplies(post.author, post.permlink, (err, comments) => {
        if (err) {
          reject(err);
        } else if (comments.length) {
          // sort by votes
          comments.sort(function(a, b){
            return a.net_votes - b.net_votes;
          });
          comments = comments.reverse();

          // find first valid command
          for (let i = 0; i < comments.length; i++) {
            let command = comments[i].body.split('\n')[0];

            if (command === this.commands.end && meta.day > 10) {
              resolve({type: 'end', append: '# The End!\n\n' + '<small>Thanks @' + command.author + ' and all the others!</small>'})
              return;
            } else if (command.indexOf(this.commands.image) === 0) {
              resolve({type: 'image', append: command.replace(this.commands.image, '') + '\n<small>@' + command.author + '</small>'});
              return;
            } else if (command.indexOf(this.commands.append) === 0 && command.length <= 152) {
              resolve({type: 'append', append: command.replace(this.commands.append, '') + '\n<small>@' + command.author + '</small>'});
              return;
            }
          }
        } else {
          reject('no commands');
        }
      });
    })
  },
  getStoryPart(body, startPhrase, endPhrase) {
    const start = body.indexOf(startPhrase);
    const end = body.indexOf(endPhrase);
    return body.slice(start, end);
  },
  post(account, key, body, storyNumber, day) {
    const tags = ['the-magic-story-machine', 'writing', 'story', 'funny'];
    const title = 'The Magic Story: #' + storyNumber + ' Day ' + day;
    const permlink = 'the-magic-story-' + storyNumber + '-day-' + day;
    steem.broadcast.comment(key, '', tags[0], account, permlink, title, body, {tags: tags, storyNumber: storyNumber, day: day}, (err) => {
      if (!err) {
        steem.broadcast.vote(key, account, account, permlink, 10000);
      } else {
        console.log(err);
      }
    });
  },
  update(account, key, body, storyNumber, day) {
    this.post(account, key, body, storyNumber, day)
  },
  upvote(key, account, comment, weight) {
    steem.broadcast.vote(key, account, comment.author, comment.permlink, weight, (err) => {
      console.log(err);
    });
  }
};