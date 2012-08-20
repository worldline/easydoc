# Welcome to Easydoc !

## What's the deal ?

Easydoc is a tiny web server that publish your documentation written in 
[markdown](http://daringfireball.net/projects/markdown/ "markdown official website").


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

If there are multiple files in the directory, you can sort the files by prefixing them with an arbitrary string and two underscores:
aaa__firstfile.md
aab__secondfile.md
...
z__lastfile.md
The pages mustache tag will contain the list of file, sorted, with the prefix (XXX__) and extension removed.
An, when you request the root directory, ithe page rendered will be the first page of this smae list.


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
    
        -h, --help            output usage information
        -V, --version         output the version number
        -r, --root [docs]     Absolute or relative path to the root folder containing static and markdown files.
        -p, --port [80]       Local port of the created Http server.
        -h, --host [0.0.0.0]  Hostname of the created Http server.
        --no-cache            Disable mustache template caching (for dev purposes)
        

## Are their limitations ?

Yes, plenty ! But i'll enrich it latter ^_^

- all markdown files at the same level, in the same folder. No sub-folders.
- assets (page.tpl, search.tpl, style.css, images) must be in the __assets_ folder inside the document root.
- no page templating (mustache) in plain html file.
- markdown files must have the .md extension.

---
  have fun !
