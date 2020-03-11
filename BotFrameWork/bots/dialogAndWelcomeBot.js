// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Author: Leslie Correa

const { InputHints } = require('botbuilder');
const { DialogBot } = require('./dialogBot');

class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog) {
        super(conversationState, userState, dialog);
        

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;

            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                 if (membersAdded[cnt].id === context.activity.recipient.id) {
                    const msg = 'Hello, I am AutoBot, your virtual assistant.';
                    const msg2 = 'Kindly upload the order bill to continue with the feedback process.';  
                    await context.sendActivity(msg, msg, InputHints.IgnoringInput);
                    await context.sendActivity(msg2, msg2, InputHints.IgnoringInput);
                    await dialog.run(context, conversationState.createProperty('DialogState'));
                 }
            }
            await next();
        });
    }
}

module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
