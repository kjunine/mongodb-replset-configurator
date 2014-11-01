FROM kjunine/nodejs:latest
MAINTAINER Daniel Ku "kjunine@gmail.com"
ENV REFRESHED_AT 2014-11-01

ADD . /mrsc
WORKDIR /mrsc

RUN npm install && \
    npm cache clean

ENV MRSC_RECONFIG false

ENTRYPOINT ["node", "index.js"]
