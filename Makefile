build: node_modules
	node build

serve: node_modules
	node build serve

deploy: node_modules
	node build publish

node_modules: package.json
	npm install

.PHONY: build
