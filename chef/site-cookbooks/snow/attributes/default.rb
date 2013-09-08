default['snow']['api']['app_directory'] = "/home/ubuntu/snow-api"
default['snow']['api']['port'] = 8000
default['snow']['api']['smtp'] = nil

default['snow']['reverse']['https_port'] = 8030
default['snow']['reverse']['http_port'] = 8031
default['snow']['reverse']['elb_name'] = "#{node.chef_environment}-reverse"

default['snow']['admin']['port'] = 8020
default['snow']['admin']['app_directory'] = "/home/ubuntu/snow-admin"

default['snow']['workers']['app_directory'] = "/home/ubuntu/snow-workers"
default['snow']['workers']['bitcoinin']['min_conf'] = 6
default['snow']['workers']['litecoinin']['min_conf'] = 6

default['snow']['branch'] = 'master'

node.set["monit"]["default_monitrc_configs"] = ["ssh"]
