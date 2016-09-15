angular.module('swarm-generator-app',[])
.controller('swarm-generator', function($scope){

    // From https://projectodd.ci.cloudbees.com/job/wildfly-swarm/ws/fraction-list/target/classes/fraction-list.js
    var allFractions = fractionList.filter(function(f){return !f.internal;});
    // Add stability badge URL + colors. Levels are: DEPRECATED,EXPERIMENTAL,UNSTABLE,STABLE,FROZEN,LOCKED
    badgeColor = ['c62914', 'dd5f0a','e5ae13','74c614','33c614','14c6c6'];
    allFractions.forEach(function(f) {
      f.stabilityBadgeURL = "https://img.shields.io/badge/stability-"+f.stabilityDescription+"-"+badgeColor[f.stabilityIndex]+".svg?style=flat-square";
    });
    $scope.fractions = allFractions;
    $scope.categories = extractCategories(allFractions);
    $scope.showInstructions = isJAXRSSelected;

    $scope.model = {
        swarmVersion: "2016.9",
        groupId: "com.example",
        artifactId: "demo",
        fractions : function(fractions) {
          return $scope.fractions.filter(function(item){return item.selected;});
        }
    }

    var searchEngine = configureSearchEngine(allFractions);

    $scope.generate = function(model) {
      var downloadPath = 'http://swarmgen-forge.rhcloud.com/generator?g='+model.groupId+'&a='+model.artifactId+'&sv='+model.swarmVersion+'&d='+model.fractions().map(function(i){return i.artifactId;}).join('&d=');
      window.location = downloadPath;  
    }

    $scope.removeFraction = function(fraction) {
      fraction.selected = false;
      updateSearchEngine(searchEngine, allFractions.filter(function(item){return !item.selected;}));
    }


    $scope.getZipFileName = function(model) {
      return (model.artifactId || 'demo') + '.zip';
    }

    $scope.viewDeps = false;
    $scope.toggleViewDeps = function(val) {
      $scope.viewDeps = val;
    }
});

extractCategories = function(fractions) {
  var categories = [];
  fractions.forEach(function (fraction) {
    fraction.category = fraction.category || fraction.tags.split(",")[0] || "General";
    if (fraction.category && categories.indexOf(fraction.category) == -1) {
      categories.push(fraction.category);
    }
  });
  return categories.sort();
}

configureSearchEngine = function(fractions) {
  var searchEngine = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.nonword('name', 'description', 'tags'),
    queryTokenizer: Bloodhound.tokenizers.nonword,
    identify: function (obj) {
        return obj.name;
    },
    cache: false
  });

  updateSearchEngine(searchEngine, fractions);

  $('.typeahead').typeahead({
      minLength: 2,
      highlight: true
    },{
      display: 'name',
      source: searchEngine,
      templates: {
        suggestion: function (data) {
          return "<div>"+
                    "<strong>" + data.name + "</strong> <img alt='["+data.stabilityDescription+"]' src='"+data.stabilityBadgeURL+"'><br/>"+
                    "<small>" + data.description + "</small>" +
                  "</div>";
         }
      }
  });

  $('#search').bind('typeahead:select', function (ev, suggestion) {
      suggestion.selected = true;
      $('#search').typeahead('val', '');
      updateSearchEngine(searchEngine, fractions.filter(function(item){return !item.selected;}));
      // Update AngularJS model
      angular.element($('#search')).scope().$apply();
  });
  return searchEngine;
}

updateSearchEngine = function (searchEngine, fractions) {
  searchEngine.clear();
  searchEngine.add(fractions);
}

isJAXRSSelected = function(model) {
  var selectedFractions = model.fractions();
  var result = (selectedFractions.length == 0);
  for (i=0;i<selectedFractions.length;i++) {
    if (selectedFractions[i].name === 'JAX-RS' || selectedFractions[i].name === 'MicroProfile') {
      result = true;
      break;
    }
  }
  return result;
}
