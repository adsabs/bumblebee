class benchmark ($pip_requirements = "requirements.txt") {

  $path_var = "/usr/bin:/usr/sbin:/bin:/usr/local/sbin:/usr/sbin:/sbin"

  # TODO:
  # Need an if command here, and run apt-get if it hasn't already been done
  # Actually, to make independent, need the site.pp manifest here a little bit

  package {['firefox', 'python', 'python-pip', 'python-dev', 'xvfb']:
    ensure => installed,
  }

  exec {'pip_install_modules':
    command => "pip install -r ${pip_requirements}",
    logoutput => on_failure,
    path => $path_var,
    tries => 2,
    timeout => 600, # Too long, but this can take awhile
    require => Package['python-pip', 'python-dev'],
    logoutput => on_failure,
  }

  Package['firefox', 'python-pip'] -> Exec['pip_install_modules']

}

class {"benchmark":
  pip_requirements => "requirements.txt",
}
