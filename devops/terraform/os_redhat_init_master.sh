#!/bin/bash

# Upgrade and Install Base Packages
yum upgrade -y && yum update -y
yum install -y amazon-efs-utils docker cronie chrony htop

mkdir -p "${efs_mount_dir}"

# Enable and Start Services
systemctl enable crond.service
systemctl start crond.service
systemctl enable docker
systemctl start docker
systemctl enable chronyd
systemctl restart chronyd

# Docker Permissions
usermod -a -G docker ec2-user

# SSH Key Setup
mkdir -p /home/ec2-user/.ssh
touch /home/ec2-user/.ssh/authorized_keys
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDgmS2hXcwLF+3w2suSREbyU21gYs95OaRq4Wkc+yN4Z kolia@kolia-pc" > /home/ec2-user/.ssh/id_rsa.pub
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDgmS2hXcwLF+3w2suSREbyU21gYs95OaRq4Wkc+yN4Z kolia@kolia-pc" >> ~/.ssh/authorized_keys
chmod 600 /home/ec2-user/.ssh/authorized_keys
chown -R ec2-user:ec2-user /home/ec2-user/.ssh

# Time Sync
yum erase 'ntp*' -y
systemctl restart chronyd

# Swap File Configuration
mem_size=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
swap_size=$((mem_size * 2))
dd if=/dev/zero of=/swapfile bs=1M count=$((swap_size / 1024))
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo "/swapfile swap swap defaults 0 0" | tee -a /etc/fstab

# Docker Cleanup Job (Hourly)
echo '#!/bin/bash' > /etc/cron.hourly/docker_cleanup
echo 'if docker info | grep -q "Swarm: active"; then' >> /etc/cron.hourly/docker_cleanup
echo '  docker node rm $(docker node ls | grep Down | cut -d " " -f 1)' >> /etc/cron.hourly/docker_cleanup
echo '  docker node rm $(docker node ls | grep Unknown | cut -d " " -f 1)' >> /etc/cron.hourly/docker_cleanup
echo 'fi' >> /etc/cron.hourly/docker_cleanup
chmod +x /etc/cron.hourly/docker_cleanup

# Download Repo 
yum install git -y 
cd /home/ec2-user/ && git clone https://github.com/koliacv/IoT-Project.git