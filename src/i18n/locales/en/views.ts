export default {
  login: {
    title: 'Sign in',
    subtitle: 'Enter your admin credentials to continue',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in...',
  },
  dashboard: {
    admin: {
      title: 'Welcome back',
      subtitle: "Here's what's happening on NextPlay.",
      quickActions: 'Quick Actions',
      actions: {
        addActivity: 'Add Activity',
        addCategory: 'Add Category',
        allActivities: 'All Activities',
        allUsers: 'All Users',
      },
      stats: {
        totalRegistered: 'Total registered',
      }
    },
    manager: {
      title: 'Manager Dashboard',
      subtitle: 'Oversee your assigned activities and tournaments.',
    },
    my: {
      title: 'Welcome back, {name}!',
      subtitle: 'Manage your activities and stay on top of your events.',
      assignedActivities: 'My Assigned Activities',
      activitiesCount: '{count} Activities',
      noActivities: {
        title: 'No activities yet',
        description: "You haven't been assigned as a manager to any activity.",
      }
    },
    myActivityOverview: {
      loading: 'Loading activity presentation...',
      navigate: 'Navigate',
      about: 'About this activity',
      description: 'Welcome to the administrative overview of {name}. As a manager, you have access to specialized tools to oversee participation, tournaments, and activity content.',
      stats: {
        tournaments: 'Tournaments',
        managers: 'Managers',
        founded: 'Founded',
      },
      team: 'Management Team',
      noOtherManagers: 'No other managers assigned.',
      location: 'Location',
    }
  },
  roles: {
    title: 'Roles',
    subtitle: 'Define roles and assign granular permissions to them.',
    new: 'New Role',
    edit: 'Edit Role',
    details: 'Role Details',
    detailsSubtitle: 'Basic identification for this role.',
    permissions: 'Permissions',
    permissionsSubtitle: 'Grant specific capabilities to this role.',
    name: 'Role Name',
    namePlaceholder: 'E.g. Content Manager',
    selected: '{count} Selected',
    searchPermissions: 'Search permissions...',
    form: {
      newSubtitle: 'Define a new set of permissions',
      editSubtitle: 'Role ID: #{id}',
    },
    list: {
      searchPlaceholder: 'Search roles by name...',
      noRoles: 'No roles found.',
      noPermissions: 'No permissions assigned',
      table: {
        id: '#',
        roleName: 'Role Name',
        permissions: 'Permissions',
        actions: 'Actions',
      },
      delete: {
        title: 'Delete role?',
        description: 'Role "{name}" will be permanently deleted. Users assigned to this role will lose its permissions.',
      },
      pagination: {
        info: 'Page {current} of {last} ({total} total)',
      }
    }
  },
  users: {
    title: 'Users',
    subtitle: '{count} total users registered',
    new: 'New User',
    edit: 'Edit User',
    details: 'User Account',
    detailsSubtitle: 'Update user information or change roles.',
    security: 'Security Settings',
    securitySubtitle: 'Leave password fields empty to keep current password.',
    name: 'Full Name',
    email: 'Email Address',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    roles: 'Roles & Permissions',
    list: {
      searchPlaceholder: 'Search users by name or email...',
      noUsers: 'No users found.',
      table: {
        id: '#',
        user: 'User',
        email: 'Email',
        roles: 'Roles',
        joined: 'Joined',
        actions: 'Actions',
      },
      delete: {
        title: 'Delete user?',
        description: 'User "{name}" and all their associated data will be permanently deleted.',
      },
      pagination: {
        info: 'Page {current} of {last}',
      }
    }
  },
  activities: {
    title: 'Activities',
    subtitle: '{count} total',
    new: 'New Activity',
    edit: 'Edit Activity',
    list: {
      searchPlaceholder: 'Search activities...',
      noActivities: 'No activities found.',
      table: {
        id: '#',
        name: 'Name',
        category: 'Category',
        address: 'Address',
        coordinates: 'Coordinates',
        tournaments: 'Tournaments',
        actions: 'Actions',
      },
      delete: {
        title: 'Delete activity?',
        description: '"{name}" will be permanently deleted.',
      },
    },
    details: 'Activity Details',
    form: {
      newSubtitle: 'Create a new activity',
      editSubtitle: 'Edit activity details',
    },
    name: 'Name',
    address: 'Address',
    category: 'Category',
    categoryPlaceholder: 'Select a category',
    managers: 'Managers',
    media: 'Media URL',
    mediaPlaceholder: 'https://...',
    latitude: 'Latitude',
    latitudePlaceholder: 'e.g. 48.8566',
    longitude: 'Longitude',
    longitudePlaceholder: 'e.g. 2.3522',
  },
  categories: {
    title: 'Categories',
    subtitle: '{count} total',
    new: 'New Category',
    edit: 'Edit Category',
    list: {
      searchPlaceholder: 'Search categories...',
      noCategories: 'No categories found.',
      table: {
        id: '#',
        icon: 'Icon',
        name: 'Name',
        color: 'Color',
        actions: 'Actions',
      },
      delete: {
        title: 'Delete category?',
        description: '"{name}" will be permanently deleted.',
      },
    },
    details: 'Category Details',
    form: {
      newSubtitle: 'Create a new category',
      editSubtitle: 'Edit category details',
    },
    name: 'Name',
    namePlaceholder: 'E.g. Football',
    icon: 'Icon',
    iconHelp: 'Search for icons from Material Design and Ionicons',
    color: 'Color',
  }
}
