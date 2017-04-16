class varnish ($default_vcl = "/etc/varnish/default.vcl", $default_varnish = "/etc/default/varnish", $varnish_storage="/var/lib/varnish/varnish_storage.bin") {

  # Resource for wget definition in puppet: http://stackoverflow.com/questions/18844199/how-to-fetch-a-remote-file-e-g-from-github-in-a-puppet-file-resource

  $path_var = "/usr/bin:/usr/sbin:/bin:/usr/local/sbin:/usr/sbin:/sbin"

  $varnish_daemon = "varnish"

  define remote_file($remote_location=undef){
    
    exec{"retrieve_${title}":
      command => "/usr/bin/wget --quiet '${remote_location}' --output-document=${title}",
      creates => $title,
      timeout => 300,
    }
  
    file{$title:
      require => Exec["retrieve_${title}"],
    }
  }

  $build_packages = ["varnish", "wget"]

  # Install varnish
  package {$build_packages: 
    ensure => installed,
  }

  # Get varnish backend
  #remote_file{$varnish_storage:
  #  remote_location => "http://put_here",
  #}

  # Replace varnish setup files
  file {$default_varnish:
    owner   => "root",
    group   => "root",
    mode    => "644",
    replace => true,
    source => "puppet:///modules/varnish/varnish",
  }
  file {$default_vcl:
    owner   => "root",
    group   => "root",
    mode    => "644",
    replace => true,
    source => "puppet:///modules/varnish/default.vcl",
  }

  # Start the varnish server
  # Cannot get this to work:
  #service {$varnish_daemon:
  #  ensure => running,
  #  enable  => true,
  #  hasrestart => true,
  #  hasstatus => true,
  #  status => '/usr/sbin/service varnish status | grep "is running"',
  #  require => [Package[$build_packages], File[$default_varnish], File[$default_vcl]],
  #  path => $path_var,
  #}

  # Temporary hack
  exec {$varnish_daemon:
    command => "service varnish restart",
    require => [Package[$build_packages], File[$default_varnish], File[$default_vcl]],
    path => $path_var,
  }

  # Order to carry out the manifest
  Package[$build_packages] -> File[$default_varnish] -> File[$default_vcl] -> Exec[$varnish_daemon] #Service[$varnish_daemon] #-> Remote_file[$varnish_storage]

}

class {"varnish":
  default_vcl => "/etc/varnish/default.vcl",
  default_varnish => "/etc/default/varnish",
  varnish_storage => "/var/lib/varnish/varnish_storage.bin",
}
