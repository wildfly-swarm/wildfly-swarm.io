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

    $scope.selectedStability = "All";

    // Unique stability descriptions
    $scope.stabilities = fractionList.map(function(d) {return d["stabilityDescription"]; }).filter(function(value, index, self){return self.indexOf(value) === index;});
    // Add 'All' value as first entry
    $scope.stabilities.unshift("All");

    $scope.model = {
        swarmVersion: swarmVersion,
        groupId: "com.example",
        artifactId: "demo",
        fractions : function(fractions) {
          return $scope.fractions.filter(function(item){return item.selected;});
        }
    }

    var searchEngine = configureSearchEngine(allFractions);

    $scope.stabilityFilter = function(item) {
      return $scope.selectedStability == 'All' || item.stabilityDescription === $scope.selectedStability;
    }

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
  var categories = {"General": []};
  fractions.forEach(function (fraction) {
    if (fraction.tags) {
      fraction.tags.split(",").forEach(function (tag) {
        if (!categories[tag]) {
          categories[tag] = [];
        }
        categories[tag].push(fraction);
      });
    } else { 
      categories["General"].push(fraction);
    }
  });
  // Convert to array
  var arrayCat = [];
  for (i in categories) {
    arrayCat.push({category: i, fractions: categories[i]});
  }
  return arrayCat.sort(function(a,b) {return a.category > b.category; });
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
