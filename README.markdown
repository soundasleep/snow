# Snow

Snow is a digital currency exchange engine written in node.js.

Snow uses postgresql as its database engine and runs on Ubuntu 12.04.

It currently supports deposits and withdrawals operations on **Bitcoin**, **Litecoin** and **Ripple** as well as a trading engine and a bitcoin bridge.

##  Getting started

Snow currently supports 2 methods of deployment: a local development all in one installation using Vagrant and VirtualBox and a production deployment through Chef and AWS

#### Deploying with Vagrant and VirtualBox

To deploy via Vagrant, install Vagrant and VirtualBox then head to the /vagrant/snow folder and start the server with "vagrant up". 

This method is suitable for development use

#### Deploying with Chef and AWS

To deploy via AWS you will need a chef server, chef and librarian installed on your machine and an AWS account

You will need to run librarian to download the needed cookbooks and then upload them to your chef server, once that's done edit /chef/data_bags/aws/main.json with your AWS credentials.

You are now ready to deploy using the scripts at /chef/scripts/

This method is suitable for production use


## Project Overview

#### Roles

Role | Description 
--- | --- |
pgm | The database master, all the write queries are sent to this node |
pgs | The read only node acts a live backup of the master |
admin | The administration interface |
api | The API node exposes the API to the web server. It is responsible for most of the database operations and contain the business logic |
workers | The workers communicates to the database and is reponsible to relay transactions from and to the Bitcoin, Litecoin and Ripple networks |
web| The client facing web server that communicates with the API |
bitcoin | The Bitcoin node that communicates to the workers via RPC calls |
litecoin| The Litecoin node that communicates to the workers via RPC calls |
reverse | Reverse proxy, uses varnish |

#### Folder Sructure

Path | Content | Description |
--- | --- | --- |
/admin/ | admin | node.js code for the snow admin interface role |
/api/ | api  | node.js code for the snow api server role | 
/chef/ | chef repo | Everything needed to deploy snow with chef, currently supports AWS |
/client/ | client api | node.js client library for accessing the market |
/db/ | database scripts|Contains initialization, migration and test scripts for the postgresql database |
/docs/ | documentation | API and Activity types documentation | 
/ops/ | snow-ops | Installation scripts and network topology
/vagrant/ | vagrant | Vagrant setup files for snow and bitcoin roles |
/workers/ | worker | node.js code for the workers role|

#####  [API Documentation](https://github.com/justcoin/snow/blob/master/docs/calls.md)

#####  [Snow-Ops and Network topology](https://github.com/justcoin/snow/blob/master/ops/README.markdown)
