var metalsmith = require('metalsmith'),
    branch = require('metalsmith-branch'),
    collections = require('metalsmith-collections'),
    excerpts = require('metalsmith-better-excerpts'),
    layouts = require('metalsmith-layouts'),
    pagination = require('metalsmith-pagination'),
    asciidoc = require('metalsmith-asciidoc'),
    markdown = require('metalsmith-markdown'),
    jade = require('metalsmith-jade'),
    less = require('metalsmith-less'),
    permalinks = require('metalsmith-permalinks'),
    serve = require('metalsmith-serve'),
    watch = require('metalsmith-watcher'),
    redirect = require('metalsmith-redirect'),
    msIf = require('metalsmith-if'),
    feed = require('metalsmith-feed'),
    drafts = require('metalsmith-drafts'),
    gist = require('metalsmith-gist'),
    moment = require('moment'),
    fs = require('fs');

var versions = require('./versions.js')

moment.updateLocale('en', {
  calendar : {
    lastDay : '[Yesterday, ] MMM Do',
    sameDay : '[Today, ] MMM Do',
    lastWeek : '[last] dddd[, ] MMM Do',
    sameElse : 'll'
  }
});

build();

function build() {
  var serveAndWatch = process.argv.length > 2 && process.argv[2] === 'serve',
      metadata = JSON.parse(fs.readFileSync('./site.json', 'utf8'));

  metadata.devMode = serveAndWatch;

  metadata.CURRENT_RELEASE = versions.CURRENT_RELEASE;

  metalsmith(__dirname)
    .metadata(metadata)
    .source('./src')
    .destination('./build')

    // Write pages in asciidoc or markdown
    .use(asciidoc())
    .use(markdown())
    .use(jade())

    // use less for css
    .use(less())

    // Hide draft posts
    .use(drafts())

    // Make it easy to insert gists into your posts
    .use(gist())

    // For the blog index page
    .use(excerpts({
      pruneLength: 500,
       stripTags: false,
    }))
    .use(collections({
      posts: {
        pattern: 'posts/**.html',
        sortBy: 'publishDate',
        reverse: true
      }
    }))

    .use(
      pagination({
        'collections.posts': {
          perPage: 3,
          layout: 'archive.jade',
          first: 'archive.html',
          path: 'archive/:num/index.html',
          filter: function (page) {
            return !page.private
          },
          pageMetadata: {
            title: 'Archive'
          }
        }
      })
    )

    // URL rewriting for permalinks
    .use(branch('posts/**.html')
         .use(permalinks({
           pattern: 'posts/:title',
           relative: false
         })))
    .use(branch('!posts/**.html')
         .use(branch('!index.md').use(permalinks({
           relative: false
         }))))

    // Jade templates
    .use(layouts({
      engine: 'jade',
      moment: moment
    }))

    // RSS Feed
    .use(feed(
          {
            collection: 'posts',
            pubDate: new Date(),
            postDescription: function(file) {
              // Ugly hack to set publish date on RSS feed.
              // See https://issues.jboss.org/browse/SWARM-441 and https://github.com/hurrymaplelad/metalsmith-feed/issues/13
              file.date = file.publishDate;
              return file.less || file.excerpt || file.contents;
            }
          }
    ))

    // when we run as `node build serve` we'll serve the site and watch
    // the files for changes. Note: This does not reload when templates
    // change, only when the content changes
    .use(msIf(
      serveAndWatch,
      serve({
        port: 8080,
        verbose: true
    })))
    .use(msIf(
      serveAndWatch,
      watch()
    ))

    .use(redirect({
      '/download/swarmtool': 'http://repo2.maven.org/maven2/org/wildfly/swarm/swarmtool/'+ versions.CURRENT_RELEASE + '/swarmtool-' + versions.CURRENT_RELEASE + '-standalone.jar',
      '/download/microprofile-hollowswarm': 'http://repo2.maven.org/maven2/org/wildfly/swarm/servers/microprofile/' + versions.CURRENT_RELEASE + '/microprofile-' + versions.CURRENT_RELEASE + '-hollowswarm.jar',
      '/download/keycloak-swarm': 'http://repo2.maven.org/maven2/org/wildfly/swarm/servers/keycloak/' + versions.CURRENT_RELEASE + '/keycloak-' + versions.CURRENT_RELEASE + '-swarm.jar',
      '/download/management-console-swarm': 'http://repo2.maven.org/maven2/org/wildfly/swarm/servers/management-console/' + versions.CURRENT_RELEASE + '/management-console-' + versions.CURRENT_RELEASE + '-swarm.jar',
      '/download/swagger-ui-swarm': 'http://repo2.maven.org/maven2/org/wildfly/swarm/servers/swagger-ui/' + versions.CURRENT_RELEASE + '/swagger-ui-' + versions.CURRENT_RELEASE + '-swarm.jar',

      '/userguide/2017-10-0': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/v/2017.10.0/',
      '/refguide/2017-10-0': 'https://reference.wildfly-swarm.io/v/2017.10.0/',
      '/howto/2017-10-0': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-howto/v/2017.10.0/',

      '/docs/2017-11-0': 'http://docs.wildfly-swarm.io/2017.11.0/',
      '/docs/2017-12-1': 'http://docs.wildfly-swarm.io/2017.12.1/',
      '/docs/2018-1-0': 'http://docs.wildfly-swarm.io/2018.1.0/',
      '/docs/2018-2-0': 'http://docs.wildfly-swarm.io/2018.2.0',
      '/docs/2018-3-3': 'http://docs.wildfly-swarm.io/2018.3.3',

      '/docs/HEAD': 'http://docs.wildfly-swarm.io/2018.4.0-SNAPSHOT/',
}))


    .build(function (err) {
      if (err) {
        console.log(err);
        throw err;
      }
      else {
        console.log('Site build complete.');
        if (process.argv.length > 2 && process.argv[2] === 'publish') {
          publish();
        }
      }
    });
}

function publish() {

  var ghpages = require('gh-pages'),
      path = require('path'),
      options = {
        user: {
          name: 'Project:Odd CI',
          email: 'ci@torquebox.org'
        },
        dotfiles: true
      };

  ghpages.publish(path.join(__dirname, 'build'), options, function(err) {
    if (err) {
      console.error("Cannot publish site. " + err);
      throw err;
    }
    else
      console.log('Site published.');
  });

}
