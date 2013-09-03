#!/bin/sh
#
# Usage: scripts/update.sh environment role
# Example: scripts/update.sh staging bitcoind
#

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export KNIFE_ENV=$1
source $DIR/settings.sh

knife role from file roles/$2.rb

knife cookbook upload -a

knife ssh \
    name:$2 \
    -x ubuntu \
    -a ec2.local_ipv4 \
    -i $SSH_KEY \
    "sudo chef-client --override-runlist \"role[$2]\""
