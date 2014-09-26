FROM kjunine/nodejs
MAINTAINER Daniel Ku "kjunine@gmail.com"

ADD . /mrsc
WORKDIR /mrsc

RUN npm install

ENV MRSC_RECONFIG false

ENTRYPOINT ["node", "index.js"]
