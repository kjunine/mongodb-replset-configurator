FROM kjunine/nodejs
MAINTAINER Daniel Ku "kjunine@gmail.com"

ADD . /root/mrsc
WORKDIR /root/mrsc

RUN npm install

ENV MRSC_RECONFIG false

ENTRYPOINT ["node", "index.js"]
