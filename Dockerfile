FROM ubuntu:latest

WORKDIR /home/app

ENV NODE_VERSION=21.7.1
RUN apt-get -y update
RUN apt-get -y install curl
# RUN apt-get -y install libstdc++
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN node --version
RUN npm --version

COPY . /home/app

RUN npm install

ENTRYPOINT ["node","server.js"]