const steem = require('steem');

module.exports = {
  commands: {
    end: '> The End!',
    append: '> '
  },
  getPosts(accountName, limit = 100) {
    // TODO: make this recursive to get ALL posts
    return new Promise((resolve, reject) => {
      steem.api.getDiscussionsByBlog({tag: accountName, limit: limit}, (err, posts) => {
        if (err) {
          reject(err);
        } else {
          resolve(posts);
        }
      });
    });
  },
  getComments(accountName, permlink) {
    return new Promise((resolve, reject) => {
      steem.api.getContentReplies(accountName, permlink, function(err, comments) {
        if (err) {
          reject(err);
        } else {
          resolve(comments);
        }
      });
    });
  },
  getAllStoryPosts(posts) {
    return posts.filter(post => {
      let meta = JSON.parse(post.json_metadata);
      return meta.hasOwnProperty('day') && meta.hasOwnProperty('storyNumber');
    });
  },
  getCurrentStoryPosts(allStoryPosts, storyNumber) {
    return allStoryPosts.filter(post => {
      let meta = JSON.parse(post.json_metadata);
      return parseInt(meta.storyNumber) === storyNumber
    });
  },
  getPotValue(currentStoryPosts) {
    let pot = 0;
    for (let i = 0; i < currentStoryPosts.length; i++) {
      pot += parseFloat(this.getPostPot(currentStoryPosts[i]));
    }
    return pot.toFixed(2);
  },
  getPostPot(post) {
    if (post.last_payout === '1970-01-01T00:00:00') {
      return parseFloat(post.pending_payout_value.replace(' SBD', '')) * 0.75 / 2;
    }

    return (parseFloat(post.total_payout_value.replace(' SBD', '')) / 2).toFixed(2);
  },
  getMostUpvotedCommand(comments, canEnd) {
    if (comments.length) {
      // sort by votes
      comments.sort(function(a, b){
        return a.net_votes - b.net_votes;
      });
      comments = comments.reverse();

      // find first valid command
      for (let i = 0; i < comments.length; i++) {
        let comment = comments[i];
        let command = comment.body.split('\n')[0];
        if (command === this.commands.end && canEnd) {
          return {
            type: 'end',
            author: comment.author,
            appendText: '### <center>The End!</center>\n\n'
          };
        } else if (command.indexOf(this.commands.append) === 0 && command.length <= 252) {
          return {
            type: 'append',
            author: comment.author,
            appendText: command.replace(this.commands.append, '').trim() + '\n<sup>(by @' + comment.author + ')</sup>'
          };
        }
      }
    }

    return null;
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