const steem = require('steem');
const locales = require('./locales');

module.exports = {
  BOT_ACCOUNT_NAME: process.env.BOT_ACCOUNT_NAME,
  BOT_KEY: process.env.BOT_KEY,
  BOT_TAGS: process.env.BOT_TAGS,
  BOT_LANG: process.env.BOT_LANG,
  commands: ['end', 'append'],
  async getPosts() {
    const getPosts = function (account, start_author, start_permlink) {
      return new Promise((resolve, reject) => {
        steem.api.getDiscussionsByBlog({
          tag: account,
          limit: 100,
          start_author: start_author,
          start_permlink: start_permlink
        }, (err, res) => {
          if (!err) {
            resolve(res);
          } else {
            reject(err);
          }
        });
      });
    };

    let allPosts = [];
    let posts;
    let lastPost;
    let startAuthor = null;
    let startPermlink = null;

    do {
      posts = await getPosts(this.BOT_ACCOUNT_NAME, startAuthor, startPermlink);
      lastPost = posts[posts.length - 1];
      startAuthor = lastPost.author;
      startPermlink = lastPost.permlink;

      for (let i = 0; i < posts.length; i++) {
        allPosts.push(posts[i]);
      }

      allPosts = allPosts.filter((post, index, self) => self.findIndex(p => p.permlink === post.permlink) === index)

    } while (posts.length === 100);

    return allPosts;
  },
  getComments(permlink) {
    return new Promise((resolve, reject) => {
      steem.api.getContentReplies(this.BOT_ACCOUNT_NAME, permlink, (err, comments) => {
        if (err) {
          reject(err);
        } else {
          resolve(comments);
        }
      });
    });
  },
  getAccount() {
    return new Promise((resolve, reject) => {
      steem.api.getAccounts([this.BOT_ACCOUNT_NAME], (err, users) => {
        if (err || users.length === 0) {
          reject(err);
        } else {
          resolve(users[0]);
        }
      });
    });
  },
  claimRewards(account) {
    return new Promise((resolve, reject) => {
      if (
        parseFloat(account.reward_steem_balance) > 0 ||
        parseFloat(account.reward_sbd_balance) > 0 ||
        parseFloat(account.reward_vesting_balance) > 0
      ) {
        steem.broadcast.claimRewardBalance(this.BOT_KEY, this.BOT_ACCOUNT_NAME, account.reward_steem_balance, account.reward_sbd_balance, account.reward_vesting_balance, (err) => {
          if (err) {
            reject(err);
          } else {
            steem.api.getAccounts([this.BOT_ACCOUNT_NAME], (err, users) =>  {
              if (err || users.length === 0) {
                reject(err);
              } else {
                resolve(users[0]);
              }
            });
          }
        });
      } else {
        steem.api.getAccounts([this.BOT_ACCOUNT_NAME], (err, users) =>  {
          if (err || users.length === 0) {
            reject(err);
          } else {
            resolve(users[0]);
          }
        });
      }
    });
  },
  getAllStoryPosts(posts) {
    return posts.filter(post => {
      let meta = JSON.parse(post.json_metadata);

      return meta.hasOwnProperty('day') && meta.hasOwnProperty('storyNumber')
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
    return pot;
  },
  getPostPot(post) {
    if (post.last_payout === '1970-01-01T00:00:00') {
      return parseFloat(post.pending_payout_value.replace(' SBD', '')) * 0.75 / 2;
    }

    return (parseFloat(post.total_payout_value.replace(' SBD', '')) / 2).toFixed(2);
  },
  getAllValidComments(comments, canEnd) {
    let validComments = [];

    if (comments.length) {
      // sort by votes
      comments.sort((a, b) => {
        return a.net_votes - b.net_votes;
      });
      comments = comments.reverse();

      // find valid commands
      for (let i = 0; i < comments.length; i++) {
        let comment = comments[i];
        if (comment.json_metadata) {
          let command = JSON.parse(comment.json_metadata);
          if (
            // image property seems to be removed when empty and comment edited on steemit, idk why... comment property doesn't seem to be removed
            // we'll only check for type now
            // command.hasOwnProperty('appendText') &&
            // command.hasOwnProperty('image') &&
            // command.hasOwnProperty('comment') &&
            command.hasOwnProperty('type') &&
            this.commands.indexOf(command.type) !== -1
          ) {
            if ((command.type === 'end' && canEnd) || (command.type === 'append' && command.appendText.length < 251)) {
              validComments.push(comment);
            }
          }
        }
      }
    }

    return validComments;
  },
  getMostUpvotedCommand(validComments) {
    if (validComments.length) {
      return JSON.parse(validComments[0].json_metadata);
    }

    return null;
  },
  hasStoryEnded(commands) {
    return commands.length && commands[commands.length - 1].type === 'end';
  },
  buildStoryBody(commands) {
    let storyBody = '';
    commands.forEach(command => {
      if (command.appendText && command.image) {
        storyBody += command.appendText + '\n\n' + command.image + '\n' + '<sup>' + locales.getAttribution(this.BOT_LANG, command.author) + '</sup>\n\n';
      } else if (command.appendText) {
        storyBody += command.appendText + '\n' + '<sup>' + locales.getAttribution(this.BOT_LANG, command.author) + '</sup>\n\n';
      } else if (command.image) {
        storyBody += command.image + '\n' + '<sup>' + locales.getAttribution(this.BOT_LANG, command.author) + '</sup>\n\n';
      }
    });
    return storyBody;
  },
  getPostIntro(pot) {
    pot = pot.toFixed(2);
    return locales.getIntro(this.BOT_LANG).replace('{{pot}}', pot);
  },
  getPostFooter() {
    return locales.getFooter(this.BOT_LANG);
  },
  getWinnerTransferMemo(receiver, amount, storyNumber) {
    return locales.getWinnerTransferMemo(this.BOT_LANG)
      .replace('{{receiver}}', receiver)
      .replace('{{amount}}', amount.toFixed(3))
      .replace('{{storyNumber}}', storyNumber);
  },
  getLoserTransferMemo(receiver, amount, storyNumber, contributionCount) {
    return locales.getLoserTransferMemo(this.BOT_LANG)
      .replace('{{receiver}}', receiver)
      .replace('{{amount}}', amount.toFixed(3))
      .replace('{{contributionCount}}', contributionCount)
      .replace('{{storyNumber}}', storyNumber);
  },
  post(body, meta, storyNumber, day) {
    const title = locales.getPostTitle(this.BOT_LANG).replace('{{storyNumber}}', storyNumber).replace('{{day}}', day);
    const permlink = locales.getPostPermlink(this.BOT_LANG).replace('{{storyNumber}}', storyNumber).replace('{{day}}', day);

    meta.storyNumber = storyNumber;
    meta.day = day;
    meta.tags = this.BOT_TAGS.split(',').map(tag => tag.trim());
    meta.app = 'the-magic-story-machine/0.1';

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
        steem.broadcast.commentOptions(this.BOT_KEY, this.BOT_ACCOUNT_NAME, permlink, '1000000.000 SBD', 5000, true, true, extensions, (err) => {
          if (err) {
            console.log(err);
          }
        });

        // vote
        steem.broadcast.vote(this.BOT_KEY, this.BOT_ACCOUNT_NAME, this.BOT_ACCOUNT_NAME, permlink, 10000);
      } else {
        console.log(err);
      }
    });
  },
  upvote(comment, weight) {
    steem.api.getActiveVotes(comment.author, comment.permlink, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // check if already voted
        let voted = false;
        result.forEach((vote) => {
          if (vote.voter === this.BOT_ACCOUNT_NAME && vote.percent > 0) {
            voted = true;
          }
        });

        // vote
        if (!voted) {
          steem.broadcast.vote(this.BOT_KEY, this.BOT_ACCOUNT_NAME, comment.author, comment.permlink, weight, (err) => {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    });
  },
  transfer(to, amount, memo) {
    steem.broadcast.transfer(this.BOT_KEY, this.BOT_ACCOUNT_NAME, to, amount.toFixed(3) + ' SBD', memo, function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
};