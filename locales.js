// TODO: add discord link to footer

module.exports = {
  getIntro(lang) {
    switch (lang) {
      case 'en':
      default:
        return `<center>
![avatar.png](https://the-magic-frog.com/avatar.png?1)
</center>
### <center>It's me again...<br>The Magic Frog</center>
<center>([About me](https://hive.blog/introduceyourself/@the-magic-frog/this-is-the-magic-story-machine-help-the-not-so-magic-frog-collaborative-storytelling-click-it-there-s-money-to-win))</center>
##
## <center>The Pot full of Gold:</center>
<center>![pot.png](https://the-magic-frog.com/pot.png?1)</center>
# <center>[**$ {{pot}}**](https://the-magic-frog.com)</center>
<center><sup>(Cast your Upvote Spell on this post to raise the pot!)</sup></center>`;
      case 'de':
        return `<center>
![avatar.png](https://the-magic-frog.com/avatar.png?1)
</center>
### <center>Ich bin's wieder...<br>Der Zauberfrosch</center>
<center>([Über mich](https://hive.blog/themagicfrog/@der-zauberfrosch/die-magische-geschichtenmaschine-hilf-dem-nicht-ganz-so-magischen-zauberfrosch-und-gewinne-einen-topf-voll-gold))</center>
##
## <center>Der Topf voll Gold:</center>
<center>![pot.png](https://the-magic-frog.com/pot.png?1)</center>
# <center>[**$ {{pot}}**](https://de.the-magic-frog.com?1)</center>
<center><sup>(Wirke deinen Upvote-Zauber auf diesen Post, um den Pot zu erhöhen!)</sup></center>`;
      case 'fr':
        return `<center>
![avatar.png](https://the-magic-frog.com/avatar.png?1)
</center>
### <center>C'est encore moi...<br>La grenouille magique</center>
<center>([À propos de moi](https://hive.blog/introduceyourself/@grenouille/voici-la-mysterieuse-machine-a-histoire-aidez-la-grenouille-pas-si-magique-et-gagnez-un-pot-plein-d-or-narration-collective))</center>
##
## <center>Le Pot plein d'Or:</center>
<center>![pot.png](https://the-magic-frog.com/pot.png?1)</center>
# <center>[**$ {{pot}}**](https://fr.the-magic-frog.com)</center>
<center><sup>(Jetez votre sort en votant sur cet article pour élever le pot!)</sup></center>`;
      case 'pt':
        return `<center>
![avatar.png](https://the-magic-frog.com/avatar.png?1)
</center>
### <center>Sou eu novamente...<br>O Sapo Mágico</center>
<center>([Sobre mim](https://hive.blog/introduceyourself/@sapo-magico/esta-e-a-maquina-magica-de-estorias-ajude-o-nao-tao-sapo-magico-e-ganhe-um-pote-cheio-de-ouro-narrativa-colaborativa))</center>
##
## <center>O pote cheio de ouro:</center>
<center>![pot.png](https://the-magic-frog.com/pot.png?1)</center>
# <center>[**$ {{pot}}**](https://pt.the-magic-frog.com)</center>
<center><sup>(Lança seu feitiço de Upvote neste post para aumentar o pote!)</sup></center>`;
    }
  },
  getFooter(lang) {
    switch (lang) {
      case 'en':
      default:
        return `
<hr>\n

### <center><sup>To participate visit:</sup><br>[the-magic-frog.com](https://the-magic-frog.com)</center>
###

<center><sup>If you want to support this project feel free to **upvote** and **reblog** this post and **follow @the-magic-frog** but most important... **participate!**</sup></center>

<hr>\n

# <center>ATTENTION!!!</center>
### <center>Please do not edit your submissions on any other platform than [the-magic-frog.com](https://the-magic-frog.com)! Editing it elsewhere will have no effect!</center>`;
      case 'de':
        return `
<hr>\n

### <center><sup>Um teilzunehmen besuche:</sup><br>[de.the-magic-frog.com](https://de.the-magic-frog.com)</center>
###

<center><sup>Wenn du dieses Projekt unterstützen möchtest, upvote und teile diesen Post und folge natürlich [dem Zauberfrosch](https://hive.blog/@der-zauberfrosch). Das Wichtigste ist aber, dass du **teilnimmst**!</sup></center>

<hr>\n

# <center>ACHTUNG!!!</center>
### <center>Bitte bearbeitet eure Einreichungen ausschließlich auf [the-magic-frog.com](https://the-magic-frog.com)! Auf jeder anderen Platform hat das Bearbeiten des Kommentars keinen Effekt!</center>`;
      case 'fr':
        return `
<hr>\n

### <center><sup>Pour participer, visitez: </sup><br>[fr.the-magic-frog.com](https://fr.the-magic-frog.com)</center>
###

<center><sup>Si vous voulez soutenir ce projet, n'hésitez pas à **voter** et **reblog** cet article et **suivez la @grenouille magique** mais le plus important est de... **participer!**</sup></center>

<hr>\n

# <center>ATTENTION!!!</center>
### <center>Veuillez ne pas modifier vos soumissions sur une autre plateforme que sur [fr.the-magic-frog.com](https://fr.the-magic-frog.com)! L'éditer ailleurs n'aura pas l'effet désiré!</center>`;
      case 'pt':
        return `
<hr>\n

### <center><sup>Para participar visite:</sup><br>[pt.the-magic-frog.com](https://pt.the-magic-frog.com)</center>
###

<center><sup>Se você quiser apoiar este projeto, sinta-se à vontade para **upvote** e **reblog** este post e **siga @sapo-magico** mas o mais importante... **participe!**</sup></center>

<hr>\n

# <center>ATENÇÃO!!!</center>
### <center>Por favor, não edite seus envios em qualquer outra plataforma [pt.the-magic-frog.com](https://pt.the-magic-frog.com)! Editá-lo em outro lugar não terá efeito!</center>`;
    }
  },
  getWinnerTransferMemo(lang) {
    switch (lang) {
      case 'en':
      default:
        return 'Congratulations @{{receiver}}! The Magic Story #{{storyNumber}} has ended and you won half of the pot! That\'s {{amount}} HBD. Wow! Thanks for participating!';
      case 'de':
        return 'Herzlichen Glückwunsch @{{receiver}}! Die Magische Geschichte #{{storyNumber}} ist zu ende und du hast den ganzen halben Pot gewonnen! Das macht {{amount}} HBD. Wow! Danke für deine Teilnahme!';
      case 'fr':
        return 'Félicitations @{{receiver}}! L\'histoire magique #{{storyNumber}} est terminée et vous avez gagné la moitié du pot! Cela représente {{amount}} HBD. Hou la la! Merci d\'avoir participé!';
      case 'pt':
        return 'Parabéns @{{receiver}}! A Estória Mágica #{{storyNumber}} terminou e você ganhou metade do pote! Isso é {{amount}} HBD. Wow! Obrigado por participar!';
    }
  },
  getLoserTransferMemo(lang) {
    switch (lang) {
      case 'en':
      default:
        return 'Hey @{{receiver}}! The Magic Story #{{storyNumber}} has ended and you contributed {{contributionCount}} times! That makes {{amount}} HBD for you. Wow! Thanks for participating!';
      case 'de':
        return 'Hey @{{receiver}}! Die Magische Geschichte #{{storyNumber}} ist zu ende und du hast es {{contributionCount}} mal in die Geschichte geschafft! Das macht {{amount}} HBD für dich. Wow! Danke für deine Teilnahme!';
      case 'fr':
        return 'Allô @{{receiver}}! L\'histoire magique #{{storyNumber}} est terminée et vous avez contribué {{contributionCount}} fois! Cela représente {{amount}} HBD pour vous. Hou la la! Merci d\'avoir participé!';
      case 'pt':
        return 'Hey @{{receiver}}! A Estória Mágica #{{storyNumber}} terminou e você contribuiu{{contributionCount}}vezes! Isto rendeu {{amount}} HBD para você. Wow! Obrigado por participar!';
    }
  },
  getDelegatorTransferMemo(lang) {
    switch (lang) {
      case 'en':
      default:
        return 'Hey @{{receiver}}! The Magic Story #{{storyNumber}} has ended and you delegated {{sp}} SP to @the-magic-frog! That makes {{amount}} HBD for you. Wow! Thanks for the support!';
      case 'de':
        return 'Hey @{{receiver}}! Die Magische Geschichte #{{storyNumber}} ist zu ende und du hast {{sp}} SP an @der-zauberfrosch delegiert! Das macht {{amount}} HBD für dich. Wow! Danke für den Support!';
      case 'fr':
        return 'Allô @{{receiver}}! L\'histoire magique #{{storyNumber}} est terminée et vous avez délégué {{sp}} SP à la @grenouille magique! Cela représente {{amount}} HBD pour vous. Hou la la! Merci pour votre support!';
      case 'pt':
        return 'Hey @{{receiver}}! A Estória Mágica #{{storyNumber}} terminou e você delegou {{sp}} SP para @sapo-magico! Isto rendeu  {{amount}} HBD para você. Wow! Obrigado por participar!';
    }
  },
  getCuratorTransferMemo(lang) {
    switch (lang) {
      case 'en':
      default:
        return 'Hey @{{receiver}}! The Magic Story #{{storyNumber}} has ended and with your upvotes you added {{sbd}} HBD to the pot! In return you get {{amount}} HBD back. Wow! Thanks for the support!';
      case 'de':
        return 'Hey @{{receiver}}! Die Magische Geschichte #{{storyNumber}} ist zu ende und du hast mit deinen Upvotes {{sbd}} HBD zum Pot beigesteuert! Dafür bekommst du nun {{amount}} HBD für zurück. Wow! Danke für den Support!';
      case 'fr':
        return 'Allô @{{receiver}}! L\'histoire magique #{{storyNumber}} est terminée et vos votes ont contribués {{sbd}} HBD au pot! Et en retour vous receverez {{amount}} HBD. Hou la la! Merci pour votre support!';
      case 'pt':
        return 'Hey @{{receiver}}! A Estória Mágica #{{storyNumber}} terminou e com o seu upvote você adicionou {{sbd}} HBD para o pote! Em retorno você recebe {{amount}} HBD de volta. Wow! brigado por participar!';
    }
  },
  getPostTitle(lang) {
    switch (lang) {
      case 'en':
      default:
        return 'The Magic Story #{{storyNumber}} Day {{day}}';
      case 'de':
        return 'Die Magische Geschichte #{{storyNumber}} Tag {{day}}';
      case 'fr':
        return 'Histoire Magique #{{storyNumber}} Jour {{day}}';
      case 'pt':
        return 'A Estória Mágica #{{storyNumber}} Dia {{day}}';
    }
  },
  getPostPermlink(lang) {
    switch (lang) {
      case 'en':
      default:
        return `the-magic-story-{{storyNumber}}-day-{{day}}-${(new Date()).getTime()}`;
      case 'de':
        return `die-magische-geschichte-{{storyNumber}}-tag-{{day}}-${(new Date()).getTime()}`;
      case 'fr':
        return `histoire-magique-{{storyNumber}}-jour-{{day}}-${(new Date()).getTime()}`;
      case 'pt':
        return `a-estoria-magica-{{storyNumber}}-dia-{{day}}-${(new Date()).getTime()}`;
    }
  },
  getAttribution(lang, author) {
    switch (lang) {
      case 'en':
      default:
        return `(by @${author})`;
      case 'de':
        return `(von @${author})`;
      case 'fr':
        return `(par @${author})`;
      case 'pt':
        return `(por @${author})`;
    }
  },
  getStartPhrase(lang) {
    switch (lang) {
      case 'en':
      default:
        return 'Once upon a time...';
      case 'de':
        return 'Es war ein mal...';
      case 'fr':
        return 'Il était une fois...';
      case 'pt':
        return 'Era uma vez...';
    }
  },
  getEndPhrase(lang) {
    switch (lang) {
      case 'en':
      default:
        return 'The End!';
      case 'de':
        return 'Ende!';
      case 'fr':
        return 'La fin!';
      case 'pt':
        return 'Fim!';
    }
  },
  getBeneficiaries(lang) {
    switch (lang) {
      case 'en':
      case 'de':
      default:
        return [[0, {
          beneficiaries: [
            {
              account: 'mkt',
              weight: 500,
            },
          ],
        }]];
      case 'fr':
        return [[0, {
          beneficiaries: [
            {
              account: 'mkt',
              weight: 100,
            },
            {
              account: 'helo',
              weight: 400,
            },
          ],
        }]];
      case 'pt':
        return [[0, {
          beneficiaries: [
            {
              account: 'mkt',
              weight: 100,
            },
            {
              account: 'juniorfrederico',
              weight: 400,
            },
          ],
        }]];
    }
  },
};
