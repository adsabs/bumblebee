class benchmark ($pip_requirements = "requirements.txt") {

  $path_var = "/usr/bin:/usr/sbin:/bin:/usr/local/sbin:/usr/sbin:/sbin"

  # TODO:
  # Need an if command here, and run apt-get if it hasn't already been done
  # Actually, to make independent, need the site.pp manifest here a little bit
  # Can go in its own manifest module?

  $build_packages = ['firefox', 'python', 'python-pip', 'python-dev', 'xvfb', 'libpng-dev', 'build-essential', 'libblas-dev', 'liblapack-dev', 'gfortran']

  package {$build_packages: 
    ensure => installed,
  }

  # Python path to work while on the VM
  exec {'python_path':
    command => "echo 'export PYTHONPATH=$PYTHONPATH:/vagrant/benchmark/benchmark' > /vagrant/.profile",
  }

  # Upgrade pip otherwise will not work properly
  exec {'distribute_upgrade':
    command => "easy_install -U distribute",
    logoutput => on_failure,
    path => $path_var,
    require => Package['python', 'python-pip', 'python-dev'],
  }

  # Install all python dependencies for selenium and general software
  exec {'pip_install_modules':
    command => "pip install -r ${pip_requirements}",
    logoutput => on_failure,
    path => $path_var,
    tries => 2,
    timeout => 1000, # This is only require for Scipy/Matplotlib - they take a while
    require => Package[$build_packages],
  }

  # Order to carry out the manifest
  Exec['python_path'] -> Package[$build_packages] -> Exec['distribute_upgrade'] -> Exec['pip_install_modules']

}

class {"benchmark":
  pip_requirements => "requirements.txt",
}
