require('dotenv').config({path: '.env'});
const _ = require('lodash');

const Hubspot = require('hubspot');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPES = process.env.SCOPES;
const REDIRECT_URI = `http://localhost:${process.env.PORT}/oauth-callback`;
const CONTACTS_COUNT = 10;

let tokenStore = {};

let hubspot = new Hubspot({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
  scopes: SCOPES,
});

const checkEnv = (req, res, next) => {
  if (_.startsWith(req.url, '/error')) return next();

  if (_.isNil(CLIENT_ID)) return res.redirect('/error?msg=Please set HUBSPOT_CLIENT_ID env variable to proceed');
  if (_.isNil(CLIENT_SECRET)) return res.redirect('/error?msg=Please set HUBSPOT_CLIENT_SECRET env variable to proceed');

  next();
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

const _process = async (req, res) => {
  try {
    if (!isAuthorized()) return res.render('login');
    if (isTokenExpired()) await refreshToken();

    // Get all contacts
    // GET /contacts/v1/lists/all/contacts/all
    // https://developers.hubspot.com/docs/methods/contacts/get_contacts
    console.log('Calling contacts.get API method. Retrieve all contacts.');
    const contactsResponse = await hubspot.contacts.get({count: CONTACTS_COUNT});
    console.log('Response from API', contactsResponse);

    res.render('contacts', { tokenStore, contacts: prepareContactsContent(contactsResponse.contacts) });
  } catch (e) {
    console.error(e);
    res.redirect(`/error?msg=${e.message}`);
  }
};

const processOauthen = async (req, res) => {
  const authorizationUrlParams = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scopes: SCOPES
  };

  // Use the client to get authorization Url
  // https://www.npmjs.com/package/hubspot
  console.log('Creating authorization Url');
  const authorizationUrl = hubspot.oauth.getAuthorizationUrl(authorizationUrlParams);
  console.log('Authorization Url', authorizationUrl);

  res.redirect(authorizationUrl);
}

const processOauthenCallback = async (req, res) => {
  const code = _.get(req, 'query.code');

  // Get OAuth 2.0 Access Token and Refresh Tokens
  // POST /oauth/v1/token
  // https://developers.hubspot.com/docs/methods/oauth2/get-access-and-refresh-tokens
  console.log('Retrieving access token by code:', code);
  tokenStore = await hubspot.oauth.getAccessToken({code});
  console.log('Retrieving access token result:', tokenStore);
  tokenStore.updated_at = Date.now();

  // Set token for the
  // https://www.npmjs.com/package/hubspot
  hubspot.setAccessToken((tokenStore.access_token));
  res.redirect('/');
}

const processRefresh = async (req, res) => {
  if (isAuthorized()) await refreshToken();
  res.redirect('/');
}

module.exports = {
  checkEnv,
  _process,
  processOauthen,
  processOauthenCallback,
  processRefresh,
}