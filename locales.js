// TODO: add discord link to footer

module.exports = {
  getIntro(lang) {
    switch (lang) {
      case 'en':
        return `<center>
![avatar.png](https://steemitimages.com/DQmeK9D1q35gERzGWfQBD9MKGzuU5wjDNSM1q561dbGxdmL/avatar.png)
</center>

### <center>It's me again...<br>The Magic Frog</center>
## <center>[Read my story](https://steemit.com/introduceyourself/@the-magic-frog/this-is-the-magic-story-machine-help-the-not-so-magic-frog-collaborative-storytelling-click-it-there-s-money-to-win)</center>
##

<center>The Pot full of Gold:<br>[**$ {{pot}}**](https://the-magic-frog.com)<br><sup>(Cast your Upvote Spell on this post to raise the pot!)</sup></center>`;
      case 'de':
        return `<center>
![avatar.png](https://steemitimages.com/DQmeK9D1q35gERzGWfQBD9MKGzuU5wjDNSM1q561dbGxdmL/avatar.png)
</center>

### <center>Ich bin's wieder...<br>Der Zauberfrosch</center>
## <center>[Lies meine Geschichte](https://steemit.com/themagicfrog/@der-zauberfrosch/die-magische-geschichtenmaschine-hilf-dem-nicht-ganz-so-magischen-zauberfrosch-und-gewinne-einen-topf-voll-gold)</center>
##

<center>Der Topf voll Gold:<br>[**$ {{pot}}**](https://de.the-magic-frog.com)<br><sup>(Wirke deinen Upvote-Zauber auf diesen Post, um den Pot zu erhöhen!)</sup></center>`;
      case 'fr':
        return `<center>
![avatar.png](https://steemitimages.com/DQmeK9D1q35gERzGWfQBD9MKGzuU5wjDNSM1q561dbGxdmL/avatar.png)
</center>

### <center>C'est encore moi...<br>La grenouille magique</center>
## <center>[Lis mon histoire](https://steemit.com/introduceyourself/@grenouille/voici-la-mysterieuse-machine-a-histoire-aidez-la-grenouille-pas-si-magique-et-gagnez-un-pot-plein-d-or-narration-collective)</center>
##

<center>Le Pot plein d'Or:<br>[**$ {{pot}}**](https://fr.the-magic-frog.com)<br><sup>(Jetez votre sort en votant sur cet article pour élever le pot!)</sup></center>`;
    }
  },
  getFooter(lang) {
    switch (lang) {
      case 'en':
        return `

<hr>

### <center><sup>To participate visit:</sup><br>[the-magic-frog.com](https://the-magic-frog.com)</center>
###

<center><sup>If you want to support this project feel free to **upvote** and **resteem** this post and **follow @the-magic-frog** but most important... **participate!**</sup></center>

<hr>

# <center>ATTENTION!!!</center>
### <center>Please do not edit your submissions on any other platform than [the-magic-frog.com](https://the-magic-frog.com)! Editing it elsewhere will have no effect! In addition to that, we just discovered a very annoying bug on busy.org that completely invalidates your submission after editing!</center>`;
      case 'de':
        return `

<hr>

### <center><sup>Um teilzunehmen besuche:</sup><br>[de.the-magic-frog.com](https://de.the-magic-frog.com)</center>
###

<center><sup>Wenn du dieses Projekt unterstützen möchtest, upvote und teile diesen Post und folge natürlich [dem Zauberfrosch](https://steemit.com/@der-zauberfrosch). Das Wichtigste ist aber, dass du **teilnimmst**!</sup></center>

<hr>

# <center>ACHTUNG!!!</center>
### <center>Bitte bearbeitet eure Einreichungen ausschließlich auf [the-magic-frog.com](https://the-magic-frog.com)! Auf jeder anderen Platform hat das Bearbeiten des Kommentars keinen Effekt! Außerdem haben wir soeben einen sehr nervigen Bug auf busy.org entdeckt, der eure Einreichung nach dem Bearbeiten komplett ungültig macht!</center>`;
      case 'fr':
        return `

<hr>

### <center><sup>Pour participer, visitez: </sup><br>[fr.the-magic-frog.com](https://fr.the-magic-frog.com)</center>
###

<center><sup>Si vous voulez soutenir ce projet, n'hésitez pas à **voter** et **resteem** cet article et **suivez la @grenouille magique** mais le plus important est de... **participer!**</sup></center>

<hr>

# <center>ATTENTION!!!</center>
### <center>Veuillez ne pas modifier vos soumissions sur une autre plateforme que sur [fr.the-magic-frog.com](https://fr.the-magic-frog.com)! L'éditer ailleurs n'aura pas l'effet désiré! En plus de cela, nous venons de découvrir un bug très ennuyeux sur busy.org qui invalide complètement votre soumission après l'édition.</center>`;
    }
  },
  getWinnerTransferMemo(lang) {
    switch (lang) {
      case 'en':
        return `Congratulations @{{receiver}}! The Magic Story #{{storyNumber}} has ended and you won half of the pot! That\'s {{amount}} SBD. Wow! Thanks for participating!`;
      case 'de':
        return `Herzlichen Glückwunsch @{{receiver}}! Die Magische Geschichte #{{storyNumber}} ist zu ende und du hast den ganzen halben Pot gewonnen! Das macht {{amount}} SBD. Wow! Danke für deine Teilnahme!`;
      case 'fr':
        return `Félicitations @{{receiver}}! L'histoire magique #{{storyNumber}} est terminée et vous avez gagné la moitié du pot! Cela représente {{amount}} SBD. Hou la la! Merci d'avoir participé!`;
    }
  },
  getLoserTransferMemo(lang) {
    switch (lang) {
      case 'en':
        return `Hey @{{receiver}}! The Magic Story #{{storyNumber}} has ended and you contributed {{contributionCount}} times! That makes {{amount}} SBD for you. Wow! Thanks for participating!`;
      case 'de':
        return `Hey @{{receiver}}! Die Magische Geschichte #{{storyNumber}} ist zu ende und du hast es {{contributionCount}} mal in die Geschichte geschafft! Das macht {{amount}} SBD für dich. Wow! Danke für deine Teilnahme!`;
      case 'fr':
        return `Allô @{{receiver}}! L'histoire magique #{{storyNumber}} est terminée et vous avez contribué {{contributionCount}} fois! Cela représente {{amount}} SBD pour vous. Hou la la! Merci d'avoir participé!`;
    }
  },
  getDelegatorTransferMemo(lang) {
    switch (lang) {
      case 'en':
        return `Hey @{{receiver}}! The Magic Story #{{storyNumber}} has ended and you delegated {{sp}} SP to @the-magic-frog! That makes {{amount}} SBD for you. Wow! Thanks for the support`;
      case 'de':
        return `Hey @{{receiver}}! Die Magische Geschichte #{{storyNumber}} ist zu ende und du hast {{sp}} SP an @der-zauberfrosch delegiert! Das macht {{amount}} SBD für dich. Wow! Danke für den Support!`;
      case 'fr':
        return `Allô @{{receiver}}! L'histoire magique #{{storyNumber}} est terminée et vous avez délégué {{sp}} SP à la @grenouille magique! Cela représente {{amount}} SBD pour vous. Hou la la! Merci pour votre support!`;
    }
  },
  getPostTitle(lang) {
    switch (lang) {
      case 'en':
        return 'The Magic Story #{{storyNumber}} Day {{day}}';
      case 'de':
        return 'Die Magische Geschichte #{{storyNumber}} Tag {{day}}';
      case 'fr':
        return 'Histoire Magique #{{storyNumber}} Jour {{day}}';
    }
  },
  getPostPermlink(lang) {
    switch (lang) {
      case 'en':
        return 'the-magic-story-{{storyNumber}}-day-{{day}}-' + (new Date()).getTime();
      case 'de':
        return 'die-magische-geschichte-{{storyNumber}}-tag-{{day}}-' + (new Date()).getTime();
      case 'fr':
        return 'histoire-magique-{{storyNumber}}-jour-{{day}}-' + (new Date()).getTime();
    }
  },
  getAttribution(lang, author) {
    switch (lang) {
      case 'en':
        return '(by @' + author + ')';
      case 'de':
        return '(von @' + author + ')';
      case 'fr':
        return '(par @' + author + ')';
    }
  },
  getBeneficiaries(lang) {
    switch (lang) {
      case 'en':
      case 'de':
        return [[0, {
          beneficiaries: [
            {
              account: 'mkt',
              weight: 500
            }
          ]
        }]];
      case 'fr':
        return [[0, {
          beneficiaries: [
            {
              account: 'mkt',
              weight: 100
            },
            {
              account: 'helo',
              weight: 400
            }
          ]
        }]];
    }
  }
}
