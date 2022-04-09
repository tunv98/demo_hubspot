require('dotenv').config({path: '.env'});

const Hubspot = require('hubspot');
const hubspot = new Hubspot({ apiKey: process.env.HUBSPOT_API_KEY})
const { console } = require('stringify-log');

const createNewForm = (req, res) => {
  const formPayload = {
    name: 'NEW FORM 1',
    submitText: 'Submit',
    inlineMessage: `<p>Thanks for submitting the form. </p>
    Please wait for page refresh.
    If page not refreshed automatically please refresh it manually`,
    formFieldGroups: [
      {
        fields: [
          {
            name: 'firstname',
            label: 'First name',
            defaultValue: '',
            placeholder: 'Enter first name',
            type: 'string',
            hidden: false,
            enabled: true
          },
          {
            name: 'lastname',
            label: 'Last name',
            defaultValue: '',
            placeholder: 'Enter Last name',
            type: 'string',
            hidden: false,
            enabled: true
          }
        ]
      },
      {
        fields: [
          {
            name: 'email',
            label: 'Email',
            defaultValue: '',
            placeholder: 'Enter Email',
            type: 'string',
            hidden: false,
            enabled: true
          },
        ]
      }
    ],
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