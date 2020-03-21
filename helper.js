require('dotenv').config();
const steem = require('steem');
const axios = require('axios');
const locales = require('./locales');

module.exports = {
  BOT_ACCOUNT_NAME: process.env.BOT_ACCOUNT_NAME,
  BOT_KEY: process.env.BOT_KEY,
  BOT_TAGS: process.env.BOT_TAGS,
  BOT_LANG: process.env.BOT_LANG,
  BOT_PROD: process.env.BOT_PROD,
  commands: ['end', 'append'],
  votingQueue: [],
  async getPosts() {
    const getPosts = function getPosts(account, startAuthor, startPermlink) {
      return new Promise((resolve, reject) => {
        steem.api.getDiscussionsByBlog({
          tag: account,
          limit: 100,
          start_author: startAuthor,
          start_permlink: startPermlink,
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

      for (let i = 0; i < posts.length; i += 1) {
        if (posts[i].author === this.BOT_ACCOUNT_NAME) {
          allPosts.push(posts[i]);
        }
      }

      allPosts = allPosts.filter((post, index, self) => self.findIndex(
        p => p.permlink === post.permlink,
      ) === index);
    } while (posts.length === 100);

    return allPosts;
  },
  getPot() {
    return new Promise((resolve, reject) => {
      axios.get(`https://api.the-magic-frog.com/pot?account=${this.BOT_ACCOUNT_NAME}`).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    });
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
      // first get account
      steem.api.getAccounts([this.BOT_ACCOUNT_NAME], (err, accounts) => {
        if (err || accounts.length === 0) reject(err);
        else {
          let account = accounts[0];

          // claim rewards (if something to claim)
          if (
            (
              parseFloat(account.reward_steem_balance) > 0 ||
              parseFloat(account.reward_sbd_balance) > 0 ||
              parseFloat(account.reward_vesting_balance) > 0
            ) && this.BOT_PROD
          ) {
            steem.broadcast.claimRewardBalance(
              this.BOT_KEY,
              this.BOT_ACCOUNT_NAME,
              account.reward_steem_balance,
              account.reward_sbd_balance,
              account.reward_vesting_balance,
              (err) => {
                // if no error then update account
                if (err) reject(err);
                else {
                  steem.api.getAccounts([this.BOT_ACCOUNT_NAME], (err, accounts) => {
                    if (err || accounts.length === 0) {
                      reject(err);
                    } else {
                      resolve(accounts[0]);
                    }
                  });
                }
              }
            );
          } else {
            // if nothing to claim, return account immediately
            resolve(account);
          }
        }
      });
    });
  },
  getDelegators() {
    return new Promise((resolve, reject) => {
      axios.get(`https://api.the-magic-frog.com/delegators?account=${this.BOT_ACCOUNT_NAME}`).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  getCurators(storyNumber) {
    return new Promise((resolve, reject) => {
      axios.get(`https://api.the-magic-frog.com/curators?top=100&storyNumber=${storyNumber}&account=${this.BOT_ACCOUNT_NAME}`).then((response) => {
        resolve(response.data);
      }).catch((err) => {
        reject(err);
      });
    });
  },
  getAllStoryPosts(posts) {
    return posts.filter((post) => {
      const meta = JSON.parse(post.json_metadata);

      return post.author === this.BOT_ACCOUNT_NAME && Object.prototype.hasOwnProperty.call(meta, 'day') && Object.prototype.hasOwnProperty.call(meta, 'storyNumber');
    });
  },
  getCurrentStoryPosts(allStoryPosts, storyNumber) {
    return allStoryPosts.filter((post) => {
      const meta = JSON.parse(post.json_metadata);
      return parseInt(meta.storyNumber, 10) === storyNumber;
    });
  },
  getAllValidComments(comments, canEnd) {
    const validComments = [];

    if (comments.length) {
      // sort by votes
      comments.sort((a, b) => b.net_votes - a.net_votes);

      // find valid commands
      for (let i = 0; i < comments.length; i += 1) {
        const comment = comments[i];
        if (comment.json_metadata) {
          const command = JSON.parse(comment.json_metadata);
          if (
            // image property seems to be removed when empty and comment edited on the condenser,
            // idk why... comment property doesn't seem to be removed
            // we'll only check for type now
            // command.hasOwnProperty('appendText') &&
            // command.hasOwnProperty('image') &&
            // command.hasOwnProperty('comment') &&
            Object.prototype.hasOwnProperty.call(command, 'type')
            && this.commands.indexOf(command.type) !== -1
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
    commands.forEach((command) => {
      if (command.appendText && command.image) {
        storyBody += `${command.appendText}\n\n${command.image}\n<sup>${locales.getAttribution(this.BOT_LANG, command.author)}</sup>\n\n`;
      } else if (command.appendText) {
        storyBody += `${command.appendText}\n<sup>${locales.getAttribution(this.BOT_LANG, command.author)}</sup>\n\n`;
      } else if (command.image) {
        storyBody += `${command.image}\n<sup>${locales.getAttribution(this.BOT_LANG, command.author)}</sup>\n\n`;
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
  getDelegatorTransferMemo(receiver, amount, storyNumber, sp) {
    return locales.getDelegatorTransferMemo(this.BOT_LANG)
      .replace('{{receiver}}', receiver)
      .replace('{{amount}}', amount.toFixed(3))
      .replace('{{sp}}', sp.toFixed(3))
      .replace('{{storyNumber}}', storyNumber);
  },
  getCuratorTransferMemo(receiver, amount, storyNumber, sbd) {
    return locales.getCuratorTransferMemo(this.BOT_LANG)
      .replace('{{receiver}}', receiver)
      .replace('{{amount}}', amount.toFixed(3))
      .replace('{{sbd}}', sbd.toFixed(3))
      .replace('{{storyNumber}}', storyNumber);
  },
  getRsharesToHBDFactor() {
    return new Promise((resolve, reject) => {
      // get reward fund for posts
      steem.api.getRewardFund('post', (err, fund) => {
        if (err) reject(err);
        else {
          const rewardBalance = parseFloat(fund.reward_balance.replace(' HIVE', ''));
          const recentClaims = parseInt(fund.recent_claims, 10);

          // get HBD price factor
          steem.api.getCurrentMedianHistoryPrice((errs, price) => {
            if (errs) reject(errs);
            else {
              const HBDPrice = parseFloat(price.base.replace(' HBD', ''));

              // calculate HBD value for each vote
              resolve(rewardBalance / recentClaims * HBDPrice);
            }
          });
        }
      });
    });
  },
  getStartPhrase() {
    return locales.getStartPhrase(this.BOT_LANG);
  },
  getEndPhrase() {
    return locales.getEndPhrase(this.BOT_LANG);
  },
  post(body, meta, storyNumber, day) {
    const title = locales.getPostTitle(this.BOT_LANG).replace('{{storyNumber}}', storyNumber).replace('{{day}}', day);
    const permlink = locales.getPostPermlink(this.BOT_LANG).replace('{{storyNumber}}', storyNumber).replace('{{day}}', day);

    meta.storyNumber = storyNumber;
    meta.day = day;
    meta.tags = this.BOT_TAGS.split(',').map(tag => tag.trim());
    meta.app = 'the-magic-story-machine/0.1';

    const extensions = locales.getBeneficiaries(this.BOT_LANG);
    const keys = {
      posting: this.BOT_KEY,
    };
    const operations = [
      [
        'comment',
        {
          parent_author: '',
          parent_permlink: meta.tags[0],
          author: this.BOT_ACCOUNT_NAME,
          permlink,
          title,
          body,
          json_metadata: JSON.stringify(meta),
        },
      ],
      [
        'comment_options',
        {
          author: this.BOT_ACCOUNT_NAME,
          permlink,
          max_accepted_payout: '1000000.000 HBD',
          percent_steem_dollars: 5000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions,
        },
      ],
      [
        'vote',
        {
          voter: this.BOT_ACCOUNT_NAME,
          author: this.BOT_ACCOUNT_NAME,
          permlink,
          weight: 10000,
        },
      ],
    ];

    if (this.BOT_PROD) {
      return steem.broadcast.sendAsync({
        extensions: [],
        operations,
      }, keys).catch((err) => {
        console.log(err);
      });
    }
  },
  upvote(options) {
    const {comment, weight} = options;
    return steem.api.getActiveVotesAsync(comment.author, comment.permlink)
      .filter(vote => vote.voter === this.BOT_ACCOUNT_NAME && vote.percent > 0)
      .then((votes) => {
        if (votes.length > 0) { // Already voted?
          return votes;
        }

        if (this.BOT_PROD) {
          return steem.broadcast.voteAsync(
            this.BOT_KEY, this.BOT_ACCOUNT_NAME, comment.author, comment.permlink, weight,
          ).then((results) => {
            // Handle results
          }).catch((error) => {
            // Handle voting error
          });
        }
      });
  },
  transfer(to, amount, memo) {
    if (this.BOT_PROD) {
      steem.broadcast.transfer(this.BOT_KEY, this.BOT_ACCOUNT_NAME, to, `${amount.toFixed(3)} HBD`, memo, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  },
};
