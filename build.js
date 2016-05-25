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

moment.locale('en', {
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
      '/documentation/HEAD': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/',
      '/documentation/1-0-0-Alpha6': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/1.0.0.Alpha6/',
      '/documentation/1-0-0-Alpha8': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/1.0.0.Alpha8/',
      '/documentation/1-0-0-Beta6': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/1.0.0.Beta6/',
      '/documentation/1-0-0-Beta7': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/c38f5393fe4313665f197b1f01bc73727e6a21c5/',
      '/documentation/1-0-0-Beta8': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/eee1f5ba4dd4f13855cbe98addd365ba29033810/',
      '/documentation/1-0-0-CR1': 'https://wildfly-swarm.gitbooks.io/wildfly-swarm-users-guide/content/v/7d7ea3560e6b65f673bc76ff7fd65499e28ffca2/',  
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
