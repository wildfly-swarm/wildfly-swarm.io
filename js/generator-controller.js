angular.module('swarm-generator-app',[])
.controller('swarm-generator', function($scope){

    // From https://projectodd.ci.cloudbees.com/job/wildfly-swarm/ws/fraction-list/target/classes/fraction-list.js
    var allFractions = fractionList.filter(function(f){return !f.internal;});
    $scope.fractions = allFractions;
    $scope.categories = extractCategories(allFractions);
    $scope.showInstructions = isJAXRSSelected;

    $scope.model = {
        swarmVersion: "1.0.0.Beta7",
        groupId: "com.example",
        artifactId: "demo",
        fractions : function(fractions) {
          return $scope.fractions.filter(function(item){return item.selected;});
        }
    }

    configureSearchEngine(allFractions);

    $scope.generate = function(model) {
       saveAs(createZip(model), "swarm-example.zip");
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
    queryTokenizer: Bloodhound.tokenizers.whitespace,
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
          return "<div><strong>" + data.name + "</strong><br/><small>" + data.description + "</small></div>";
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
}

updateSearchEngine = function (searchEngine, fractions) {
  searchEngine.clear();
  searchEngine.add(fractions);
} 

createZip = function(model) {
  var pom = createPOM(model);
  var zip = new JSZip();
  var projectRoot = zip.folder(model.artifactId || "demo");
  projectRoot.file("pom.xml", pom);
  var srcJavaFolder = projectRoot.folder("src").folder("main").folder("java");
  if (isJAXRSSelected(model)) {    
    var restFolder = srcJavaFolder.folder("com").folder("example").folder("rest");
    restFolder.file("HelloWorldEndpoint.java", createRestEndpoint());
    restFolder.file("RestApplication.java", createRestApplication());
  }
  return zip.generate({type:"blob"});
}

isJAXRSSelected = function(model) {
  var selectedFractions = model.fractions();
  var result = (selectedFractions.length == 0); 
  for (i=0;i<selectedFractions.length;i++) {
    if (selectedFractions[i].name === 'JAX-RS') {
      result = true;
    } 
  }
  return result;
} 

createPOM = function(model) {
  var groupId = model.groupId || "com.example";
  var artifactId = model.artifactId || "demo";
  var pom = ''
  pom += '<?xml version="1.0" encoding="UTF-8"?>\n'
  pom += '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
  pom += '    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">\n'
  pom += '\n'
  pom += '  <modelVersion>4.0.0</modelVersion>\n'
  pom += '  <groupId>'+groupId+'</groupId>\n'
  pom += '  <artifactId>'+artifactId+'</artifactId>\n'
  pom += '  <name>Wildfly Swarm Example</name>\n'
  pom += '  <version>1.0.0-SNAPSHOT</version>\n'
  pom += '  <packaging>war</packaging>\n'
  pom += '\n'
  pom += '  <properties>\n'
  pom += '    <maven.compiler.source>1.8</maven.compiler.source>\n'
  pom += '    <maven.compiler.target>1.8</maven.compiler.target>\n'
  pom += '    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\n'
  pom += '    <version.wildfly.swarm>'+model.swarmVersion+'</version.wildfly.swarm>\n'
  pom += '  </properties>\n'
  pom += '\n'
  pom += '  <dependencyManagement>\n'
  pom += '    <dependencies>\n'
  pom += '      <dependency>\n'
  pom += '        <groupId>org.wildfly.swarm</groupId>\n'
  pom += '        <artifactId>bom</artifactId>\n'
  pom += '        <version>${version.wildfly.swarm}</version>\n'
  pom += '        <scope>import</scope>\n'
  pom += '        <type>pom</type>\n'
  pom += '      </dependency>\n'
  pom += '    </dependencies>\n'
  pom += '  </dependencyManagement>\n'
  pom += '\n'
  pom += '  <build>\n'
  pom += '    <finalName>'+artifactId+'</finalName>\n'
  pom += '    <plugins>\n'
  pom += '      <plugin>\n'
  pom += '        <artifactId>maven-war-plugin</artifactId>\n'
  pom += '        <version>2.6</version>\n'
  pom += '        <configuration>\n'
  pom += '          <failOnMissingWebXml>false</failOnMissingWebXml>\n'
  pom += '        </configuration>\n'
  pom += '      </plugin>\n'
  pom += '      <plugin>\n'
  pom += '        <groupId>org.wildfly.swarm</groupId>\n'
  pom += '        <artifactId>wildfly-swarm-plugin</artifactId>\n'
  pom += '        <version>${version.wildfly.swarm}</version>\n'
  pom += '        <executions>\n'
  pom += '          <execution>\n'
  pom += '            <goals>\n'
  pom += '              <goal>package</goal>\n'
  pom += '            </goals>\n'
  pom += '          </execution>\n'
  pom += '        </executions>\n'
  pom += '      </plugin>\n'
  pom += '    </plugins>\n'
  pom += '  </build>\n'
  pom += '\n'
  pom += '  <dependencies>\n'
  pom += '    <!-- Java EE 7 dependency -->\n'  
  pom += '    <dependency>\n'
  pom += '      <groupId>javax</groupId>\n'
  pom += '      <artifactId>javaee-api</artifactId>\n'
  pom += '      <version>7.0</version>\n'
  pom += '      <scope>provided</scope>\n'
  pom += '    </dependency>\n'
  pom += '    <!-- Wildfly Swarm Fractions -->\n'

  model.fractions().forEach(function (fraction) {
    pom += '    <dependency>\n'
    pom += '      <groupId>' + fraction.groupId + '</groupId>\n'
    pom += '      <artifactId>' + fraction.artifactId + '</artifactId>\n'
    pom += '    </dependency>\n'    
  });

  pom += '  </dependencies>\n'
  pom += '</project>\n'

  return pom
}

createRestEndpoint = function() {
  var cls = '';
  cls += 'package com.example.rest;\n'
  cls += '\n'
  cls += 'import javax.ws.rs.Path;\n'
  cls += 'import javax.ws.rs.core.Response;\n'
  cls += 'import javax.ws.rs.GET;\n'
  cls += 'import javax.ws.rs.Produces;\n'
  cls += '\n'
  cls += '@Path("/hello")\n'
  cls += 'public class HelloWorldEndpoint {\n'
  cls += '\n'
  cls += '  @GET\n'
  cls += '  @Produces("text/plain")\n'
  cls += '  public Response doGet() {\n'
  cls += '    return Response.ok("Hello from Wildfly Swarm!").build();\n'
  cls += '  }\n'
  cls += '}'

  return cls;
}

createRestApplication = function() {
  var cls = '';
  cls += 'package com.example.rest;\n'
  cls += '\n'
  cls += 'import javax.ws.rs.core.Application;\n'
  cls += 'import javax.ws.rs.ApplicationPath;\n'
  cls += '\n'
  cls += '@ApplicationPath("/rest")\n'
  cls += 'public class RestApplication extends Application {\n'
  cls += '}'

  return cls;
}
