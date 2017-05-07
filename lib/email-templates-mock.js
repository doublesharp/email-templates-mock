const debug = require('debug')('email-templates-mock');
const messages = require('./messages');
const emailtemplates = require('email-templates');
const fs = require('fs');

const EmailTemplatesMock = (function EmailTemplatesMock() {
  let email = messages.email;
  let failResponse = messages.fail_response;
  let validateTemplateDir = true;
  let mockedRender = false;
  let shouldFail = false;
  let shouldFailOnce = false;

  const EmailTemplate = function EmailTemplate(templateDir) {
    // the real nodemailer template
    this.template = new emailtemplates.EmailTemplate(templateDir);
    // indicate that we are creating a transport
    debug('new EmailTemplate', templateDir);
    this.render = (data, callback) => {
      // validate that the templateDir exists
      if (validateTemplateDir && !fs.existsSync(templateDir)) {
        // indicate that we could not validate the templateDir
        debug('EmailTemplate.render', 'validateTemplateDir', 'FAIL', templateDir);
        shouldFail = shouldFailOnce = true;
      }
      // determine if we want to return an error
      if (shouldFail) {
        // if this is a one time failure, reset the status
        if (shouldFailOnce) {
          shouldFail = shouldFailOnce = false;
        }
        // indicate that we are sending an error
        debug('EmailTemplate.render', 'FAIL', failResponse);
        // return the error
        return callback(failResponse);
      }
      // if we want to mock our response instead of trying to actually render it
      if (mockedRender) {
        // indicate that we are sending a success
        debug('EmailTemplate.render', 'SUCCESS', email);
        return callback(null, email);
      }
      // indicate that we are sending the request off to nodemailer
      debug('EmailTemplate.render', 'PASSTHROUGH');
      // return the real rendered template via the callback
      return this.template.render(data, callback);
    };

    this.mock = {
      templateDir,
    };
  };

  return {
    // the email template object mock
    EmailTemplate,
    // helpers for testing
    mock: {
      /**
       * if the success will actually render the template or just mock the response
       * @param {boolean} shouldMock If the render should be passed through (false) or rendered
       */
      mockedRender: (shouldMock) => {
        mockedRender = shouldMock;
      },

      /**
       * if the templateDir doesn't exist the mock will return an error
       * @param {boolean} shouldValidate Should the template dir be validated to exist?
       */
      validateTemplateDir: (shouldValidate) => {
        validateTemplateDir = shouldValidate;
      },

      /**
       * determine if sendMail() should return errors once then succeed
       */
      shouldFailOnce: () => {
        shouldFail = shouldFailOnce = true;
      },

      /**
       * determine if sendMail() should return errors
       * @param  {boolean} isFail true will return errors, false will return successes
       */
      shouldFail: (isFail) => {
        shouldFail = isFail;
      },

      /**
       * set the response email content for successes
       * @param  {Object} data The email object.
       */
      email: (data) => {
        email = data;
      },

      /**
       * set the response messages for failures
       * @param  {String|Object} response
       */
      failResponse: (response) => {
        failResponse = response;
      },

      /**
       * reset mock values to defaults
       */
      reset: () => {
        validateTemplateDir = true;
        mockedRender = shouldFail = shouldFailOnce = false;
        email = messages.email;
        failResponse = messages.fail_response;
      },
    },
  };
}());

module.exports = EmailTemplatesMock;
