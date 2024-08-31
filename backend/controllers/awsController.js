const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const SES_CONFIG = {
    credentials:{
    accessKeyId:process.env.AWS_KEY,
    secretAccessKey:process.env.AWS_SEC    
},
    region:process.env.AWS_REGION
}

//Create SES service object
const sesClient = new SESClient(SES_CONFIG); 



const createSendEmailCommand = (toAddress, head,subject,Message) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: `
          <div style="">
           ${Message}
            </div>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: subject?subject:'Card Casa Internship Tracker',
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject?subject:`Verify Email! Internship-Tracker`,
      },
    },
    Source: process.env.Email_Sender,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

exports.run = async (toAddress,head,subject,message) => {
  const sendEmailCommand = createSendEmailCommand(
    `${toAddress}`,
    `${head}`,
    `${subject}`,
    `${message}`,
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.");
    return e;
  }
};


