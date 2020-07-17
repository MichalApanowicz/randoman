// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory, CardFactory } = require("botbuilder");

class RandomanBot extends ActivityHandler {
  async reply(context, replyText) {
    await context.sendActivity(MessageFactory.text(replyText, replyText));
    await next();
  }

  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  constructor() {
    super();
    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    this.onMessage(async (context, next) => {
      const inputText = context.activity.text;

      const regexRange = /\d+\-\d+/g;
      const regexList = /(\w*\;\w*)+/g;

      const range = regexRange.test(inputText);
      const list = regexList.test(inputText);

      let replyText = "Nie rozumiem.";
      if (range) {
        const [min, max] = inputText
          .match(regexRange)[0]
          .split("-")
          .map((s) => parseInt(s));

        if (min >= max) {
          replyText = "Podaj prawidłowe liczby.";
        } else {
          replyText = `Wylosowałem liczbę: ${this.randomNumber(min, max)}`;
        }
      } else if (list) {
        const array = inputText
          .match(regexList)[0]
          .split(";")
          .map((s) => s.trim())
          .filter((s) => !!s);
        replyText = `Wylosowałem: ${
          array[this.randomNumber(0, array.length - 1)]
        } z ${array}`;
      }

      context.sendActivity(MessageFactory.text(replyText, replyText));
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;

      for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          const welcomeText = `Co dziś losujemy ${membersAdded[cnt].name}?`;
          await context.sendActivity(
            MessageFactory.text(welcomeText, welcomeText)
          );
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}

module.exports.RandomanBot = RandomanBot;
