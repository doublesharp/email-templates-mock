'use strict'

const should = require('should')
const fs = require('fs')
const path = require('path')
const messages = require('../lib/messages')
const emailtemplatesMock = require('../')
const templateDir = path.join(__dirname, './templates/example')
const templateMock = new emailtemplatesMock.EmailTemplate(templateDir)
const badDir = path.join(__dirname, './templates/bad-path')
const badMock = new emailtemplatesMock.EmailTemplate(badDir)

describe('Testing email-templates-mock...', function(){

  const inputs = {
    subject: 'Mocked subject', 
    html: 'html & encode',
    text: 'plain text'
  }

  const htmlEncoded = '<strong>html &amp; encode</strong>'

  beforeEach(function(done){

    // Reset the mock to default values after each test
    emailtemplatesMock.mock.reset()

    done()

  })

  it('should succeed to render the email using the real email-templates', function(done){

    templateMock.render(inputs, function(err, email){
      if (err){
        return done(err)
      }

      email.html.should.be.exactly(htmlEncoded)

      done()

    })

  })

  it('should succeed to render the email using the mocked callback', function(done){

    emailtemplatesMock.mock.mockedRender(true)

    templateMock.render(inputs, function(err, email){

      should(err).be.exactly(null)

      email.html.should.be.exactly(messages.email.html)

      done()

    })

  })

  it('should fail to render the email using the mocked callback', function(done){

    emailtemplatesMock.mock.shouldFailOnce()

    templateMock.render(inputs, function(err, email){

      should(err).not.be.exactly(null)
      err.should.be.exactly(messages.fail_response)

      templateMock.render(inputs, function(err, email){

        should(err).be.exactly(null)

        email.html.should.be.exactly(htmlEncoded)

        done()

      })

    })

  })

  it('should fail to render the email twice using the mocked callback then succeed using the real nodemailer', function(done){

    emailtemplatesMock.mock.shouldFail(true)

    templateMock.render(inputs, function(err, email){

      should(err).not.be.exactly(null)

      err.should.be.exactly(messages.fail_response)

      templateMock.render(inputs, function(err, email){

        should(err).not.be.exactly(null)

        err.should.be.exactly(messages.fail_response)

        emailtemplatesMock.mock.shouldFail(false)

        templateMock.render(inputs, function(err, email){

          should(err).be.exactly(null)

          email.html.should.be.exactly(htmlEncoded)

          done()

        })

      })

    })

  })

  it('should fail to render the email for a bad path using the mocked callback', function(done){

    badMock.render(inputs, function(err, email){
      
      should(err).be.exactly(messages.fail_response)

      done()

    })

  })

  it('should fail to render the email for a bad path using the real nodemailer with validation off', function(done){

    emailtemplatesMock.mock.validateTemplateDir(false)

    badMock.render(inputs, function(err, email){
      
      should(err).not.be.exactly(null)

      err.code.should.be.exactly('ENOENT')

      done()

    })

  })

  it('should return a custom email response in the mocked callback', function(done){

    const customEmail = {
      subject: 'custom subject', 
      html: 'custom html &amp; encode',
      text: 'custom plain text'
    }

    emailtemplatesMock.mock.email(customEmail)
    emailtemplatesMock.mock.mockedRender(true)

    templateMock.render(inputs, function(err, email){
      
      should(err).be.exactly(null)

      email.html.should.be.exactly(customEmail.html)

      done()

    })

  })

  it('should return a custom error response in the mocked callback', function(done){

    const customError = {
      errno: 12345,
      code: 'Custom code',
      message: 'Custom message'
    }

    emailtemplatesMock.mock.failResponse(customError)
    emailtemplatesMock.mock.shouldFailOnce()

    templateMock.render(inputs, function(err, email){
      
      should(err).not.be.exactly(null)

      err.message.should.be.exactly(customError.message)

      done()

    })

  })

})