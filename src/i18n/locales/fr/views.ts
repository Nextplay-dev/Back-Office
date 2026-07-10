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
        addVenue: 'Ajouter un Établissement',
        addCategory: 'Ajouter une Catégorie',
        allVenues: 'Tous les Établissements',
        allUsers: 'Tous les Utilisateurs',
      },
      stats: {
        totalRegistered: 'Total enregistré',
      }
    },
    manager: {
      title: 'Tableau de bord Manager',
      subtitle: 'Surveillez vos établissements et tournois assignés.',
    },
    my: {
      title: 'Bon retour, {name} !',
      subtitle: 'Gérez vos établissements et restez au courant de vos événements.',
      assignedVenues: 'Mes Établissements Assignés',
      venuesCount: '{count} Établissements',
      noVenues: {
        title: 'Aucun établissement pour le moment',
        description: "Vous n'avez pas encore été assigné comme gestionnaire d'un établissement.",
      }
    },
    myVenueOverview: {
      loading: 'Chargement de la présentation de l\'établissement...',
      navigate: 'Naviguer',
      about: 'À propos de cet établissement',
      description: 'Bienvenue dans l\'aperçu administratif de {name}. En tant que gestionnaire, vous avez accès à des outils spécialisés pour superviser la participation, les tournois et le contenu de l\'établissement.',
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
  venues: {
    title: 'Établissements',
    subtitle: '{count} au total',
    new: 'Nouvel Établissement',
    edit: 'Modifier l\'Établissement',
    list: {
      searchPlaceholder: 'Rechercher des établissements...',
      noVenues: 'Aucun établissement trouvé.',
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
        title: 'Supprimer l\'établissement ?',
        description: '"{name}" sera supprimé définitivement.',
      },
    },
    details: 'Détails de l\'Établissement',
    form: {
      newSubtitle: 'Créer un nouvel établissement',
      editSubtitle: 'Modifier les détails de l\'établissement',
    },
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
    isVirtual: 'Établissement virtuel (les réservations sont gérées en externe)',
    externalBookingUrl: 'URL de réservation externe',
    externalBookingClicks: 'Clics sur le lien externe',
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
    form: {
      newSubtitle: 'Créer une nouvelle catégorie',
      editSubtitle: 'Modifier les détails de la catégorie',
    },
    name: 'Nom',
    namePlaceholder: 'Ex: Football',
    icon: 'Icône',
    iconHelp: 'Recherchez des icônes parmi Material Design et Ionicons',
    color: 'Couleur',
  },
  myResources: {
    list: {
      title: 'Ressources',
      subtitle: 'Gérez les actifs physiques comme les terrains, les pistes ou les salles.',
      new: 'Nouvelle Ressource',
      noResources: 'Aucune ressource pour le moment',
      noResourcesDesc: 'Commencez par ajouter votre première ressource pour permettre les réservations.',
      addFirstValue: 'Ajouter une première ressource',
      table: {
        name: 'Nom',
        type: 'Type',
        capacity: 'Capacité',
        actions: 'Actions',
      },
      delete: {
        title: 'Êtes-vous sûr ?',
        description: 'Cela supprimera définitivement la ressource {name} et toutes ses données associées.',
        confirm: 'Supprimer',
        cancel: 'Annuler',
      }
    },
    detail: {
      back: 'Retour aux Ressources',
      loading: 'Chargement de la ressource...',
      tabs: {
        general: 'Général',
        availability: 'Disponibilité',
        exceptions: 'Exceptions',
      },
      dashboard: {
        title: 'Tableau de bord de la ressource',
        config: 'Configuration',
        stats: {
          capacity: 'Capacité',
          type: 'Type de ressource',
        },
        calendar: {
          title: 'Calendrier des réservations',
          today: "Aujourd'hui",
        }
      },
      general: {
        title: 'Détails de la Ressource',
        name: 'Nom de la Ressource',
        type: 'Type',
        capacity: 'Capacité (Joueurs/Créneaux)',
        activities: 'Activités Autorisées',
        activitiesSubtitle: 'Choisissez quelles activités peuvent être réservées sur cette ressource.',
        save: 'Enregistrer les modifications',
      },
      availability: {
        addWindow: 'Ajouter un créneau',
        addWindowDesc: 'Horaires pour {day}.',
        startTime: 'Heure de début',
        endTime: 'Heure de fin',
        add: 'AJOUTER',
        removeWindow: 'Créneau supprimé',
        success: 'Disponibilité ajoutée avec succès',
      },
      exceptions: {
        addClosure: 'Ajouter une fermeture',
        addException: 'Ajouter une exception',
        addExceptionDesc: 'Bloquer les réservations pour cette ressource.',
        noExceptions: 'Aucune exception active',
        noExceptionsDesc: 'Cette ressource fonctionne normalement selon son planning hebdomadaire récurrent.',
        type: 'Type',
        types: {
          closed: 'Fermeture Publique',
          maintenance: 'Maintenance Interne',
        },
        start: 'Début',
        end: 'Fin',
        apply: 'Appliquer le blocage',
        success: 'Exception ajoutée avec succès',
        removed: 'Exception supprimée',
      }
    }
  },
  myActivities: {
    list: {
      title: 'Activités',
      subtitle: 'Gérez les activités proposées et leurs règles temporelles.',
      new: 'Nouvelle Activité',
      noActivities: 'Aucune activité pour le moment',
      noActivitiesDesc: 'Créez votre première activité pour commencer à accepter des réservations.',
      addFirstValue: 'Ajouter une première activité',
      table: {
        name: 'Nom',
        duration: 'Durée',
        interval: 'Intervalle',
        actions: 'Actions',
      },
      delete: {
        title: 'Êtes-vous sûr ?',
        description: 'Cela supprimera définitivement l\'activité "{name}". Les réservations existantes ne seront pas affectées mais aucune nouvelle ne pourra être créée pour cette activité.',
        confirm: 'Supprimer',
        cancel: 'Annuler',
      }
    },
    form: {
      title: 'Configuration de l\'Activité',
      subtitle: 'Définissez les règles et le timing de cette activité.',
      details: 'Détails',
      detailsSubtitle: 'Informations de base et identification.',
      rules: 'Règles de Réservation',
      rulesSubtitle: 'Configurez les contraintes temporelles et la disponibilité.',
      name: 'Nom de l\'Activité',
      namePlaceholder: 'Ex: Padel 60min',
      duration: 'Durée (minutes)',
      interval: 'Intervalle de créneau (minutes)',
      rulesPlaceholder: 'Configuration des règles (JSON)',
    }
  },
  bugReports: {
    title: 'Signalements de bugs',
    subtitle: '{count} signalements au total',
    list: {
      searchPlaceholder: 'Rechercher par message...',
      noBugReports: 'Aucun signalement de bug trouvé.',
      table: {
        id: '#',
        user: 'Utilisateur',
        email: 'Email',
        message: 'Message',
        date: 'Date de création',
        actions: 'Actions',
      },
      delete: {
        title: 'Supprimer le signalement ?',
        description: 'Le signalement de bug de "{name}" sera supprimé définitivement.',
      },
      pagination: {
        info: 'Page {current} sur {last}',
      }
    }
  },
  myTournaments: {
    list: {
      title: 'Tournois',
      subtitle: 'Gérez les tournois et les événements pour cet établissement.',
      new: 'Nouveau Tournoi',
      noTournaments: 'Aucun tournoi pour le moment',
      noTournamentsDesc: 'Créez votre premier tournoi pour commencer.',
      addFirstValue: 'Ajouter un premier tournoi',
      table: {
        picture: 'Image',
        title: 'Titre',
        activity: 'Activité',
        description: 'Description',
        actions: 'Actions',
      },
      delete: {
        title: 'Êtes-vous sûr ?',
        description: 'Cela supprimera définitivement le tournoi "{title}".',
        confirm: 'Supprimer',
        cancel: 'Annuler',
      }
    },
    form: {
      title: 'Configuration du Tournoi',
      subtitle: 'Configurez les détails de votre tournoi.',
      newSubtitle: 'Créer un nouveau tournoi',
      editSubtitle: 'Modifier les détails du tournoi',
      name: 'Titre du Tournoi',
      namePlaceholder: 'Ex: Summer Padel Cup',
      picture: 'URL de l\'image',
      picturePlaceholder: 'https://exemple.com/image.png',
      activity: 'Activité',
      activityPlaceholder: 'Sélectionnez une activité',
      description: 'Description',
      descriptionPlaceholder: 'Décrivez les règles du tournoi, le calendrier, les prix...',
      save: 'Enregistrer le Tournoi',
    }
  },
  analytics: {
    title: 'Analyses & Statistiques',
    subtitle: 'Suivi global des actions utilisateurs et de l\'utilisation de la plateforme',
    totalEvents: 'Total des événements',
    uniqueUsers: 'Utilisateurs actifs uniques',
    eventDistribution: 'Répartition des types d\'action',
    actionTimeline: 'Historique des actions (30 derniers jours)',
    venueClicks: 'Clics sur les réservations externes par établissement',
    venueName: 'Établissement',
    clicksCount: 'Nombre de clics',
    logsTitle: 'Journal des événements récents',
    filterAll: 'Tous les événements',
    table: {
      user: 'Utilisateur',
      action: 'Action',
      date: 'Date',
      details: 'Détails (Métadonnées)',
    },
    noLogs: 'Aucun log d\'événement trouvé.',
    detailsTitle: 'Métadonnées de l\'événement',
    close: 'Fermer',
  }
}
