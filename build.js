var Git = require("nodegit");

var metalsmith = require('metalsmith'),
    branch = require('metalsmith-branch'),
    collections = require('metalsmith-collections'),
    excerpts = require('metalsmith-excerpts'),
    asciidoc = require('metalsmith-asciidoc'),
    markdown = require('metalsmith-markdown'),
    less = require('metalsmith-less'),
    permalinks = require('metalsmith-permalinks'),
    serve = require('metalsmith-serve'),
    templates = require('metalsmith-templates'),
    watch = require('metalsmith-watch'),
    msIf = require('metalsmith-if'),
    moment = require('moment'),
    fs = require('fs');


build();

if (process.argv.length > 2 && process.argv[2] === 'publish') {
  publish();
}

function build() {
  var serveAndWatch = process.argv.length > 2 && process.argv[2] === 'serve';
  metalsmith(__dirname)
    .metadata(JSON.parse(fs.readFileSync('./site.json', 'utf8')))
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
    .use(templates({
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
        console.log('Site build complete!');
      }
    });
}

function publish() {
  var tmpPath = 'tmp',
      rmdir = require('rmdir');

  rmdir(tmpPath, function(err) {
    if (err && err.code !== 'ENOENT') {
      console.error("Cannot remove temp directory. Failing.");
      console.log(err);
      return;
    }
    //_clone();
    _open();

  });

  function _open() {
    Git.Repository.open('.').then(function(repo) {
      repo.checkoutBranch('gh-pages')
        .then(function() {
          console.log('gh-pages branch checked out');
        })
        .catch(function(e) {
          console.error(e);
        });
    });
  }

  function _clone() {
    var options = {
      fetchOpts: {
        callbacks: {
          certificateCheck: function() {
            return 1;
          },
          credentials: function(url, userName) {
            return Git.Cred.sshKeyFromAgent(userName);
          }
        }
      }
    };

    Git.Clone('git@github.com:wildfly-swarm/wildfly-swarm.io.git',
              'tmp', options
             ).then(function(repo) {
               console.log(require('util').inspect(repo));
               repo.checkoutBranch('gh-pages')
                 .then(function() {
                   console.log("Branch checked out");
                 })
                 .catch(function(err) {
                   console.error("Cannot checkout branch");
                   console.error(err);
                 });
               console.log("REPO CLONED");
             })
      .catch(function(reason) {
        console.error(reason);
        console.error(reason.stack);
      });
  }
}
