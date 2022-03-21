const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '',
        pass: ''
    }
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.dailyEmail = functions.pubsub.schedule('0 7 * * *').timeZone("America/New_York").onRun(async (context) => {
    functions.logger.info("Beginning Run with context: " + context, {structuredData: true});

    functions.logger.info("Finding all wordles from yesterday", {structuredData: true});
    const wordle = 269 + (((new Date(new Date().toLocaleDateString()).getTime()) - (new Date("3/15/2022")).getTime()) / (1000 * 3600 * 24)) - 1;
    functions.logger.info("Wordle : " + wordle, {structuredData: true});

    let wordleResults = [];
    await admin.firestore().collection('daily_results').where('wordle', '==', wordle).orderBy('guess', "asc").orderBy('submissionTime').get()
        .then((result) => {
            //If result exists
            if (result !== undefined && result.length !== 0) {
                //For each resulting doc that downloads
                result.forEach((doc) => {
                    //Extract data from doc
                    doc = doc.data();
                    //And create a card for each doc
                    wordleResults.push(doc);
                });
            }
            //Catch firestore errors
        }).catch((error) => {
            console.log(error);
        });

    //If results is empty, do not continue
    if (wordleResults.length === 0) {
        functions.logger.info("No responses found, do not continue to send", {structuredData: true});
        return null;
    }

    functions.logger.info("Finding all Emails", {structuredData: true});
    let emailResults = [];
    await admin.firestore().collection('emails').get()
        .then((result) => {
            //If result exists
            if (result !== undefined && result.length !== 0) {
                //For each resulting doc that downloads
                result.forEach((doc) => {
                    //Extract data from doc
                    doc = doc.data();
                    //And create a card for each doc
                    emailResults.push(doc['email']);
                });
            }
            //Catch firestore errors
        }).catch((error) => {
            console.log(error);
        });

    //If results is empty, do not continue
    if (emailResults.length === 0) {
        functions.logger.info("No emails found, do not continue to send", {structuredData: true});
        return null;
    }

    functions.logger.info("Setting up Email", {structuredData: true});
    let wordleString = ""
    wordleResults.forEach(doc => {
        wordleString += formatWordleResult(doc);
    });
    const resultHTML = formatFullEmail(wordleString);
    const msg = {
        to: emailResults,
        from: "Alex Hover <ahover307@gmail.com>",
        subject: 'The Daily Wordle Report',
        html: resultHTML,
    }

    functions.logger.info("Sending Email", {structuredData: true});
    // sgMail.send(msg).then(() => {
    //     functions.logger.info("Email sent", {structuredData: true});
    // }).catch((error) => {
    //     functions.logger.error("Email failed to send: " + error, {structuredData: true});
    // })
    await transporter.sendMail(msg, (error, info) => {
        if (error) {
            functions.logger.error("There was an error: " + error.toString(), {structuredDate: true});
        }
    });
    functions.logger.info("Email sent", {structuredData: true});
    return null;
});

function formatFullEmail(wordleHTMLList) {
    return (
        "<div>" +
        "Yesterday's Wordle results were submitted as follows." +
        "<table>" +
        "<tr>" +
        "<th>Name and Message</th>" +
        "<th>Results</th>" +
        "</tr>" +
        wordleHTMLList +
        "</table>" +
        "</div>"
    )
}

function formatWordleResult(doc) {
    let resultRows = "";
    doc['result'].split("\n").forEach(line => {
        resultRows +=
            "<tr style='text-align: center'>" +
            "<td style='text-align: center'>" + line + "</td>" +
            "</tr>"
    });
    return "<tr>" +
        "<td>" +
        "<table>" +
        "<tr>" +
        "<td>" +
        "<strong>" +
        doc['user'] +
        "</strong>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td>" + doc['message'] + "</td>" +
        "</tr>" +
        "</table>" +
        "</td>" +
        "<td style='text-align: center'>" +
        "<table style='text-align: center'>" +
        resultRows +
        "</table>" +
        "</td>" +
        "</tr>"
}