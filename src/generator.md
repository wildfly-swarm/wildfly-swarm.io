---
title: WildFly Swarm Project Generator
lastUpdate: 2016-03-22
layout: generator.jade
---

# WildFly Swarm Project Generator

Rightsize your Java EE microservice in a few clicks

<form name="form" ng-app="swarm-generator-app" ng-controller="swarm-generator"> 
	<div class="row">
		<div class="col-sm-12 col-md-6">
			<div class="form-group">
				<label class="control-label" for="groupId">Group ID</label>
				<input type="text" name="groupId" ng-model="model.groupId" class="form-control" id="groupId" tabindex="1" placeholder="com.example">
			</div>
			<div class="form-group">
				<label class="control-label" for="artifactId">Artifact ID</label>
				<input type="text" name="artifactId" ng-model="model.artifactId" class="form-control" id="artifactId" tabindex="2" placeholder="demo">
			</div>			
		</div>
		<div class="col-sm-12 col-md-6">
			<div class="form-group">
				<br/>
				<br/>				
				<button role="button" class="btn btn-lg btn-primary" name="generate-project" ng-click="generate(model)" tabindex="4">Generate Project</button>
			</div>
		</div>				
	</div>	
	<div class="row">
		<div class="col-sm-12 col-md-12">
			<div class="form-group has-feedback">
				<label class="control-label" for="search">Dependencies</label>
				<input id="search" type="search" name="search" class="form-control typeahead" tabindex="3" autocomplete="off" ng-model="search" placeholder="JAX-RS, EJB, Transactions, Ribbon, Hibernate Search...">
				<span class="glyphicon glyphicon-search form-control-feedback" aria-hidden="true"></span>
			</div>						
		</div>		
	</div>
	<div class="row">
		<div class="col-sm-12 col-md-12">
			<div class="form-group">
				<label class="control-label">Selected dependencies</label>
				<br/>
				<div class="tag" ng-repeat="fraction in model.fractions()">{{fraction.name}}&nbsp;<button aria-label="Close" class="close" type="button" ng-click="fraction.selected = false"><span aria-hidden="true">×</span></button></div>
			</div>						
		</div>		
	</div>
	<div class="row bg-info">
		<div class="col-sm-12 col-md-12">
			<h3>Instructions</h3>
			<ol>
				<li>Click on the Generate button to download the <i>{{getZipFileName(model)}}</i> file</li>
				<li>Unzip the file in a directory of your choice</li>
				<li>Run <code>mvn wildfly-swarm:run</code> in the unzipped directory</li>
				<li ng-if="showInstructions(model)">Go to <a href="http://localhost:8080/rest/hello">http://localhost:8080/rest/hello</a> and you should see the following message: <pre>Hello from WildFly Swarm!</pre></li>
			</ol>
		</div>
	</div>	
	<div class="row">
		<div class="col-sm-12 col-md-12">
			<p>Not sure what you are looking for? <a role="button" ng-click="toggleViewDeps(!viewDeps)">{{viewDeps ? 'Hide' :'View'}} all available dependencies</a>
		</div>		
	</div>
	<div class="flex-display">
		<div class="row" ng-repeat="category in categories" ng-if="viewDeps">
			<div class="col-sm-12 col-md-12">
				<fieldset>
					<legend>{{category}}</legend>
					<div class="checkbox" ng-repeat="fraction in fractions | filter: category">
						<label>
							<input type="checkbox" ng-model="fraction.selected">{{fraction.name}}
							<p class="help-block">{{fraction.description}}</p>
						</label>
					</div>
				</fieldset>
			</div>		
		</div>
	</div>
	<div class="row" ng-if="viewDeps">
		<div class="col-sm-12 col-md-12">
			<div class="form-group text-center">
				<button role="button" class="btn btn-lg btn-primary center" name="generate-project" ng-click="generate(model)" tabindex="4">Generate Project</button>
			</div>
		</div>				
	</div>
</form>