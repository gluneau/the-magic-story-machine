const steem = require('steem');

module.exports = {
  BOT_ACCOUNT_NAME: process.env.BOT_ACCOUNT_NAME,
  BOT_KEY: process.env.BOT_KEY,
  BOT_TAGS: process.env.BOT_TAGS,
  commands: ['end', 'append'],
  getPosts(limit = 100) {
    // TODO: make this recursive to get ALL posts
    return new Promise((resolve, reject) => {
      steem.api.getDiscussionsByBlog({tag: this.BOT_ACCOUNT_NAME, limit: limit}, (err, posts) => {
        if (err) {
          reject(err);
        } else {
          resolve(posts);
        }
      });
    });
  },
  getComments(permlink) {
    return new Promise((resolve, reject) => {
      steem.api.getContentReplies(this.BOT_ACCOUNT_NAME, permlink, function(err, comments) {
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

      return meta.hasOwnProperty('day') &&
        meta.hasOwnProperty('storyNumber') &&
        meta.hasOwnProperty('commands') &&
        meta.hasOwnProperty('startPhrase') &&
        meta.hasOwnProperty('toBeContinued');
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
    pot *= 0.95; // 5 % goes to beneficiaries
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
        let command = JSON.parse(comment.json_metadata);
        if (
          command.hasOwnProperty('type') &&
          command.hasOwnProperty('appendText') &&
          this.commands.indexOf(command.type) !== -1
        ) {
          if ((command.type === 'end' && canEnd) || (command.type === 'append' && command.appendText.length < 251)) {
            command.author = comment.author;
            return command;
          }
        }
      }
    }

    return null;
  },
  hasStoryEnded(commands) {
    return commands.length && commands[commands.length - 1].type === 'end';
  },
  buildStoryBody(commands) {
    let storyBody = '';
    commands.forEach(command => storyBody += command.appendText + '\n' + '<sup>by @' + command.author + '</sup>\n\n');
    return storyBody;
  },
  getPostIntro(pot) {
    return `<center>
![avatar.png](https://steemitimages.com/DQmeK9D1q35gERzGWfQBD9MKGzuU5wjDNSM1q561dbGxdmL/avatar.png)
</center>

### <center>It's me again...<br>The Magic Frog</center>
## <center>[Read my story](https://steemit.com/introduceyourself/@the-magic-frog/this-is-the-magic-story-machine-help-the-not-so-magic-frog-collaborative-storytelling-click-it-there-s-money-to-win)</center>
##

<center>The Pot full of Gold:<br>[**$ ${pot}**](http://the-magic-frog.com)<br><sup>(Cast your Upvote Spell on this post to raise the pot!)</sup></center>`;
  },
  getPostFooter() {
    return `

<hr>

### <center><sup>To participate visit:</sup><br>[the-magic-frog.com](http://the-magic-frog.com)</center>
###

<center><sup>If you want to support this project feel free to **upvote** and **resteem** this post and **follow @the-magic-frog** but most important... **participate!**</sup></center>`;
  },
  post(body, meta, storyNumber, day) {
    const title = 'The Magic Story: #' + storyNumber + ' Day ' + day;
    const permlink = 'the-magic-story-' + storyNumber + '-day-' + day + '-' + (new Date()).getTime();

    meta.storyNumber = storyNumber;
    meta.day = day;
    meta.tags = this.BOT_TAGS.split(',').map(tag => tag.trim());

    steem.broadcast.comment(this.BOT_KEY, '', meta.tags[0], this.BOT_ACCOUNT_NAME, permlink, title, body, meta, (err) => {
      if (!err) {
        // set beneficiaries
        const extensions = [[0, {
          beneficiaries: [
            {
              account: 'mkt',
              weight: 500
            }
          ]
        }]];
        steem.broadcast.commentOptions(this.BOT_KEY, this.BOT_ACCOUNT_NAME, permlink, '1000000.000 SBD', 5000, true, true, extensions);

        // vote
        steem.broadcast.vote(this.BOT_KEY, this.BOT_ACCOUNT_NAME, this.BOT_ACCOUNT_NAME, permlink, 10000);
      } else {
        console.log(err);
      }
    });
  },
  upvote(comment, weight) {
    steem.broadcast.vote(this.BOT_KEY, this.BOT_ACCOUNT_NAME, comment.author, comment.permlink, weight, (err) => {
      console.log(err);
    });
  }
};