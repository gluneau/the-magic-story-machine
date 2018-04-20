const steem = require('steem');

module.exports = {
  commands: {
    end: '> !new',
    append: '> '
  },
  getLastPost(accountName) {
    return new Promise((resolve, reject) => {
      steem.api.getDiscussionsByBlog({tag: accountName, limit: 10}, (err, posts) => {
        if (err) {
          reject(err);
        } else {
          for (let i = 0; i < posts.length; i++) {
            let post = posts[i];
            let meta = JSON.parse(post.json_metadata);
            if (meta.hasOwnProperty('day') && meta.hasOwnProperty('storyNumber')) {
              resolve(post);
              return;
            }
          }
          reject('No story posts found in the last 10 posts by ' + accountName + '.');
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
            let comment = comments[i];
            let command = comment.body.split('\n')[0];
            if (command === this.commands.end && meta.day > 10) {
              resolve({type: 'new', author: comment.author, appendText: '# The End!\n\n' + 'Thanks to all the authors!'});
              return;
            } else if (command.indexOf(this.commands.append) === 0 && command.length <= 252) {
              resolve({type: 'append', author: comment.author, appendText: command.replace(this.commands.append, '').trim() + '\n<sup>(by @' + comment.author + ')</sup>'});
              return;
            }
          }
          reject('no commands');
        } else {
          reject('no commands');
        }
      });
    })
  },
  getStoryPart(body, startPhrase, endPhrase) {
    const start = body.indexOf(startPhrase);
    const end = body.indexOf(endPhrase);
    if (start !== -1 && end !== -1) {
      return body.slice(start, end);
    } else {
      console.log('Could not find story part in content. :(');
      return false;
    }
  },
  addParticipant(author, participants) {
    if (participants.hasOwnProperty(author)) {
      participants[author]++;
    } else {
      participants[author] = 1;
    }
    return participants;
  },
  post(account, key, body, storyNumber, day, participants) {
    const tags = ['themagicfrog', 'writing', 'story', 'funny'];
    const title = 'The Magic Story: #' + storyNumber + ' Day ' + day;
    const permlink = 'the-magic-story-' + storyNumber + '-day-' + day;
    const meta = {tags: tags, storyNumber: storyNumber, day: day, participants: participants};
    steem.broadcast.comment(key, '', tags[0], account, permlink, title, body, meta, (err) => {
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