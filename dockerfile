FROM ubuntu:22.04

# Install package from apt
RUN sed 's@archive.ubuntu.com@free.nchc.org.tw@' -i /etc/apt/sources.list
RUN apt-get -y update && apt-get install -y ssh make build-essential git curl

# Install nodejs, check the environment have node and npm.
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install -y nodejs
RUN node -v && npm -v 

# Make directory to place the code of BKB.
RUN mkdir /etc/bkb

# Install waffle, mocha, chai with npm
WORKDIR /etc/bkb
RUN npm install --save-dev ethereum-waffle mocha chai ts-node typescript @types/mocha
