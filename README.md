# encode-h264-test

H264 MP4 encoding tests, comparing [mp4-h264](https://github.com/mattdesl/mp4-h264) (pure WASM encoder and muxer in a worker) compared to WebCodecs + [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) (TypeScript based muxer).

⚠️ Note the `mp4-h264` library used here is currently 'suspended' due to licensing concerns; this repository is purely for personal & non-commercial use, and as a test case to compare the two approaches.

## running

Clone the repo, open it and serve a HTTP server, like this:

```sh
python3 -m http.server 8080
```

Open [localhost:8080/webcodecs.html](http://localhost:8080/webcodecs.html) in a supported browser (Chrome) and look at the console. Then open [localhost:8080/mp4-h264.html](http://localhost:8080/mp4-h264.html) and check the console, to compare timings.

## observations

The pure WASM approach is nearly as fast, but runs across all browsers and compatible with Node.js, Deno, bun, etc. It has no clear limit on how large the image resolutions can get, but with WebCodec API, trying to encode an 8K video seems to error out when using the codec string `'avc1.64003e'`.
