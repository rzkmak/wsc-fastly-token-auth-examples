// This code and all components (c) Copyright 2019-2020, Wowza Media Systems, LLC. All rights reserved.
// This code is licensed pursuant to the BSD 3-Clause License.

'use strict'
const crypto = require('crypto')
const program = require('commander');

class TokenAuth {
    constructor(options) {
        this.options = options

        if (!this.options.secret) {
            throw new Error('Secret must be provided to generate a token.')
        }

        if(!this.options.streamId) {
          throw new Error('Stream ID must be provided to generate a token.')
        }

    }

    generateToken() {
        var startTime = this.options.startTime
        var endTime = this.options.endTime

        if (typeof startTime === 'string' && startTime.toLowerCase() === 'now') {
            startTime = parseInt(Date.now() / 1000)
        } else if (startTime) {
            if (typeof startTime === 'number' && startTime <= 0) {
                throw new Error('startTime must be number ( > 0 ) or "now"')
            }
        }

        if (typeof endTime === 'number' && endTime <= 0) {
            throw new Error('endTime must be number ( > 0 )')
        }

        if (typeof this.options.lifetimeSeconds === 'number' && this.options.lifetimeSeconds <= 0) {
            throw new Error('lifetimeSeconds must be number ( > 0 )')
        }
        if(endTime) {
          if(startTime && startTime >= endTime) {
            throw new Error('Token start time is equal to or after expiration time.')
          }
        } else {
            if (this.options.lifetimeSeconds) {
                if (!startTime) {
                    startTime = parseInt(Date.now() / 1000)
                }
                endTime = parseInt(startTime) + parseInt(this.options.lifetimeSeconds)
            } else {
                throw new Error('You must provide endTime or lifetimeSeconds')
            }
        }

        if (startTime && (endTime < startTime)) {
            throw new Error('Token will have already expired')
        }

        var hashSource = []
        var newToken = []

        if (this.options.vodStreamId) {
            newToken.push("vod_stream_id=" + this.options.vodStreamId)
        }

        if (this.options.ip) {
            newToken.push("ip=" + this.options.ip)
        }

        if (this.options.startTime) {
            newToken.push("st=" + startTime)
        }
        newToken.push("exp=" + endTime)

        hashSource = newToken.slice()

        hashSource.push("stream_id=" + this.options.streamId)

        var hmac = crypto.createHmac(
            'sha256',
            this.options.secret
        )

        hmac.update(hashSource.join('~'))
        newToken.push("hmac=" + hmac.digest('hex'))

        return newToken.join('~')
    }

}

module.exports = TokenAuth


program
	.version('0.1.1')
	.option('-l, --lifetime <n>', 'Token expires after SECONDS. --lifetime or --end_time is mandatory.')
  .option('-e, --end_time <n>', 'Token expiration in Unix Epoch seconds. --end_time overrides --lifetime.')
	.option('-u, --stream_id [value]', 'STREAMID to validate the token against.')
  .option('-k, --key [value]', 'Secret required to generate the token. Do not share this secret.')
  .option('-s, --start_time [value]', "(Optional) Start time in Unix Epoch seconds. Use 'now' for the current time.")
  .option('-i, --ip [value]', '(Optional) The token is only valid for this IP Address.')

  program.on('--help', function(){
    console.log('')
    console.log('gen_token: A short script to generate valid authentication tokens for')
    console.log('Fastly stream targets in Wowza Streaming Cloud.')
    console.log('')
    console.log('To access to a protected stream target, requests must provide')
    console.log('a parameter block generated by this script, otherwise the request')
    console.log('will be blocked.')
    console.log('')
    console.log('Any token is tied to a specific stream id and has a limited lifetime.')
    console.log('Optionally, additional parameters can be factored in, for example the')
    console.log('client\'s IP address, or a start time denoting from when on the token is valid.')
    console.log('See below for supported values. Keep in mind that the stream target')
    console.log('configuration has to match these optional parameters in some cases.')
    console.log('')
    console.log('Examples:')
    console.log('')
    console.log('# Generate a token that is valid for 1 hour (3600 seconds)')
    console.log('# and protects the stream id YourStreamId with a secret value of')
    console.log('# demosecret123abc')
    console.log('node gen_token.js -l 3600 -u YourStreamId -k demosecret123abc')
    console.log('hdnts=exp=1579792240~hmac=efe1cef703a1951c7e01e49257ae33487adcf80ec91db2d264130fbe0daeb7ed')
    console.log('')
    console.log('# Generate a token that is valid from 1578935505 to 1578935593')
    console.log('# seconds after 1970-01-01 00:00 UTC (Unix epoch time)')
    console.log('node gen_token.js -s 1578935505 -e 1578935593 -u YourStreamId -k demosecret123abc')
    console.log('hdnts=st=1578935505~exp=1578935593~hmac=aaf01da130e5554eeb74159e9794c58748bc9f6b5706593775011964612b6d99')
  })
	.parse(process.argv);

var ea = new TokenAuth({
	secret: program.key,
	startTime: program.start_time,
	endTime: program.end_time,
	lifetimeSeconds: program.lifetime,
	ip: program.ip,
	streamId: program.stream_id
  vodStreamId: program.vod_stream_id
})


var token

token = ea.generateToken()

console.log("")
console.log(`hdnts=${token}`)
