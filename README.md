# Welcome to Easydoc !

## What's the deal ?

Easydoc is a tiny web server that publish your documentation written in 
[markdown](http://daringfireball.net/projects/markdown/ "markdown official website").

It can also serve any other web resources aside with your markdown files

It provides you a file index for browsing, and a full-text search (still in progress).

You'll be able to use also [mustache](http://mustache.github.com/) templates and variables, either global (YAML file) or local to page (metas).

It's very basic, and very easy to use and customize.


## Installation

1. You'll need the appropriate [NodeJs](http://nodejs.org/#download) installation on your system.
2. Download the [latest version](https://github.com/feugy/easydoc/zipball/master) of easydoc and unzip it
3. From the command line, build it: > npm install
4. Also from the command line, run it > bin/easydoc -v docs/custom.yml (or node .\bin\easydoc .\docs\custom.yml under windows)


## Documentation

You can watch it online, [on github](https://github.com/feugy/easydoc/blob/master/docs/index.md)
Or, once you've started your server, goes to [http://localhost](http://localhost) and you're in !

If you encounter problems, try the CLI help > bin/easydoc -h



---
   have fun!