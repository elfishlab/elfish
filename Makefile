bootstrap:
	sudo apt-get install -y npm nodejs
	-sudo ln -s /usr/bin/nodejs /usr/bin/node
	npm install
	./node_modules/bower/bin/bower install