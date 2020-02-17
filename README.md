# wsc-fastly-token-auth-examples

## Wowza CDN on Fastly Token Authentication

This package includes code examples for use with the Wowza Streaming Cloud&trade; service that help you incorporate token authentication into your application. These examples are for Wowza CDN on Fastly stream targets only. 

## Contents
- [About token authentication](#about)
- [Options](#options)
- [Examples](#examples)
- [Contact](#contact)
- [License](#license)

<a name="about"></a>

## About token authentication
During token authentication, required fields and optional fields combine
into a token string. They are processed through an HMAC algorithm with a shared secret to produce a token.  This token is then
included in a token-protected link provided for playback.

For further information on how to implement token authentication, see one of the following articles:
* [Protect a Wowza CDN on Fastly stream target with token authentication using the Wowza Streaming Cloud REST API](https://www.wowza.com/docs/protect-a-wowza-cdn-on-fastly-stream-target-with-token-authentication-using-the-wowza-streaming-cloud-rest-api)
* [Protect a Wowza CDN on Fastly stream target with token authentication in Wowza Streaming Cloud](https://www.wowza.com/docs/protect-a-wowza-cdn-on-fastly-stream-target-with-token-authentication-in-wowza-streaming-cloud)

The contents of this package include a Ruby implementation that contains a command-line application. The output is a string that includes some of the options and the generated HMAC value. This string is a valid query string name/value pair and should be added to the playlist URL of the protected stream.

## Options 

| Option                      | Description                                                                                                                                                                                                                                                                                          |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| -e, --end_time END_TIME     | Determines when the token expires. --exp overrides --lifetime. Required if lifetime isn't specified.                                                                                                                                                                                                 |
| -h, --help                  | Displays help information.                                                                                                                                                                                                                                                                           |
| -i, --ip IP_ADDRESS         | The IP address to restrict this token to.                                                                                                                                                                                                                                                            |
| -k, --key KEY               | (required) The token_auth_shared_secret value from Wowza Streaming Cloud required to generate the token.                                                                                                                                                                                             |
| -l, --lifetime SECONDS      | The length of time that the token is valid for, in seconds. Required if end_time isn't specified.                                                                                                                                                                                                    |
| -s, --start_time START_TIME | The time that protected access to the stream begins, in UTC seconds. For example, 1478908800 for 12 November 2016 00:00:00 GMT. Use now for the current time.                                                                                                                                        |
| -u, --stream_id STREAMID    | (required) The stream ID from the Wowza Streaming Cloud playback URL, which is the playback_url of the Wowza CDN on Fastly stream target. Using this example, https://[subdomain].wowza.com/1/[stream_id]/[stream_name]/hls/live/playlist.m3u8, the value would be [stream_id]. |


## Examples

Generate a token that starts and expires at specific times, and restrict it to a certain IP address:

```ruby
$ ruby ./gen_token.rb -e 1578421449 -u NUtjdHdsc3g4Z21L -s 1578421200 -i 10.1.1.1 -k 8a123c7b730600eb92360640ce91a32d
```

Result:
```ruby
hdnts=ip=10.1.1.1~st=1578421200~exp=1578421449~hmac=073e5b930fb494728164cad5da037eb2e9429282f33f9f89df04241bd530f74d
```

Generate a token that is valid for a specific number of seconds:
 
```ruby
$ ruby ./gen_token.rb -l 2000 -u NUtjdHdsc3g4Z21L -k 8a123c7b730600eb92360640ce91a32d
```

Result:
```ruby
hdnts=exp=1578424041~hmac=0428782df32a8a8b91823889756d8084997cf45c58375d526dc9852808b35721
```

## Contact

Wowza Media Systems™, LLC

Wowza Media Systems provides developers with a platform to create streaming applications and solutions. See the [Wowza Developer Portal](https://www.wowza.com/resources/developers) to learn more about our APIs and SDKs.

## License

This code is distributed under the [BSD 3-Clause License](https://github.com/WowzaMediaSystems/wsc-fastly-token-auth-examples/blob/master/LICENSE.txt).