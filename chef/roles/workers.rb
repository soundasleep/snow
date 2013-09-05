name "workers"
description "Workers"
run_list(
  "recipe[snow::common]",
  "recipe[snow::aptupdate]",
  "recipe[nodejs]",
  "recipe[logrotate]",
  "recipe[postgresql::client]",
  "recipe[postfix]",
  "recipe[snow::workers]"
)

override_attributes(
  :monit => {
    :mail => {
        :from => "monit@justcoin.com"
    }
  }
)
