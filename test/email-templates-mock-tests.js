const should = require('should');
const path = require('path');
const messages = require('../lib/messages');
const emailtemplatesMock = require('../');

const templateDir = path.join(__dirname, './templates/example');
const badDir = path.join(__dirname, './templates/bad-path');

const templateMock = new emailtemplatesMock.EmailTemplate(templateDir);
const badMock = new emailtemplatesMock.EmailTemplate(badDir);

describe('Testing email-templates-mock...', () => {
  const inputs = {
    subject: 'Mocked subject',
    html: 'html & encode',
    text: 'plain text',
  };

  const htmlEncoded = '<strong>html &amp; encode</strong>';

  beforeEach((done) => {
    // Reset the mock to default values after each test
    emailtemplatesMock.mock.reset();
    return done();
  });

  it('should succeed to render the email using the real email-templates', (done) => {
    templateMock.render(inputs, (err, email) => {
      if (err) {
        return done(err);
      }
      email.html.should.be.exactly(htmlEncoded);
      return done();
    });
  });

  it('should succeed to render the email using the mocked callback', (done) => {
    emailtemplatesMock.mock.mockedRender(true);
    templateMock.render(inputs, (err, email) => {
      should(err).be.exactly(null);
      email.html.should.be.exactly(messages.email.html);
      return done();
    });
  });

  it('should fail to render the email using the mocked callback', (done) => {
    emailtemplatesMock.mock.shouldFailOnce();
    templateMock.render(inputs, (firstErr) => {
      should(firstErr).not.be.exactly(null);
      firstErr.should.be.exactly(messages.fail_response);
      templateMock.render(inputs, (secondErr, email) => {
        should(secondErr).be.exactly(null);
        email.html.should.be.exactly(htmlEncoded);
        return done();
      });
    });
  });

  it(`should fail to render the email twice using the mocked callback 
    then succeed using the real nodemailer`, (done) => {
    emailtemplatesMock.mock.shouldFail(true);
    templateMock.render(inputs, (firstErr) => {
      should(firstErr).not.be.exactly(null);
      firstErr.should.be.exactly(messages.fail_response);
      templateMock.render(inputs, (secondErr) => {
        should(secondErr).not.be.exactly(null);
        secondErr.should.be.exactly(messages.fail_response);
        emailtemplatesMock.mock.shouldFail(false);
        templateMock.render(inputs, (thirdErr, email) => {
          should(thirdErr).be.exactly(null);
          email.html.should.be.exactly(htmlEncoded);
          return done();
        });
      });
    });
  });

  it('should fail to render the email for a bad path using the mocked callback', (done) => {
    badMock.render(inputs, (err) => {
      should(err).be.exactly(messages.fail_response);
      return done();
    });
  });

  it(`should fail to render the email for a bad path using the 
    real nodemailer with validation off`, (done) => {
    emailtemplatesMock.mock.validateTemplateDir(false);
    badMock.render(inputs, (err) => {
      should(err).not.be.exactly(null);
      err.code.should.be.exactly('ENOENT');
      return done();
    });
  });

  it('should return a custom email response in the mocked callback', (done) => {
    const customEmail = {
      subject: 'custom subject',
      html: 'custom html &amp; encode',
      text: 'custom plain text',
    };
    emailtemplatesMock.mock.email(customEmail);
    emailtemplatesMock.mock.mockedRender(true);
    templateMock.render(inputs, (err, email) => {
      should(err).be.exactly(null);
      email.html.should.be.exactly(customEmail.html);
      return done();
    });
  });

  it('should return a custom error response in the mocked callback', (done) => {
    const customError = {
      errno: 12345,
      code: 'Custom code',
      message: 'Custom message',
    };
    emailtemplatesMock.mock.failResponse(customError);
    emailtemplatesMock.mock.shouldFailOnce();
    templateMock.render(inputs, (err) => {
      should(err).not.be.exactly(null);
      err.message.should.be.exactly(customError.message);
      return done();
    });
  });
});
