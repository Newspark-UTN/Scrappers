FROM mhart/alpine-node:4.2

COPY ./ /opt/newspark

WORKDIR /opt/newspark

RUN npm install