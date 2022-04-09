const Hubspot = require('hubspot');
const _ = require('lodash');

require('dotenv').config({path: '.env'});
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

let tokenStore = {};

const isAuthorized = () => {
  return !_.isEmpty(tokenStore.refresh_token);
};

const isTokenExpired = () => {
  return Date.now() >= tokenStore.updated_at + tokenStore.expires_in * 1000;
};

const prepareContactsContent = (contacts) => {
  return _.map(contacts, (contact) => {
    const companyName = _.get(contact, 'properties.company.value') || '';
    const name = getFullName(contact.properties);
    return {vid: contact.vid, name, companyName};
  });
};

const getFullName = (contactProperties) => {
  const firstName = _.get(contactProperties, 'firstname.value') || '';
  const lastName = _.get(contactProperties, 'lastname.value') || '';
  return `${firstName} ${lastName}`
};

const refreshToken = async () => {
  hubspot = new Hubspot({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
    scopes: SCOPES,
    refreshToken: tokenStore.refresh_token
  });

  tokenStore = await hubspot.refreshAccessToken();
  tokenStore.updated_at = Date.now();
  console.log('Updated tokens', tokenStore);
};

let hubspot = new Hubspot({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
  scopes: SCOPES,
});

module.exports =  {
  getAccessToken
}