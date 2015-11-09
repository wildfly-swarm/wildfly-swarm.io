# wildfly-swarm.io

This is the content for the WildFly Swarm web site.


## Build the Site

    $ make

## Develop the Site

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
