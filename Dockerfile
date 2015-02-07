FROM node:0.10
MAINTAINER Daniel Ku "kjunine@gmail.com"
ENV REFRESHED_AT 2015-02-07

ADD . /mrsc
WORKDIR /mrsc

RUN npm install && \
    npm cache clean

ENV MRSC_RECONFIG false

ENTRYPOINT ["node", "index.js"]
