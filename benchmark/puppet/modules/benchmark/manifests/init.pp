class benchmark ($pip_requirements = "requirements.txt") {

  $path_var = "/usr/bin:/usr/sbin:/bin:/usr/local/sbin:/usr/sbin:/sbin"

  package {['firefox', 'python-pip']:
    ensure => installed,
  }

  exec {'pip_install_modules':
    command => "pip install -r ${pip_requirements}",
#    refreshonly => true,
    require => Package["python-pip"],
    logoutput => on_failure,
    path => $path_var,
  }

  Package['firefox', 'python-pip'] -> Exec['pip_install_modules']

}

class {"benchmark":
  pip_requirements => "requirements.txt",
}
