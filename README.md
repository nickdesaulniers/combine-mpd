# combine-mpd
A command line tool to combine your MPD (media presentation description) manifest files used for MPEG DASH.

```
npm install -g combine-mpd
combine-mpd input0.mpd [input1.mpd input2.mpd input3.mpd ...] output.mpd
```

The command line tool is variadic, accepting 1 or more inputs and writing to a file named by the final argument.
