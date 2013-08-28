name "landing"
description "Website landing page"
run_list(
  "recipe[snow::aptupdate]",
  "recipe[nodejs]",
  "recipe[nginx]",
  "recipe[snow::landing]"
)
override_attributes({
  "nginx" => {
    "default_site_enabled" => false
  }
})
