FROM node:20-bullseye
RUN sed -i "s@http://\(deb\|security\).debian.org@http://mirrors.tuna.tsinghua.edu.cn@g" /etc/apt/sources.list
RUN apt-get update
RUN apt-get install --no-install-recommends -y libopenjp2-tools  \
    build-essential  \
    rpm
RUN apt-get install -y libdbus-1-dev  \
    flex \
    libglib2.0-dev  \
    libpcap-dev  \
    libpcap0.8  \
    libgnutls28-dev  \
    libbrotli-dev  \
    libzstd-dev  \
    liblz4-dev  \
    libgcrypt-dev  \
    cmake  \
    ninja-build  \
    make  \
    pkg-config  \
    libgcrypt-dev  \
    libc-ares-dev  \
    gettext  \
    libpcap-dev  \
    libspeexdsp-dev  \
    libglu1-mesa  \
    libudev-dev  \
    libnghttp2-dev  \
    libtool  \
    tcpdump  \
    ruby-full
RUN gem sources --add https://mirrors.tuna.tsinghua.edu.cn/rubygems/ --remove https://rubygems.org/
RUN gem install dotenv -v 2.8.1
RUN gem install fpm
ENV USE_SYSTEM_FPM true
RUN mkdir -p /project
WORKDIR /project
COPY . /project/
RUN rm -rf /project/build
RUN npm ci --no-warnings
CMD ["sh", "-c", "cd /project/ && USE_SYSTEM_FPM=true npm run build:host && cp -r build/dist/* /data/"]
