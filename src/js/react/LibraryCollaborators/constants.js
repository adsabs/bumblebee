define([], function() {
  return {
    Permissions: Object.freeze({
      READ: {
        id: 'read',
        label: 'Read Only',
        description: 'can view a library',
      },
      WRITE: {
        id: 'write',
        label: 'Read & Write',
        description: 'can view and edit a library',
      },
      ADMIN: {
        id: 'admin',
        label: 'Admin',
        description:
          'can view and edit a library and add, edit, or remove library collaborators',
      },
    }),
  };
});
