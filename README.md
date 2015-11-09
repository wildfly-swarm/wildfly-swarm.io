# wildfly-swarm.io

This is the content for the WildFly Swarm web site.


## Build the Site

    $ make

## Develop the Site

Write content in asciidoc or markdown, your choice. Open an issue if you want
to write content in some other format.

Put blog posts in `src/posts`. Name the files, whatever you want. You can add
front matter to the file to set the title, publish date, etc. Permalinks are
created for the content based on the title of the document. Typically posts
should use the `post.jade` layout.

Here is an example post.

    ---
    title: Swarm Buzz
    publishDate: 2015-11-07
    modifyDate: 2015-11-09
    author: Joseph Stinger
    layout: post.jade
    ---

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
    in aliquet eros, vel posuere mi. Suspendisse a orci eu sapien
    accumsan ullamcorper. Nunc scelerisque, purus vitae aliquam
    aliquam, nibh elit ornare leo, eu aliquam sapien tortor iaculis
    arcu. In eu mattis augue. Donec porttitor leo eu venenatis
    posuere. Nulla facilisi. Nullam fringilla bibendum blandit.


For styling, the site uses [Bootstrap CSS](http://getbootstrap.com) for styling
and layouts. Add additional styling and overrides to `src/css/site.css`. For
templates, we use [HarpJS](http://harpjs.com/).

To build the site and run a simple web server, watching for changes to files.
Note: changes to layouts require a restart.

    $ make serve

## Publish the Site

The site is published when changes are pushed to the `production` branch.
Think of the `master` branch as the staging site. When you commit changes
to the `master` branch and push them to github, those changes can be shared
and reviewed by just browsing the github project at
https://github.com/wildfly-swarm/wildfly-swarm.io/. You won't see any styling
there, but this is good for proofreading and whatnot. When you are happy
with what's there, you can publish the site by pushing those changes to
the `production` branch.

    $ git push origin master:production

This will trigger a CI build at https://projectodd.ci.cloudbees.com/job/wildfly-swarm.io/.
If the build completes successfully, the generated site content will be pushed to
the `gh-pages` branch on github.com, and GitHub Pages will serve the new content at
http://wildfly-swarm.io.
