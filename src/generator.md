---
title: WildFly Swarm Project Generator
lastUpdate: 2016-03-22
layout: generator.jade
---

Rightsize your Java EE microservice in a few clicks

<form name="form" ng-app="swarm-generator-app" ng-controller="swarm-generator">
	<div class="row margin-top-20">
		<div class="col-sm-12 col-md-12">

		<div class="panel panel-info equal-height-column">
				<div class="panel-heading">
					<h3 class="panel-title">Instructions</h3>
				</div>
				<p>
				<ol>					
					<li>Choose the dependencies you need</li>
					<li>Click on the Generate button to download the <i>{{getZipFileName(model)}}</i> file</li>
					<li>Unzip the file in a directory of your choice</li>
					<li>Run <code>mvn wildfly-swarm:run</code> in the unzipped directory</li>
					<li ng-if="showInstructions(model)">Go to <a href="http://localhost:8080/hello">http://localhost:8080/hello</a> and you should see the following message:<br/>
					<code>Hello from WildFly Swarm!</code></li>
				</ol>
				</p>
			</div>		
		</div>
	</div>

	<div class="row">
		<div class="col-sm-12 col-md-6">
			<div class="form-group">
				<label class="control-label" for="groupId">Group ID</label>
				<input type="text" name="groupId" ng-model="model.groupId" class="form-control" id="groupId" tabindex="1" placeholder="com.example">
			</div>
			<div class="swarm-generator-form">
			<div class="form-group">
				<label class="control-label" for="artifactId">Artifact ID</label>
				<input type="text" name="artifactId" ng-model="model.artifactId" class="form-control" id="artifactId" tabindex="2" placeholder="demo">
			</div>
				<button role="button" class="btn btn-primary" name="generate-project" ng-click="generate(model)" tabindex="4">Generate Project</button>
			</div><!-- swarm-generator-form -->
		</div>
	</div>
	<div class="row">
		<div class="col-sm-12 col-md-12">
			<div class="has-feedback">
				<label class="control-label" for="search">Dependencies</label>
				<input id="search" type="search" name="search" class="form-control typeahead" tabindex="3" autocomplete="off" ng-model="search" placeholder="JAX-RS, EJB, Transactions, Ribbon, Hibernate Search...">
				<span class="glyphicon glyphicon-search form-control-feedback" aria-hidden="true"></span>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-12 col-md-12">
			<p>Not sure what you are looking for? <a role="button" ng-click="toggleViewDeps(!viewDeps)">{{viewDeps ? 'Hide' :'View'}} all available dependencies</a>
			<span>filtered by : <select class="capitalize" ng-model="selectedStability" ng-options="s for s in stabilities"></select></span>
			</p>
		</div>
	</div>
	<div class="row">
		<div class="col-sm-12 col-md-12">
			<div class="form-group">
				<label class="control-label">Selected dependencies</label>
				<br/>
				<div class="tag" ng-repeat="fraction in model.fractions()">{{fraction.name}}&nbsp;
					<button aria-label="Close" class="close" type="button" ng-click="removeFraction(fraction)">
						<span aria-hidden="true">×</span>
					</button>
				</div>
			</div>						
		</div>		
	</div>
	<div class="row">
		<div class="row" ng-repeat="categoryGroup in categories | orderBy: category" ng-if="viewDeps">
			<span ng-show="(categoryGroup.fractions | filter: stabilityFilter).length > 0">
				<div class="col-sm-12 col-md-12">
					<fieldset>
					  <legend>{{categoryGroup.category}}</legend>
					  <div class="checkbox" ng-repeat="fraction in categoryGroup.fractions | filter: stabilityFilter">
					  	  <label>
					  	  	<input type="checkbox" ng-model="fraction.selected">{{fraction.name}}
					  	  	<img alt="[{{fraction.stabilityDescription}}]" ng-src="{{fraction.stabilityBadgeURL}}">
					  	  	<p class="help-block">{{fraction.description}}</p>
					  	  </label>
					  </div>
					</fieldset>
				</div>
			</span>
		</div>
	</div>
	<div class="row" ng-if="viewDeps">
		<div class="col-sm-12 col-md-12">
			<div class="form-group text-center">
				<button role="button" class="btn btn-primary center" name="generate-project" ng-click="generate(model)" tabindex="4">Generate Project</button>
			</div>
		</div>				
	</div>
</form>
