build:
	docker run --rm -it -v `pwd`:/home/node/app --user=node --workdir=/home/node/app --platform=linux/amd64 node:lts-buster bash -c 'yarn global add parcel && npm install && npm run build'
