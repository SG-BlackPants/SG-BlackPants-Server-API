# SG-BlackPants-Server-API

## System Overview
this is univScanner API Server

## Getting Started
### mongodb 3.4 설치 및 실행
#### Install MongoDB
```
docker pull centos
docker run --name blackpants_mongo -itd -p 27020:27017 --network blackpants-network centos /bin/bash
docker exec -it blackpants_mongo /bin/bash
```

Open the file /etc/yum.repos.d/mongodb-org-3.4.repo and add the following values
```
[mongodb-org-3.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc
```

```
yum install -y mongodb-org
```

#### Configure MongoDB Replica Settings
Open the file /etc/mongod.conf and add the following values
```
net:
  port: 27017
  bindIp: 0.0.0.0

replication:
  oplogSizeMB: 5120
  replSetName: rs0
  secondaryIndexPrefetch: all
```

Setting the following commands
```
nohup mongod --config /etc/mongod.conf &
mongo
rs.initiate({"_id" : "rs0","version" : 1,"members" : [{"_id" : 0,"host" : "localhost:27017"}]})

kill -9 [mongod PID]
nohup mongod --config /etc/mongod.conf &
```

### jdk 1.8 설치
#### Install JDK 1.8
```
wget --no-cookies --no-check-certificate --header "Cookie: oraclelicense=accept-securebackup-cookie" \ http://download.oracle.com/otn-pub/java/jdk/8u161-b12/2f38c3b165be4555a1fa6e98c45e0808/jdk-8u161-linux-x64.tar.gz
sudo mv jdk-8u161-linux-x64.tar.gz /opt/
sudo tar -xzf jdk-8u161-linux-x64.tar.gz
sudo rm -rf jdk-8u161-linux-x64.tar.gz
```

#### Configure JDK
```
sudo update-alternatives  --install /usr/bin/java java /opt/jdk1.8.0_161/bin/java 1000
sudo update-alternatives --install /usr/bin/javac javac /opt/jdk1.8.0_161/bin/javac 1000
sudo update-alternatives --install /usr/bin/javadoc javadoc /opt/jdk1.8.0_161/bin/javadoc 1000
sudo update-alternatives --install /usr/bin/javap javap /opt/jdk1.8.0_161/bin/javap 1000
sudo update-alternatives  --config java
```

### elasticsearch 5.4 설치 및 실행
#### Install Elasticsearch
```
docker pull elasticsearch
docker run --name blackpants_elasticsearch -itd -p 5620:5601 --network blackpants-network centos /bin/bash
docker exec -it blackpants_elasticsearch /bin/bash
```

#### Configure Elasticsearch
Open the file /etc/elasticsearch/elasticsearch.yml to adjust the following values
```
docker exec -it blackpants_elasticsearch /bin/bash

#Set the name of your Elasticsearch Cluster
cluster.name: statusengine

#Set the name of the current node
node.name: elastic01

#Path where Elasticsearch should store data
path.data: /var/lib/elasticsearch

#Path where Elasticsearch should store log files
path.logs: /var/log/elasticsearch

#You need at least one master node inside
#of your Elasticsearch Cluster
node.master: true

#You need at least one node inside
#of your Elasticsearch Cluster, that holds your data
node.data: true
```

#### Start Elasticsearch
```
docker restart blackpants_elasticsearch
```

### pythone 3.6.3 설치
#### Install Python
```
sudo add-apt-repository ppa:jonathonf/python-3.6
sudo apt-get update
sudo apt-get install python3.6
sudo update-alternatives –config python3
```

#### Install pip
```
sudo apt-get install python3-pip
sudo python3 -m pip install --upgrade pip
```

### mongo-connector 설치 및 실행
#### Install Mongo-Connector
```
sudo python3 -m pip install mongo-connector
```

#### Register Service
```
cd /usr/local/lib/python3.6/dist-packages/mongo_connector
git clone https://github.com/mongodb-labs/mongo-connector.git
//스크립트 실행 실패로 보류...
//ValueError: Function has keyword-only parameters or annotations, use getfullargspec() API which can support them
```

#### Start Mongo-Connector
```
cd ~/SG-BlackPants-Server-API
sudo nohup mongo-connector -m localhost:27017 -t localhost:9200 -d elastic2_doc_manager --auto-commit-interval=0 &
```

### Redis Server 3.0.6 설치 및 실행
#### Install Redis Server
```
sudo apt-get install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```
#### binding redis server
```
sudo vim /etc/redis/redis.config
```
bind 127.0.0.1 -> bind 0.0.0.0
외부에서 remote 접근할 수 있도록 설정을 바꾼다.

### Node 설치
#### Install Nodejs
```
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Start univScanner API-Server
```
cd ~
git clone https://github.com/SG-BlackPants/SG-BlackPants-Server-API.git
sudo npm install
sudo npm install -g forever
forever start -l ~/SG-BlackPants-Server-API/logfile.log  -a app.js
```
