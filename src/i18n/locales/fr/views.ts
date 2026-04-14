export default {
  login: {
    title: 'Se connecter',
    subtitle: 'Entrez vos identifiants administrateur pour continuer',
    email: 'Email',
    password: 'Mot de passe',
    submit: 'Se connecter',
    submitting: 'Connexion...',
  },
  dashboard: {
    admin: {
      title: 'Bon retour',
      subtitle: "Voici ce qui se passe sur NextPlay.",
      quickActions: 'Actions Rapides',
      actions: {
        addVenue: 'Ajouter une Activité',
        addCategory: 'Ajouter une Catégorie',
        allActivities: 'Toutes les Activités',
        allUsers: 'Tous les Utilisateurs',
      },
      stats: {
        totalRegistered: 'Total enregistré',
      }
    },
    manager: {
      title: 'Tableau de bord Manager',
      subtitle: 'Surveillez vos activités et tournois assignés.',
    },
    my: {
      title: 'Bon retour, {name} !',
      subtitle: 'Gérez vos activités et restez au courant de vos événements.',
      assignedActivities: 'Mes Activités Assignées',
      activitiesCount: '{count} Activités',
      noActivities: {
        title: 'Aucune activité pour le moment',
        description: "Vous n'avez pas encore été assigné comme gestionnaire d'activités.",
      }
    },
    myVenueOverview: {
      loading: 'Chargement de la présentation de l\'activité...',
      navigate: 'Naviguer',
      about: 'À propos de cette activité',
      description: 'Bienvenue dans l\'aperçu administratif de {name}. En tant que gestionnaire, vous avez accès à des outils spécialisés pour superviser la participation, les tournois et le contenu de l\'activité.',
      stats: {
        tournaments: 'Tournois',
        managers: 'Gestionnaires',
        founded: 'Fondée en',
      },
      team: 'Équipe de Gestion',
      noOtherManagers: 'Aucun autre gestionnaire assigné.',
      location: 'Emplacement',
    }
  },
  roles: {
    title: 'Rôles',
    subtitle: 'Définissez les rôles et attribuez-leur des permissions granulaires.',
    new: 'Nouveau Rôle',
    edit: 'Modifier le Rôle',
    details: 'Détails du Rôle',
    detailsSubtitle: 'Identification de base pour ce rôle.',
    permissions: 'Permissions',
    permissionsSubtitle: 'Accorder des capacités spécifiques à ce rôle.',
    name: 'Nom du Rôle',
    namePlaceholder: 'Ex: Gestionnaire de contenu',
    selected: '{count} Sélectionnés',
    searchPermissions: 'Rechercher des permissions...',
    form: {
      newSubtitle: 'Créer un nouveau rôle avec des permissions et un poids hiérarchique.',
      editSubtitle: 'Mise à jour du rôle ID : {id}',
      weight: 'Poids du rôle',
      weightHelp: 'Un poids plus élevé signifie plus d\'autorité. Vous ne pouvez gérer que les rôles ayant un poids inférieur au vôtre.'
    },
    list: {
      searchPlaceholder: 'Rechercher des rôles par nom...',
      noRoles: 'Aucun rôle trouvé.',
      noPermissions: 'Aucune permission assignée',
      table: {
        id: '#',
        roleName: 'Nom du Rôle',
        permissions: 'Permissions',
        actions: 'Actions',
      },
      delete: {
        title: 'Supprimer le rôle ?',
        description: 'Le rôle "{name}" sera supprimé définitivement. Les utilisateurs assignés à ce rôle perdront ses permissions.',
      },
      pagination: {
        info: 'Page {current} sur {last} ({total} au total)',
      }
    }
  },
  users: {
    title: 'Utilisateurs',
    subtitle: '{count} utilisateurs enregistrés au total',
    new: 'Nouvel Utilisateur',
    edit: 'Modifier l\'Utilisateur',
    details: 'Compte Utilisateur',
    detailsSubtitle: 'Mettre à jour les informations de l\'utilisateur ou changer les rôles.',
    security: 'Paramètres de Sécurité',
    securitySubtitle: 'Laissez les champs de mot de passe vides pour conserver le mot de passe actuel.',
    form: {
      accountSubtitle: 'Créez un nouveau compte pour l\'application ou le back-office.',
    },
    name: 'Nom complet',
    email: 'Adresse Email',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    roles: 'Rôles & Permissions',
    list: {
      searchPlaceholder: 'Rechercher des utilisateurs par nom ou email...',
      noUsers: 'Aucun utilisateur trouvé.',
      table: {
        id: '#',
        user: 'Utilisateur',
        email: 'Email',
        roles: 'Rôles',
        joined: 'Rejoint le',
        actions: 'Actions',
      },
      delete: {
        title: 'Supprimer l\'utilisateur ?',
        description: 'L\'utilisateur "{name}" et toutes ses données associées seront supprimés définitivement.',
      },
      pagination: {
        info: 'Page {current} sur {last}',
      }
    }
  },
  activities: {
    title: 'Activités',
    subtitle: '{count} au total',
    new: 'Nouvelle Activité',
    edit: 'Modifier l\'Activité',
    list: {
      searchPlaceholder: 'Rechercher des activités...',
      noActivities: 'Aucune activité trouvée.',
      table: {
        id: '#',
        name: 'Nom',
        category: 'Catégorie',
        address: 'Adresse',
        coordinates: 'Coordonnées',
        tournaments: 'Tournois',
        actions: 'Actions',
      },
      delete: {
        title: 'Supprimer l\'activité ?',
        description: '"{name}" sera supprimée définitivement.',
      },
    },
    details: 'Détails de l\'activité',
    name: 'Nom',
    address: 'Adresse',
    category: 'Catégorie',
    categoryPlaceholder: 'Sélectionnez une catégorie',
    managers: 'Gestionnaires',
    media: 'URL Média',
    mediaPlaceholder: 'https://...',
    latitude: 'Latitude',
    latitudePlaceholder: 'ex: 48.8566',
    longitude: 'Longitude',
    longitudePlaceholder: 'ex: 2.3522',
  },
  categories: {
    title: 'Catégories',
    subtitle: '{count} au total',
    new: 'Nouvelle Catégorie',
    edit: 'Modifier la Catégorie',
    list: {
      searchPlaceholder: 'Rechercher des catégories...',
      noCategories: 'Aucune catégorie trouvée.',
      table: {
        id: '#',
        icon: 'Icône',
        name: 'Nom',
        color: 'Couleur',
        actions: 'Actions',
      },
      delete: {
        title: 'Supprimer la catégorie ?',
        description: '"{name}" sera supprimée définitivement.',
      },
    },
    details: 'Détails de la catégorie',
    name: 'Nom',
    namePlaceholder: 'Ex: Football',
    icon: 'Icône',
    iconHelp: 'Recherchez des icônes parmi Material Design et Ionicons',
    color: 'Couleur',
  }
}
