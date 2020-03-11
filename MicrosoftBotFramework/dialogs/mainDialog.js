// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { MessageFactory, InputHints, CardFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai'); // Use if LUIS is needed
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog, AttachmentPrompt } = require('botbuilder-dialogs');
const axios = require('axios');
const utils = require('./utils');
const image2base64 = require('image-to-base64');
const happyCard = require('../bots/resources/happy.json');
const sadCard = require('../bots/resources/sad.json');
const neutralCard = require('../bots/resources/neutral.json');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
let userName = '';
let items = [];


class MainDialog extends ComponentDialog {
        constructor() {
        super('MainDialog');

        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new AttachmentPrompt('AttachmentPrompt'))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.attachment.bind(this),
                this.options.bind(this),
                this.description.bind(this),
                this.thankYou.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async attachment(stepContext) {
        console.log('stepContext: ',JSON.stringify(stepContext));
        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : 'Kindly upload the order bill to continue with the feedback process.';
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('AttachmentPrompt');
    }


    async options(stepContext) {
        console.log('stepContext: ',JSON.stringify(stepContext));
        if (stepContext.context._activity.attachments && stepContext.context._activity.attachments.length > 0) {
            const url = stepContext.context._activity.attachments[0].contentUrl;
            const fileName = stepContext.context._activity.attachments[0].name;
            await image2base64(url).then(async (response) => {
                console.log('response ', response);
                let details = await SendImage(response);
                console.log('jsonData: ',details.data);
                items = details.data.items;  
                userName = details.data.name;
                     }).catch(async (error) => {
                         console.log(error);
                            return await stepContext.context.sendActivity('Something went wrong! Please try after sometime');
            })
        }
        
        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : 'Hello! ' + userName +'. Please mention the food item to describe about.'; // Change name and content
        const promptMessage = MessageFactory.suggestedActions(items, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
    }


    async description(stepContext) {
        console.log('stepContext: ',JSON.stringify(stepContext));
        if (items.includes(stepContext.result)) {
           const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : 'What\'s the feedback/concern you want to mention? Kindly describe.';
           const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
           // Send description to server
           return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
        } else {
            return await stepContext.replaceDialog(MAIN_WATERFALL_DIALOG);
        }
    }


    async thankYou(stepContext) {
        console.log('stepContext: ',JSON.stringify(stepContext));
        if (stepContext.result) {
           return await SendForAnalysis(stepContext);  
        }
    }
}

async function SendImage(image){
    var img = '?data=image/png;base64,' + image;
    var output = {};
    const headers = {
        'Content-Type': 'application/json'
      }
    await axios.post('Your RPA link',  {
        data: image
      },{
        headers: headers
      })
      .then((response) => {
        console.log(response);
        output = response
        
    })
    .catch((error) => {
        console.log("Error");
       })

      return output;

}

async function SendForAnalysis(stepContext){
    console.log('stepContext: ',JSON.stringify(stepContext));
    const userDescription = stepContext.result;
    var data = {
        "documents": [
          {
            "language": "en",
            "id": "1",
            "text": userDescription
          }
        ]
      }

    const headers = { 
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': 'Your key'
      }
      
    var output = {}
     await axios.post('Your sentiment analysis URL', data, {
          headers: headers
        })
        .then((response) => {
            console.log(response);
            output = response
            
        })
        .catch((error) => {
         console.log("Error");
        })
        let sentimentAnalysis = await output.data.documents[0].sentences[0].sentiment;
        console.log('sentiment: ',sentimentAnalysis);
        const headersSend = {
            'Content-Type': 'application/json'
          }

        await axios.post('Your create ticket link',  { 
            caller: userName,
            short_description: userDescription,
            sentiment: sentimentAnalysis
      },{
        headers: headersSend
      })
      .then((response) => {
        console.log(response);
        output = response
        
    })
    .catch((error) => {
        console.log("Error");
       })
        let message = '';
        let sentimentCard;
        if (sentimentAnalysis === 'positive') {
            message = 'Yippie! We are glad to keep your tummy satisfied. Visit again.';
            sentimentCard = happyCard;
        }
        else if (sentimentAnalysis === 'negative') {
            message = 'Uh oh! Sorry for the trouble.\nWe have raised a ticket regarding the issue and you will receive a mail regarding the feedback.\nVisit again to experience better service.';
            sentimentCard = sadCard;
        }
        else {
            message = 'Thank you for your feedback.\nWe have raised a ticket regarding the issue and you will receive a mail regarding the feedback.\nWe\'ll definitely make it better for you next time. Visit again.';
            sentimentCard = neutralCard;
        }
        const card = CardFactory.adaptiveCard(sentimentCard);
        await stepContext.context.sendActivity({ attachments: [card] });
        return await stepContext.context.sendActivity(message, message, InputHints.IgnoringInput);   
}

module.exports.MainDialog = MainDialog;
