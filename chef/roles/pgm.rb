name "pgm"

run_list(
  "recipe[snow::pgm]"
)

override_attributes(
  "postgresql" => {
    "version" => "9.2",
    "start" => "manual",
    "initdb" => false,
    "data_directory" => "/pgmdata/main",
    "listen_addresses" => "0.0.0.0",
    "wal_level" => "hot_standby",
    "max_wal_senders" => 1,
    "wal_keep_segments" => 32,
    "synchronous_standby_names" => "walreceiver",
    "pg_hba_defaults" => true,
    "pg_hba" => [
      {
        'type' => 'host',
        'db' => 'all',
        'user' => 'postgres',
        'addr' => '10.0.0.0/16',
        'method' => 'trust'
      },
      {
        'type' => 'host',
        'db' => 'replication',
        'user' => 'postgres',
        'addr' => '10.0.1.0/24',
        'method' => 'trust'
      }
    ],
    "log_min_duration_statement" => 100,
    "log_line_prefix" => "%t [%p]: [%l-1] db=%d,user=%u ",
    "log_checkpoints" => "on",
    "log_connections" => "on",
    "log_disconnections" => "on",
    "log_lock_waits" => "on"
  }
)
