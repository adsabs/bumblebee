#Set global path for exec calls
Exec { path => [ "/bin/", "/sbin/" , "/usr/bin/", "/usr/sbin/", "/usr/local/bin" ] }

class initial_apt_update {
  exec {
    'add_node_repo':
      command   => 'add-apt-repository ppa:chris-lea/node.js && touch /etc/.chris-lea-added-by-puppet',
      creates   => '/etc/.chris-lea-added-by-puppet',
      require   => Exec['apt-update1'],
  }


  exec{
    'apt-update2':
      command   => 'apt-get update && touch /etc/apt-updated-by-puppet2',
      creates   => '/etc/.apt-updated-by-puppet2',
      require   => Exec['add_node_repo'],
  }

  exec{
    'apt-update1':
      command   => 'apt-get update && apt-get install -y python-software-properties software-properties-common && touch /etc/apt-updated-by-puppet1',
      creates   => '/etc/.apt-updated-by-puppet1',
  }
}

include initial_apt_update
package {
  ['nodejs','git','libfontconfig', 'libfontconfig-dev', 'libfreetype6-dev']:
    ensure => installed,
    require => Class['initial_apt_update'];
}

exec {
  'npm_install_grunt':
    command => 'npm install -g grunt-cli',
    require => Package['nodejs'];
}

exec {
  'npm_install':
    command => 'npm install',
    cwd     => '/bumblebee/',
    require => [Exec['npm_install_grunt'],Package['git']];
}

exec {
  'grunt_cli':
    command => 'grunt setup',
    cwd     => '/bumblebee/',
    require => Exec['npm_install_grunt'];
}

class {"benchmark":
  pip_requirements => "/vagrant/requirements.txt",
  require => Class['initial_apt_update'],
}

class {"varnish":
  default_vcl => "default.vcl",
  default_varnish => "varnish",
}
