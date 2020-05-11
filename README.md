# Bitmovin Learning Labs code samples.

Bitmovin believes it's important to spread knowledge and educate as many people as possible on how video development works. For this reason we created the Bitmovin Learning Labs: hands-on, interactive sessions that cover the end to end workflow of online video both for beginner and advanced devs. We used to do this events all around the world and are now hosting them online. 

In this repo you can find all the complete code examples covering the main components of online video: encoding, player and analytics.
The examples are split into multiple branches and folders, within each there is a fully functioning example that you can also run locally (with an API key).

For an in depth coverage of video topics, check out the resources at: [Bitmovin's Developer Network](https://bitmovin.dev)

# Prerequisites
- A player license API key for the player examples
- An encoding license API key for the encoding examples
- A laptop running Chrome
- A Google account to run the encoding examples on the cloud
- A web server and Python installed to run the examples on localhost

# E2E Video workflow code examples

First, obtain your license key(s) from the [Bitmovin's dashboard](https://bitmovin.com/dashboard). The following examples are split by the component that they are referred to in the online video workflow. The code relating to the video encoding examples is in Python and the code relating to the sample Over The Top video application is in Javascript, CSS and HTML.

## Encoding
- Branch [`origin/feature/remote-colab-module-tests`](https://github.com/bitmovin/learning-labs/tree/feature/remote-colab-module-tests): contains Python co lab examples for basic encoding and advanced features like watermarking, thumbnail and sprites extraction.
- Basic encoding Live demo: https://colab.research.google.com/drive/1pBYk1dr4G3zRoDUudWXF3w4j3KEyB6VP 
- Advanced features Live demo: https://colab.research.google.com/drive/1TtyNBjKfwwl2Wg2ggN4Egb1sjHXeHmzc

## Player and Analytics

- Branch [`origin/feature/in-depth-player-javascript-html-css-examples`](https://github.com/bitmovin/learning-labs/tree/feature/in-depth-player-javascript-html-css-examples): contains in depth example implementations and usages of the Bitmovin player, including: DRM, Chromecast, UI custom styling, Low Latency and many more. 
- Live demo: https://demo.bitmovin.com/public/learninglab/

- Branch [`origin/feature/sample-ott-app-javascript`](https://github.com/bitmovin/learning-labs/tree/feature/sample-ott-app-javascript): contains a sample video OTT platform with TV like functionality: next/previous navigation, metadata display, visual reaction to player events and playlist functionality built with Javascript, Bootstrap/CSS and HTML.
- Live demo: https://ott-platform-learning-lab-final.glitch.me/


## Contacts

For any questions: marketing@bitmovin.com or reach out to [#bitmovin channel](https://video-dev.slack.com/archives/C01091V7KMK) in #video-dev on Slack.
