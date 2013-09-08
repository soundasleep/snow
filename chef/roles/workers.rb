name "workers"
description "Workers"
run_list(
  "recipe[snow::workers]"
)

override_attributes(
  :monit => {
    :mail => {
        :from => "monit@justcoin.com"
    }
  }
)
