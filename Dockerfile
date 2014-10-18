FROM kjunine/nodejs:latest
MAINTAINER Daniel Ku "kjunine@gmail.com"
ENV REFRESHED_AT 2014-10-18

ADD . /mrsc
WORKDIR /mrsc

RUN npm install

ENV MRSC_RECONFIG false

ENTRYPOINT ["node", "index.js"]
