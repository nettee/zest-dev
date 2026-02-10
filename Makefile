.PHONY: link unlink

link:
	npm link

unlink:
	npm unlink -g $(shell node -p "require('./package.json').name")
