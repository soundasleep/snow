include_recipe "snow::common"
include_recipe "postgresql::server"
include_recipe "postgresql::contrib"
include_recipe "aws"
include_recipe "awscli"

aws = data_bag_item("aws", "main")

unless File.exists? '/pgmdata/main/PG_VERSION'
    service 'postgresql' do
        action :stop
    end

    directory "/pgmdata" do
        action :create
    end

    # Disk is attached to /dev/sdf but shows up
    # in ubuntu as /dev/xvdf
    aws_ebs_volume "/dev/sdf" do
        aws_access_key aws['aws_access_key_id']
        aws_secret_access_key aws['aws_secret_access_key']
        volume_id node[:snow][:pgm][:volume_id]
        device "/dev/sdf"
        action :attach
    end

    mount "/pgmdata" do
        fstype "xfs"
        device "/dev/xvdf"
        action [:mount, :enable]
    end

    directory "/pgmdata" do
        owner "postgres"
        group "postgres"
        mode 0700
        recursive true
    end

    # Workaround
    directory "/pgmdata/main/9.2" do
        action :create
    end

    service 'postgresql' do
        action [:enable, :start]
    end

    # Workaround (end)
    directory "/pgmdata/main/9.2" do
        action :delete
    end
end

# Automatic backups
include_recipe "cron"
include_recipe "snow::ebssnapshot"

cron_d "ebs-snapshot" do
  hour 15
  minute 0
  command "/usr/bin/ebs-snapshot.sh /pgmdata #{node[:snow][:pgm][:volume_id]}"
end
