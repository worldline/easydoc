---
rank: 0
custom: a custom value
---

# Welcome to Easydoc !

## What's the deal ?

Easydoc is a tiny web server that publish your documentation written in 
[markdown](http://daringfireball.net/projects/markdown/ "markdown official website").

It can also serve any other web resources aside with your markdown files

It provides you a file index for browsing, and a full-text search.

It's very basic, and very easy to use and customize.


## Installation

1. You'll need the appropriate [NodeJs](http://nodejs.org/#download) installation on your system.
2. Download the [latest version](https://github.com/feugy/easydoc/zipball/master) of easydoc and unzip it
3. From the command line, build it: > npm install -g
4. Also from the command line, run it > easydoc


## How can I use it ?

Once the server is running, simply drops your documentation files written in 
markdown and with the 'md' extension in the _docs_ folder.

Let's say your file is named 'myfile.md'
With a browser, go to [http://localhost/myfile.md]: that's it !
Your markdown file is rendered inside a template (to add header, footer, navigation menu...).

But you can also put any arbitrary file inside the _docs_ folder: they will be served as well, but not wrapped inside the template.

And, when you request the root directory, the page rendered will be the first file accorded to ranking (see below).


## Markdown meta datas

Inside a markdown file, at the very begining, you can specify meta datas (it's totally optionnal):

    ---
    title: Welcome
    anything: Yes !
    rank: 10
    ---

Metas are simply key-value pair (separated by `:` and trimmed), and can be used inside the template AND the markdown as a regular mustache variable.

It's the perfect place to customize the order of your markdown files inside navigation menus: specify the rank key (an integer value) to control the files order. If no rank is found, a default value of `0` is used, and natural order applies, based on the file name.

You can use any arbitrary key, except title and rank that will overide page defaults.


## How do I customize the look&feel ?

For the markup, just edit the two template files inside the __assets_ folder:

- page.tpl. It displays a single page with the file index and search box.
- search.tpl. It shows the search results.

They are using the [mustache](http://mustache.github.com/) templating language. Very easy to use.

Fot rendering customizations, all is in the style.css file.


## I need to customize the root folder !

When launching the server, you can specify your root folder. 

Here is the command line documentation of the server:

    Usage: ./easydoc [options]
    
    Options:
    
        -h, --help               Output usage information
        -V, --version            Output the version number
        -r, --root [docs]        Absolute or relative path to the root folder containing static and markdown files.
        -t, --title [label]        Title of the site as printed in the tab or title bar of the browser.
        -p, --port [80]          Local port of the created Http server.
        -h, --host [0.0.0.0]     Hostname of the created Http server.
        -v, --variables [file]   YAML file containing platform dependent variables used inside markdown files
        --no-cache               Disable mustache template caching (for dev purposes)


## Can I customize my templates ?

For sure ! the variables that you can use inside templates are:

### page.tpl

- path: relative url of the current page
- title: current page's friendly title
- rank: current page's rank inside all known pages
- content: the HTML content of the displayed markdown file.
- pages: handy to make navigation bars, this array contains for each doc pages the following sub object
    - path: relative url to the page
    - title: page's friendly title

And any other metas defined inside the markdown file.

### search.tpl

- title: site title defined with `-t` cli option
- searched: the seached string
- singleResult: true if only one result page found
- noResult: true if not any result found
- numResults: number of result found
- results: for each page found, an object containing :
    - path: relative url to the found page
    - title: found page's friendly title
    - numHits: number of time the searched string was found inside the page
    - hits: an array containing for each hit an object with a single string attribute `hit` with the matching line
- pages: handy to make navigation bars, this array contains for each doc pages the following sub object
    - path: relative url to the page
    - title: page's friendly title

Inside page hits, the searched string is wrapped inside a `bold` Html markup.


## Can I have variables inside markdown files ?

Yes ! you can use any of your locally defined metas inside the same file as well as variables from the global YAML file.

This allow you to put platform dependent stuff inside your markdown files, and changes values just by providing the right YAML.

For example:

   {{host}}

Contains a value read from the YAML file specified at startup by the `-v` cli option, and

    {{custom}}

Is defined inside the file metadatas


## Are their limitations ?

Yes, plenty ! But i'll enrich it latter ^_^

- all markdown files at the same level, in the same folder. No sub-folders.
- assets (page.tpl, search.tpl, style.css, images) must be in the __assets_ folder inside the document root.
- no page templating (mustache) in plain html file.
- markdown files must have the .md extension.
- search use original markdown file, not interpreted content. It may lead to false-positive results.

---
  have fun !
