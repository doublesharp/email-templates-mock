'use strict'

module.exports = {
	email: {
      subject: 'mocked subject', 
      html: 'mocked html &amp; encode',
      text: 'mocked plain text'
    },
	fail_response: {
		errno: -1,
		code: 'FAILED',
		message: 'The mocked email failed to render'
	}
}