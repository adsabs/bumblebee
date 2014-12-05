class varnish ($default_vcl = "default.vcl", $default_varnish = "varnish") {

  # Resource: http://stackoverflow.com/questions/18844199/how-to-fetch-a-remote-file-e-g-from-github-in-a-puppet-file-resource

  #define remote_file($remote_location=undef, $mode='0644'){
  #  
  #  exec{"retrieve_${title}":
  #    command => "/usr/bin/wget -q ${remote_location} -O ${title}",
  #    creates => $title,
  #  }
  #
  #  file{$title:
  #    mode    => $mode,
  #    require => Exec["retrieve_${title}"],
  #  }
  #}

  $path_var = "/usr/bin:/usr/sbin:/bin:/usr/local/sbin:/usr/sbin:/sbin"

  $build_packages = ["varnish"]

  # Install varnish
  package {$build_packages: 
    ensure => installed,
  }

  ## Get varnish backend
  #remote_file{'varnish_storage':
  #  remote_location => 'https://varnish_storage',
  #  mode            => '0755',
  #}

  # Replace varnish setup files
  exec {'varnish_setup':
    command => "cp $default_vcl /etc/varnish/default.vcl && cp $default_varnish /etc/default/varnish && cp $storage_backend /var/lib/varnish/$storage_backend",
    require => Package[$build_packages],
    path => $path_var,
  } 

  # Order to carry out the manifest
  Package[$build_packages] -> Exec['varnish_setup']

}

class {"varnish":
  default_vcl => "default.vcl",
  default_varnish => "varnish",
}
