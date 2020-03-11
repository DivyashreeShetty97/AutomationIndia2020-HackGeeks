# Automation India 2020-HackGeeks
Automated feedback system using Automation Anywhere and MS Azure

## QuickFed Solution by HackGeeks team

'QuickFed' is an automated feedback system built using Automation Anywhere and MS Azure. It overcomes the problem of installing an app or calling the service centre to give a feedback on a restaurant. Our bot is accessed by just scanning the QR code and submitting the order bill.

The details mentioned in the order bill is extracted by Microsoft OCR (service under Computer Vision API) which is invoked by the RPA bot using Automation Anywhere. Customised greetings are sent by the bot by addressing the user by his name from the data extracted from the bill and items are displayed as buttons for easy inputs. The feedback/description send by the user is subjected to sentiment analysis and a confirmation is sent to user's mail respectively.

If it's a positive feedback, the user gets a 'Thank you' mail. Otherwise, a mail displaying appropriate message, with promise to improve, is sent and a issue is raised to the team in ServiceNow with all the details.

<p>
  <img src="https://github.com/DivyashreeShetty97/AutomationIndia2020-HackGeeks/blob/master/Images/quickfed.PNG" width="800" height="400" alt="">
<p>

## Architecture

<p>
  <img src="https://github.com/DivyashreeShetty97/AutomationIndia2020-HackGeeks/blob/master/Images/architecture.PNG" width="800" height="400" alt="Architecture">
<p>
  
## Authors

* **Leslie Correa** - *Contributor* - [LeslieCorrea](https://github.com/LeslieCorrea)


## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/LeslieCorrea/Xamarin-Forms-Shopping-Cart/blob/master/LICENSE) file for details.
