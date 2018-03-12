//
// prepend any latest versions to the HEAD of this array
// currently we only use [0], but we may move to generating
// more information.
//

var VERSIONS = [
  '2018.3.3',
  '2018.2.0',
  '2018.1.0',
  '2017.12.1',
  '2017.11.0',
  '2017.10.0',
  '2017.9.4',
  '2017.8.1',
  '2017.7.0',
  '2017.6.1',
  '2017.6.0',
  '2017.5.0',
  '2017.4.0',
  '2017.3.3',
  '2017.3.2',
  '2017.2.0',
  '2017.1.1'
];

var CURRENT_RELEASE = VERSIONS[0]

if ( ! module ) {
  module = {};
}

module.exports = {
  VERSIONS: VERSIONS,
  CURRENT_RELEASE: CURRENT_RELEASE
}
