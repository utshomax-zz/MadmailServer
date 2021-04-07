'use strict'
const fastify = require('fastify')({ logger: true })
const origins = (process.env.ORIGINS ? process.env.ORIGINS.split(',') : ['http://localhost:3000/','https://localhost:3000','http://localhost:3000','http://127.0.0.1:3000'])
fastify.register(require('fastify-cors'),{
  origin:origins,
  credentials:'include',
})

const user = process.env.USERNAME ;  //your username
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID ;  //your client id
const CLEINT_SECRET = process.env.CLEINT_SECRET; //your client secret
const REDIRECT_URI = process.env.REDIRECT_URI ;  //https://developers.google.com/oauthplayground
const REFRESH_TOKEN = process.env.REFRESH_TOKEN ;  //your refresh token

const nodemailer = require('nodemailer');
const { google } = require('googleapis');



const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(mailopt) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'madmailserver',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    const mailOptions = mailopt
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

fastify.post('/api/send',async (request, reply) => {
  const {mailOptions} = request.body;
   const res = await sendMail( mailOptions )
    .then((result) => {
      if(result.rejected.length > 0){
        return `${result.accepted.length} Success , ${result.rejected.length} Failed.`
      }
      else{
        return "success!"
      }
    } )
    .catch((error) => {
      return "Somthing Went Wrong!"
    });
   return {Status : res};
})

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.listen(PORT,"0.0.0.0", (errors) => {
  if (errors) {
    fastify.log.error(errors)
    process.exit(1)
  }
})