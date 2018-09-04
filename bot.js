// TODO: GLOBAL POT!!!!! (accross languages, monthly, yearly...)
// TODO: INIT SCRIPT!!! (Frogs all over the world! Set meta data on initial account post)

const helper = require('./helper');

// Allow self signed certs for dev
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

if (!helper.botAccountName || !helper.BOT_KEY || !helper.BOT_TAGS || !helper.BOT_LANG) {
  console.log('You forgot to set the necessary environment variables!');
  process.exit();
}

(async () => {
  console.log('');
  console.log(new Date());

  // get data from blockchain
  console.log('Fetching data...');
  const pot = await helper.getPot();
  const rsharesToSBDFactor = await helper.getRsharesToSBDFactor();
  const delegators = await helper.getDelegators();
  let account = await helper.getAccount();
  const posts = await helper.getPosts();
  let comments = [];
  for (let i = 0; i < posts.length; i += 1) {
    const meta = JSON.parse(posts[i].json_metadata);
    if (
      Object.prototype.hasOwnProperty.call(meta, 'day')
      && Object.prototype.hasOwnProperty.call(meta, 'storyNumber')
      && Object.prototype.hasOwnProperty.call(meta, 'commands')
      && Object.prototype.hasOwnProperty.call(meta, 'startPhrase')
      && Object.prototype.hasOwnProperty.call(meta, 'toBeContinued')
    ) {
      comments = await helper.getComments(posts[i].permlink);
      console.log(`Found ${posts.length} posts and ${comments.length} comments for latest post.`);
      break;
    }
  }

  // prepare data
  const allStoryPosts = helper.getAllStoryPosts(posts);
  const lastPost = allStoryPosts[0];
  const lastPostMeta = JSON.parse(lastPost.json_metadata);
  const storyHasEnded = helper.hasStoryEnded(lastPostMeta.commands);
  const currentStoryPosts = helper.getCurrentStoryPosts(allStoryPosts, lastPostMeta.storyNumber);
  const validComments = helper.getAllValidComments(comments, lastPostMeta.day > 10);
  const command = helper.getMostUpvotedCommand(validComments);

  // Get curators with the story number
  const curators = await helper.getCurators(lastPostMeta.storyNumber);

  // prepare reward distribution data
  const rewardableCommands = lastPostMeta.commands.filter(command => command.author !== 'the-fly-swarm'); // exclude guest account
  const luckyNumber = Math.floor(Math.random() * rewardableCommands.length);
  const winnerCommand = rewardableCommands[luckyNumber];
  const loserCommands = rewardableCommands.filter(
    command => command.author !== winnerCommand.author,
  );
  const singleLoserPot = pot.others / loserCommands.length;

  if (posts.length && account) {
    console.log(`Found ${currentStoryPosts.length} posts in current story.`);
    console.log(`Found ${validComments.length} valid commands for latest story post.`);
    console.log(`Most upvoted command: ${JSON.stringify(command)}`);
    console.log(`Pot value: ${pot.total}`);

    if (storyHasEnded) {
      // claim rewards and update account
      console.log('Claiming Rewards...');
      account = await helper.claimRewards(account);

      // distribute rewards if possible
      if (pot.total && parseFloat(account.sbd_balance) >= pot.total) {
        console.log('Distributing rewards.');
        console.log(`Aaaaand the winner is: ${winnerCommand.author}`);

        // transfer winner pot
        if (pot.winner >= 0.001) {
          console.log(`Transferring ${pot.winner.toFixed(3)} SBD to ${winnerCommand.author}...`);
          helper.transfer(winnerCommand.author, pot.winner, helper.getWinnerTransferMemo(
            winnerCommand.author, pot.winner, lastPostMeta.storyNumber,
          ));
        }

        // count contributions for each participant
        const loserTransfers = [];
        loserCommands.forEach((loserCommand) => {
          const existingIndex = loserTransfers.findIndex(
            transfer => transfer.author === loserCommand.author,
          );

          if (existingIndex !== -1) {
            loserTransfers[existingIndex].contributions += 1;
          } else {
            loserTransfers.push({
              author: loserCommand.author,
              contributions: 1,
            });
          }
        });

        loserTransfers.sort((a, b) => b.contributions - a.contributions);

        // transfer loser splitpot
        console.log('\nStoryteller Rewards:');
        loserTransfers.forEach((transfer) => {
          const amount = transfer.contributions * singleLoserPot;
          if (amount >= 0.001) {
            console.log(`@${transfer.author} | ${transfer.contributions} | ${((transfer.contributions / loserCommands.length) * 100).toFixed(2)}% | ${amount.toFixed(3)} SBD`);
            helper.transfer(transfer.author, amount, helper.getLoserTransferMemo(
              transfer.author, amount, lastPostMeta.storyNumber, transfer.contributions,
            ));
          }
        });

        // count total delegation
        let totalDelegation = 0;
        delegators.forEach((delegator) => {
          totalDelegation += delegator.sp;
        });

        // if there are delegators, calculate their rewards
        if (totalDelegation) {
          const delegatorTransfers = [];
          delegators.forEach((delegator) => {
            const percentage = delegator.sp / totalDelegation * 100;
            delegatorTransfers.push({
              delegator: delegator.delegator,
              percentage,
              amount: pot.delegators * percentage / 100,
              sp: delegator.sp,
            });
          });

          // transfer delegator splitpot
          console.log('\nDelegator Rewards:');
          delegatorTransfers.forEach((transfer) => {
            if (transfer.amount >= 0.001) {
              console.log(`@${transfer.delegator} | ${transfer.sp.toFixed(0)} | ${transfer.percentage.toFixed(2)}% | ${transfer.amount.toFixed(3)} SBD`);
              helper.transfer(
                transfer.delegator, transfer.amount, helper.getDelegatorTransferMemo(
                  transfer.delegator, transfer.amount, lastPostMeta.storyNumber, transfer.sp,
                ),
              );
            }
          });
        }

        // count total curation
        let totalCuration = 0;
        curators.forEach((curator) => {
          totalCuration += curator.rshares;
        });

        // if there are curators, calculate their rewards
        if (totalCuration) {
          const curatorTransfers = [];
          curators.forEach((curator) => {
            const percentage = curator.rshares / totalCuration * 100;
            curatorTransfers.push({
              curator: curator.voter,
              percentage,
              amount: pot.curators * percentage / 100,
              sbd: curator.rshares * rsharesToSBDFactor,
            });
          });

          // transfer curator splitpot
          console.log('\nCurator Rewards:');
          curatorTransfers.forEach((transfer) => {
            if (transfer.amount >= 0.001) {
              console.log(`@${transfer.curator} | ${transfer.percentage.toFixed(2)}% | ${transfer.amount.toFixed(3)} SBD`);
              helper.transfer(transfer.curator, transfer.amount, helper.getCuratorTransferMemo(
                transfer.curator, transfer.amount, lastPostMeta.storyNumber, transfer.sbd,
              ));
            }
          });
        }

        // start new story
        const intro = helper.getPostIntro(0);
        const footer = helper.getPostFooter();

        console.log('Story has ended. Starting a new one...');
        lastPostMeta.commands = [];
        helper.post(
          `${intro}\n\n# ${lastPostMeta.startPhrase}\n# \n\n## ${lastPostMeta.toBeContinued}\n\n${footer}`,
          lastPostMeta,
          lastPostMeta.storyNumber + 1,
          1,
        );
      } else {
        console.log('Master! There is not enough gold to distribute all the rewards!');
      }
    } else if (command) {
      // continue story
      lastPostMeta.commands.push(command);

      const intro = helper.getPostIntro(pot.total);
      const footer = helper.getPostFooter();

      const storyBody = helper.buildStoryBody(lastPostMeta.commands);

      if (command.type === 'end') {
        // publish last story post
        console.log('Story will end. Publishing last post...');
        helper.post(
          `${intro}\n\n# ${lastPostMeta.startPhrase}\n# \n\n${storyBody} \n\n### ${helper.getEndPhrase()}\n\n${footer}`,
          lastPostMeta,
          lastPostMeta.storyNumber,
          lastPostMeta.day + 1,
        );
      } else if (command.type === 'append') {
        // publish next story post
        console.log('Story goes on. Publishing next post...');
        helper.post(
          `${intro}\n\n# ${lastPostMeta.startPhrase}\n# \n\n${storyBody} \n\n## ${lastPostMeta.toBeContinued}${footer}`,
          lastPostMeta,
          lastPostMeta.storyNumber,
          lastPostMeta.day + 1,
        );
      }
    }

    // upvote comments
    if (validComments.length) {
      console.log(`Upvoting ${validComments.length} comments:`);

      // calculate voting weights:
      // - we assume that we start at 100% voting power every day
      // - and we don't want to go below 80% to be fully recovered the next day
      // - the post that just got published already got a 100% vote, so we are at 98% now
      // - the winner comment will also get a 100% vote, leaving us at 96% voting power
      // - (roughly, actually a bit more)
      // - if there are more comments (hopefully :D) then we have 16% voting power left
      // - until we went down to 80%
      // - those 16% will then be distributed across all remaining comments
      // - if there are not that many comments, they will also receive a 100% vote

      // get the first/winning comment (removing it from the array) and vote at 100%
      const winningComment = validComments.shift();
      console.log(`Upvoting winner: @${winningComment.author}/${winningComment.permlink} (Weight: 100%)`);
      helper.votingQueue.push({comment: winningComment, weight: 10000});

      // if there are comments left... do some math and then vote
      if (validComments.length) {
        const weight = Math.min(((16 / validComments.length) / 2 * 100), 100).toFixed(2) * 100;
        validComments.forEach((comment) => {
          console.log(`Upvoting: @${comment.author}/${comment.permlink} (Weight: ${weight / 100} %)`);
          helper.votingQueue.push({comment, weight});
        });
      }

      // start processing voting queue
      const voteInterval = setInterval(() => {
        const options = helper.votingQueue.shift();
        if (options) {
          helper.upvote(options).then(() => {
            if (helper.votingQueue.length === 0) {
              clearInterval(voteInterval)
            }
          }).catch(() => {
            // If there's an error, just push it back on the stack and retry it
            helper.votingQueue.push(options);
          });
        }
      }, 5000);
    }
  }
})();
