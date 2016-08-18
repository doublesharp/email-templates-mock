# email-templates-mock

[![email-templates-mock](https://img.shields.io/npm/v/email-templates-mock.svg)](https://www.npmjs.com/package/email-templates-mock)
[![Build Status](https://img.shields.io/jenkins/s/https/jenkins.doublesharp.com/email-templates-mock.svg)](https://jenkins.doublesharp.com/job/email-templates-mock/)
[![Code Coverage](https://jenkins.doublesharp.com/userContent/badges/coverage/email-templates-mock.svg)](https://jenkins.doublesharp.com/job/email-templates-mock/)
[![Code Climate](https://codeclimate.com/github/doublesharp/email-templates-mock/badges/gpa.svg)](https://codeclimate.com/github/doublesharp/email-templates-mock)
[![Issue Count](https://codeclimate.com/github/doublesharp/email-templates-mock/badges/issue_count.svg)](https://codeclimate.com/github/doublesharp/email-templates-mock)
![Dependency Status](https://david-dm.org/doublesharp/email-templates-mock.svg)
![Dev Dependency Status](https://david-dm.org/doublesharp/email-templates-mock/dev-status.svg)
![Downloads](https://img.shields.io/npm/dt/email-templates-mock.svg)

Mocked `email-templates` module for testing

# install

```
npm install email-templates-mock --save-dev
```

# mock api
There are some special methods available on the mocked module to help with testing.

* `emailtemplatesMock.mock.mockedRender(true|false)`
  * indicate if mocked callbacks should be used or the request passed to `email-templates` 
    * if `false`, use `email-templates` - this is the default
    * if `true`, use a mocked callback and email
* `emailtemplatesMock.mock.validateTemplateDir(true|false)`
  * indicate if the path passed to the template should be validated. if validation is enable and the path does not exist an error will be returned
* `emailtemplatesMock.mock.reset()`
  * resets the mock class to default values
* `emailtemplatesMock.mock.shouldFailOnce()`
  * will return an error on the next call to `template.render()`
* `emailtemplatesMock.mock.shouldFail(true|false)`
  * indicate if errors should be returned for subsequent calls to `template.render()`
    * if `true`, return error
    * if `false`, return success
* `emailtemplatesMock.mock.email(email)`
  * set the success message that is returned in the callback for `template.render()`
* `emailtemplatesMock.mock.failResponse(err)`
  * set the err that is returned in the callback for `template.render()`

# usage
The mocked module behaves in a similar fashion to templates provided by `email-templates`.

```
'use strict'

const emailtemplatesMock = require('email-templates-mock')
const templateDir = path.join(__dirname, './templates/example')
const template = new emailtemplatesMock.EmailTemplate(templateDir)

// the inputs for the templates
const inputs = {}
template.render(inputs, function(err, email){
  if (err){
    console.log('Error!', err, info)
  } else {
    console.log('Success!', email)
  }
}
```

# example using mocha and mockery
Here is an example of using a mocked `nodemailer` class in a `mocha` test using `mockery`

```
'use strict'

const should = require('should')
const mockery = require('mockery')
const emailtemplatesMock = require('email-templates-mock')

describe('Tests that render an email', function(){

  /* This could be an app, Express, etc. It should be  
     instantiated *after* email-templates is mocked. */
  let app = null

  before(function(){

    // Enable mockery to mock objects
    mockery.enable({
      warnOnUnregistered: false
    })
    
    /* Once mocked, any code that calls require('email-templates') 
       will get our emailtemplatesMock */
    mockery.registerMock('email-templates', emailtemplatesMock)
    
    /* Make sure anything that uses email-templates is 
       loaded here, after it is mocked... */
       
  })
  
  afterEach(function(){
    // Reset the mock back to the defaults after each test
    emailtemplatesMock.mock.reset()
  })
  
  after(function(){
    // Remove our mocked nodemailer and disable mockery
    mockery.deregisterAll()
    mockery.disable()
  })
  
  const inputs {
   // your inputs
  }
  
  it('should render using email-templates-mock', function(done){
    template.render(inputs, function(err, email){
     should(err).equal(null)
     should(email).not.equal(null)
     email.should.match(/this string/)
     done()
    })
  })
  
  it('should fail to render using email-templates-mock', function(done){
    emailtemplatesMock.mock.shouldFailOnce()
    template.render(inputs, function(err, email){
     should(err).not.equal(null)
     done()
    })
  })
  
})
```
