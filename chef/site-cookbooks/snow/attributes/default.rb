default['snow']['api']['app_directory'] = "/home/ubuntu/snow-api"
default['snow']['api']['port'] = 8000
default['snow']['api']['smtp'] = nil

default['snow']['reverse']['https_port'] = 8040
default['snow']['reverse']['http_port'] = 8031
default['snow']['reverse']['elb_name'] = "#{node.chef_environment}-reverse"
default['snow']['reverse']['access_log'] = "/var/log/snow-reverse-access.log"
default['snow']['reverse']['error_log'] = "/var/log/snow-reverse-error.log"

default['snow']['admin']['port'] = 8020
default['snow']['admin']['app_directory'] = "/home/ubuntu/snow-admin"

default['snow']['frontend']['app_directory'] = "/home/ubuntu/snow-frontend"
default['snow']['frontend']['port'] = 8010

default['snow']['landing']['app_directory'] = "/home/ubuntu/snow-landing"
default['snow']['landing']['port'] = 8050

default['snow']['workers']['app_directory'] = "/home/ubuntu/snow-workers"
default['snow']['workers']['bitcoinin']['min_conf'] = 6
default['snow']['workers']['litecoinin']['min_conf'] = 6

default['snow']['branch'] = 'master'

node.set["monit"]["default_monitrc_configs"] = ["ssh"]

node.set['varnish']['listen_port'] = 8030
