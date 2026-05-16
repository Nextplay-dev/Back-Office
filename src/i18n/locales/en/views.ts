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
        addVenue: 'Add Venue',
        addCategory: 'Add Category',
        allVenues: 'All Venues',
        allUsers: 'All Users',
      },
      stats: {
        totalRegistered: 'Total registered',
      }
    },
    manager: {
      title: 'Manager Dashboard',
      subtitle: 'Oversee your assigned venues and tournaments.',
    },
    my: {
      title: 'Welcome back, {name}!',
      subtitle: 'Manage your venues and stay on top of your events.',
      assignedVenues: 'My Assigned Venues',
      venuesCount: '{count} Venues',
      noVenues: {
        title: 'No venues yet',
        description: "You haven't been assigned as a manager to any venue.",
      }
    },
    myVenueOverview: {
      loading: 'Loading venue presentation...',
      navigate: 'Navigate',
      about: 'About this venue',
      description: 'Welcome to the administrative overview of {name}. As a manager, you have access to specialized tools to oversee participation, tournaments, and venue content.',
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
      newSubtitle: 'Create a new role with specific permissions and hierarchy weight.',
      editSubtitle: 'Updating role ID: {id}',
      weight: 'Role weight',
      weightHelp: 'Higher weight means more authority. You can only manage roles with weights lower than your own.'
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
    form: {
      accountSubtitle: 'Create a new account for the application or back-office.',
    },
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
  venues: {
    title: 'Venues',
    subtitle: '{count} total',
    new: 'New Venue',
    edit: 'Edit Venue',
    list: {
      searchPlaceholder: 'Search venues...',
      noVenues: 'No venues found.',
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
        title: 'Delete venue?',
        description: '"{name}" will be permanently deleted.',
      },
    },
    details: 'Venue Details',
    form: {
      newSubtitle: 'Create a new venue',
      editSubtitle: 'Edit venue details',
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
  },
  myResources: {
    list: {
      title: 'Resources',
      subtitle: 'Manage physical assets like courts, lanes, or rooms.',
      new: 'New Resource',
      noResources: 'No resources yet',
      noResourcesDesc: 'Start by adding your first resource to enable bookings.',
      addFirstValue: 'Add first resource',
      table: {
        name: 'Name',
        type: 'Type',
        capacity: 'Capacity',
        actions: 'Actions',
      },
      delete: {
        title: 'Are you sure?',
        description: 'This will permanently delete the resource {name} and all its associated data.',
        confirm: 'Delete',
        cancel: 'Cancel',
      }
    },
    detail: {
      back: 'Back to Resources',
      loading: 'Loading resource...',
      tabs: {
        general: 'General',
        availability: 'Availability',
        exceptions: 'Exceptions',
      },
      dashboard: {
        title: 'Resource Dashboard',
        config: 'Configuration',
        stats: {
          capacity: 'Capacity',
          type: 'Resource Type',
        },
        calendar: {
          title: 'Booking Calendar',
          today: 'Today',
        }
      },
      general: {
        title: 'Resource Details',
        name: 'Resource Name',
        type: 'Type',
        capacity: 'Capacity (Players/Slots)',
        activities: 'Allowed Activities',
        activitiesSubtitle: 'Choose which activities can be booked on this resource.',
        save: 'Save Changes',
      },
      availability: {
        addWindow: 'Add Window',
        addWindowDesc: 'Hours for {day}.',
        startTime: 'Start Time',
        endTime: 'End Time',
        add: 'ADD',
        removeWindow: 'Window removed',
        success: 'Availability added successfully',
      },
      exceptions: {
        addClosure: 'Add Closure',
        addException: 'Add Exception',
        addExceptionDesc: 'Block bookings for this resource.',
        noExceptions: 'No active exceptions',
        noExceptionsDesc: 'This resource is operating normally according to its recurring weekly schedule.',
        type: 'Type',
        types: {
          closed: 'Public Closure',
          maintenance: 'Internal Maintenance',
        },
        start: 'Start',
        end: 'End',
        apply: 'Apply Block',
        success: 'Exception added successfully',
        removed: 'Exception removed',
      }
    }
  },
  myActivities: {
    list: {
      title: 'Activities',
      subtitle: 'Manage offered activities and their temporal rules.',
      new: 'New Activity',
      noActivities: 'No activities yet',
      noActivitiesDesc: 'Create your first activity to start accepting bookings.',
      addFirstValue: 'Add first activity',
      table: {
        name: 'Name',
        duration: 'Duration',
        interval: 'Interval',
        actions: 'Actions',
      },
      delete: {
        title: 'Are you sure?',
        description: 'This will permanently delete the activity "{name}". Existing bookings will not be affected but no new ones can be created for this activity.',
        confirm: 'Delete',
        cancel: 'Cancel',
      }
    },
    form: {
      title: 'Activity Configuration',
      subtitle: 'Define the rules and timing for this activity.',
      details: 'Details',
      detailsSubtitle: 'Basic information and identification.',
      rules: 'Booking Rules',
      rulesSubtitle: 'Configure temporal constraints and availability.',
      name: 'Activity Name',
      namePlaceholder: 'E.g. Padel 60min',
      duration: 'Duration (minutes)',
      interval: 'Slot Interval (minutes)',
      rulesPlaceholder: 'Rules config (JSON)',
    }
  }
}
