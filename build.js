var metalsmith = require('metalsmith'),
    branch = require('metalsmith-branch'),
    collections = require('metalsmith-collections'),
    excerpts = require('metalsmith-excerpts'),
    layouts = require('metalsmith-layouts'),
    asciidoc = require('metalsmith-asciidoc'),
    markdown = require('metalsmith-markdown'),
    less = require('metalsmith-less'),
    permalinks = require('metalsmith-permalinks'),
    serve = require('metalsmith-serve'),
    watch = require('metalsmith-watch'),
    msIf = require('metalsmith-if'),
    moment = require('moment'),
    fs = require('fs');


build();

if (process.argv.length > 2 && process.argv[2] === 'publish') {
  publish();
}

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

    // use less for css
    .use(less())

    // For the blog index page
    .use(excerpts())
    .use(collections({
      posts: {
        pattern: 'posts/**.html',
        sortBy: 'publishDate',
        reverse: true
      }
    }))

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
      watch({
        pattern: '**/*',
        livereload: serveAndWatch
      })))

    .build(function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('Site build complete.');
      }
    });
}

function publish() {

  var ghpages = require('gh-pages');
  var path = require('path');

  ghpages.publish(path.join(__dirname, 'build'), { dotfiles: true }, function(err) {
    if (err)
      console.error("Cannot publish. " + err);
    else
      console.log('Site published.');
  });

}
