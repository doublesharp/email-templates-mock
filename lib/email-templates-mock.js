'use strict'

const debug = require('debug')('email-templates-mock')
const messages = require('./messages')
const emailtemplates = require('email-templates')
const fs = require('fs')

const EmailTemplatesMock = function(){

  let email = messages.email
  let failResponse = messages.fail_response

  let validateTemplateDir = true
  let mockedRender = false
  let shouldFail = false
  let shouldFailOnce = false

  const EmailTemplate = function(templateDir){

    // the real nodemailer template
    this.template = new emailtemplates.EmailTemplate(templateDir)

    // indicate that we are creating a transport
    debug('new EmailTemplate', templateDir)

    this.render = function(data, callback){

      // validate that the templateDir exists
      if (validateTemplateDir && !fs.existsSync(templateDir)){

        // indicate that we could not validate the templateDir
        debug('EmailTemplate.render', 'validateTemplateDir', 'FAIL', templateDir)

        shouldFail = shouldFailOnce = true

      }

      // determine if we want to return an error
      if (shouldFail){

        // if this is a one time failure, reset the status
        if (shouldFailOnce){

          shouldFail = shouldFailOnce = false

        }

        // indicate that we are sending an error
        debug('EmailTemplate.render', 'FAIL', failResponse)

        // return the error
        return callback(failResponse)

      }

      // if we want to mock our response instead of trying to actually render it
      if (mockedRender){

        // indicate that we are sending a success
        debug('EmailTemplate.render', 'SUCCESS', email)

        return callback(null, email)

      }

      // indicate that we are sending the request off to nodemailer
      debug('EmailTemplate.render', 'PASSTHROUGH')

      // return the real rendered template via the callback
      return this.template.render(data, callback)

    }

    this.mock = {

      templateDir: templateDir

    }

  }

  return {

    // the email template object mock
    EmailTemplate: EmailTemplate,

    mock: {

      /**
       * if the success will actually render the template or just mock the response
       * @return void
       */
      mockedRender: function(shouldMock){
        mockedRender = shouldMock
      },

      /**
       * if the templateDir doesn't exist the mock will return an error
       * @return void
       */
      validateTemplateDir: function(shouldValidate){
        validateTemplateDir = shouldValidate
      },

      /**
       * determine if sendMail() should return errors once then succeed
       * @return void
       */
      shouldFailOnce: function(){
        shouldFail = shouldFailOnce = true
      },

      /**
       * determine if sendMail() should return errors
       * @param  boolean true will return errors, false will return successes
       * @return void
       */
      shouldFail: function(isFail){
        shouldFail = isFail
      },

      /**
       * set the response email content for successes
       * @param  Object email
       * @return void
       */
      email: function(data){
        email = data
      },

      /**
       * set the response messages for failures
       * @param  String|Object response
       * @return void
       */
      failResponse: function(response){
        failResponse = response
      },

      /**
       * reset mock values to defaults
       * @return void
       */
      reset: function(){

        validateTemplateDir = true
        mockedRender = shouldFail = shouldFailOnce = false

        email = messages.email
        failResponse = messages.fail_response

      }

    }

  }

}()

module.exports = EmailTemplatesMock