require('dotenv').config({path: '.env'});

const Hubspot = require('hubspot');
const hubspot = new Hubspot({ apiKey: process.env.HUBSPOT_API_KEY})
const { console } = require('stringify-log');
const { FORM_FIELD_GROUPS, SUBMIT_TEXT, STYLE, INLINE_MESSAGE, METADATA } = require("../controllers/utilities")

const createNewForm = (req, res) => {
  const formPayload = {
    name: 'NEW FORM 3',
    cssClass: "hs-form stacked",
    submitText: SUBMIT_TEXT,
    themeName: "canvas",
    formFieldGroups: FORM_FIELD_GROUPS,
    inlineMessage: INLINE_MESSAGE,
    metaData: METADATA,
    style: STYLE
  }
  return hubspot.forms.create(formPayload)
    .then((rs) => {
      console.log('success', {rs});
      res.status(200).send(rs)

    })
    .catch(error => {
      console.log('createNewForm_err', error.stack);
      res.send(error.stack);
    })
}

const getForms = async (req, res) => {
  // input: formGuid
  let formGuid
  await hubspot.forms.get({limit: 1}).then((data) => {
    formGuid = data[0].guid
  })
  return hubspot.forms.getSubmissions(formGuid)
    .then(rs => {
      console.log(rs);
      res.status(200).send(rs)
    })
    .catch(error => {
      console.log('getForms_err', error.stack);
      res.send(error.stack);
    })
}

module.exports = {
  createNewForm,
  getForms
}