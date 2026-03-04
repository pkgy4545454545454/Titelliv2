import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CreditCard, 
  Shield, 
  Clock, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Scale,
  Users,
  Lock,
  FileCheck,
  Ban,
  Gavel
} from 'lucide-react';

const CGVPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 px-4">
      <div className="max-w-4xl mx-auto py-16">
        <div className="flex items-center gap-4 mb-8">
          <FileText className="w-12 h-12 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Conditions Générales de Vente
          </h1>
        </div>

        <p className="text-gray-400 mb-4 text-lg">
          Dernière mise à jour : Mars 2026
        </p>
        
        <p className="text-gray-500 mb-12 text-sm">
          Conformes au droit suisse - Code des obligations (CO) et Loi fédérale contre la concurrence déloyale (LCD)
        </p>

        <div className="space-y-12 text-gray-400">
          
          {/* Article 1 - Dispositions générales */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm font-bold">1</span>
              Dispositions générales
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">1.1 Objet</strong><br />
                Les présentes Conditions Générales de Vente (ci-après "CGV") régissent l'ensemble des relations contractuelles 
                entre Titelli SA (ci-après "Titelli" ou "nous"), société de droit suisse dont le siège est à Lausanne, 
                et toute personne physique ou morale (ci-après "l'Utilisateur" ou "vous") accédant à la plateforme Titelli 
                accessible à l'adresse www.titelli.com.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">1.2 Acceptation</strong><br />
                L'utilisation de nos services implique l'acceptation pleine et entière des présentes CGV. 
                Si vous n'acceptez pas ces conditions, nous vous prions de ne pas utiliser notre plateforme.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">1.3 Modification des CGV</strong><br />
                Titelli se réserve le droit de modifier les présentes CGV à tout moment. Les modifications 
                entreront en vigueur dès leur publication sur la plateforme. Il appartient à l'Utilisateur 
                de consulter régulièrement les CGV. La poursuite de l'utilisation de la plateforme après 
                modification vaut acceptation des nouvelles conditions.
              </p>
            </div>
          </section>

          {/* Article 2 - Définitions */}
          <section className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm font-bold">2</span>
              Définitions
            </h2>
            <div className="pl-11 space-y-3">
              <p><strong className="text-yellow-400">Plateforme :</strong> Désigne le site web titelli.com et toutes ses applications associées.</p>
              <p><strong className="text-yellow-400">Client :</strong> Toute personne physique utilisant la plateforme pour rechercher et réserver des services.</p>
              <p><strong className="text-yellow-400">Prestataire :</strong> Toute entreprise ou professionnel inscrit sur la plateforme pour proposer ses services.</p>
              <p><strong className="text-yellow-400">Services :</strong> L'ensemble des prestations proposées par Titelli, incluant mais non limité à : mise en relation, réservation, paiement, publicité.</p>
              <p><strong className="text-yellow-400">Compte :</strong> Espace personnel créé par l'Utilisateur sur la plateforme.</p>
              <p><strong className="text-yellow-400">Contenu :</strong> Toute information, texte, image, vidéo ou donnée publiée sur la plateforme.</p>
            </div>
          </section>

          {/* Article 3 - Inscription et compte */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-yellow-400" />
              Article 3 - Inscription et compte utilisateur
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">3.1 Création de compte</strong><br />
                L'accès à certains services de la plateforme nécessite la création d'un compte. L'Utilisateur 
                s'engage à fournir des informations exactes, complètes et à jour lors de son inscription, 
                conformément à l'art. 3 de la Loi fédérale contre la concurrence déloyale (LCD).
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">3.2 Confidentialité du compte</strong><br />
                L'Utilisateur est seul responsable de la confidentialité de ses identifiants de connexion. 
                Toute utilisation du compte est réputée effectuée par l'Utilisateur lui-même. En cas de 
                suspicion d'utilisation frauduleuse, l'Utilisateur doit en informer immédiatement Titelli.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">3.3 Capacité juridique</strong><br />
                L'Utilisateur déclare être majeur et juridiquement capable de contracter, ou agir avec 
                l'autorisation de son représentant légal, conformément aux articles 12 et suivants du 
                Code civil suisse (CC).
              </p>
            </div>
          </section>

          {/* Article 4 - Services proposés */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm font-bold">4</span>
              Services proposés
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">4.1 Description des services</strong><br />
                Titelli propose une plateforme de mise en relation entre Clients et Prestataires de services 
                dans la région de Lausanne et en Suisse romande. Les services incluent notamment :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Recherche et découverte de prestataires locaux</li>
                <li>Système de réservation en ligne</li>
                <li>Paiement sécurisé</li>
                <li>Avis et évaluations vérifiés</li>
                <li>Programme de fidélité et cash-back</li>
                <li>Services publicitaires pour les prestataires</li>
                <li>Labellisation et certification de qualité</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">4.2 Disponibilité</strong><br />
                Titelli s'efforce d'assurer une disponibilité optimale de la plateforme mais ne garantit 
                pas une accessibilité continue. Des interruptions pour maintenance peuvent survenir.
              </p>
            </div>
          </section>

          {/* Article 5 - Tarification */}
          <section className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-yellow-400" />
              Article 5 - Tarification et modalités de paiement
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">5.1 Prix</strong><br />
                Tous les prix sont indiqués en francs suisses (CHF), TVA comprise le cas échéant (art. 1 LTVA). 
                Titelli se réserve le droit de modifier ses tarifs à tout moment. Les modifications de prix 
                n'affectent pas les commandes déjà confirmées.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="font-bold text-white mb-3">Pour les Prestataires</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Inscription annuelle de base</span>
                      <span className="text-yellow-400 font-bold">250 CHF</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Abonnement Premium annuel</span>
                      <span className="text-yellow-400 font-bold">540 CHF</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Abonnement Premium mensuel</span>
                      <span className="text-yellow-400 font-bold">45 CHF/mois</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Commission sur ventes</span>
                      <span className="text-yellow-400 font-bold">10-20%</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="font-bold text-white mb-3">Services publicitaires</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Pub Média (image IA)</span>
                      <span className="text-yellow-400 font-bold">dès 29.90 CHF</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Vidéo Pub IA</span>
                      <span className="text-yellow-400 font-bold">dès 129.90 CHF</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Création sur mesure</span>
                      <span className="text-yellow-400 font-bold">149.90 CHF</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Bannière page d'accueil</span>
                      <span className="text-yellow-400 font-bold">50 CHF/mois</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="leading-relaxed mt-4">
                <strong className="text-white">5.2 Modalités de paiement</strong><br />
                Les paiements s'effectuent par carte bancaire via notre prestataire sécurisé Stripe. 
                Les moyens de paiement acceptés sont : Visa, Mastercard, American Express, TWINT.
              </p>
              
              <p className="leading-relaxed">
                <strong className="text-white">5.3 Facturation aux Prestataires</strong><br />
                Titelli verse aux Prestataires leurs revenus de ventes chaque début de mois pour les 
                transactions du mois précédent, après déduction de la commission convenue (cash-back client 
                inclus). Un relevé détaillé est fourni via le tableau de bord.
              </p>
            </div>
          </section>

          {/* Article 6 - Droit de rétractation */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-yellow-400" />
              Article 6 - Droit de rétractation et annulation
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">6.1 Droit de rétractation (Clients)</strong><br />
                Conformément aux pratiques commerciales suisses, le Client dispose d'un délai de 14 jours 
                à compter de la conclusion du contrat pour exercer son droit de rétractation pour les 
                abonnements et achats non consommés, sans avoir à justifier de motifs ni à payer de pénalités.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">6.2 Exceptions</strong><br />
                Le droit de rétractation ne s'applique pas :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Aux services entièrement exécutés avant la fin du délai de rétractation avec accord du Client</li>
                <li>Aux contenus numériques personnalisés (publicités générées par IA)</li>
                <li>Aux réservations de services à date fixe une fois le service rendu</li>
              </ul>
              <p className="leading-relaxed">
                <strong className="text-white">6.3 Politique d'annulation des Prestataires</strong><br />
                Les Prestataires peuvent résilier leur abonnement par courrier écrit adressé à Titelli 
                avec un préavis d'un mois avant la date de renouvellement. Sans notification, l'abonnement 
                est automatiquement reconduit pour une nouvelle période.
              </p>
            </div>
          </section>

          {/* Article 7 - Responsabilités */}
          <section className="bg-yellow-900/20 rounded-2xl p-6 border border-yellow-700/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Scale className="w-8 h-8 text-yellow-400" />
              Article 7 - Responsabilités
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">7.1 Responsabilité de Titelli</strong><br />
                Titelli agit en qualité d'intermédiaire technique entre Clients et Prestataires. À ce titre, 
                Titelli n'est pas partie aux contrats conclus entre Clients et Prestataires et ne saurait 
                être tenue responsable de la bonne exécution des prestations commandées, conformément à 
                l'art. 97 CO sur la responsabilité contractuelle.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">7.2 Limitation de responsabilité</strong><br />
                La responsabilité de Titelli est limitée aux dommages directs et prévisibles résultant d'un 
                manquement prouvé à ses obligations. En aucun cas, Titelli ne pourra être tenue responsable 
                des dommages indirects tels que perte de profit, perte de clientèle ou préjudice d'image.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">7.3 Responsabilité des Utilisateurs</strong><br />
                Les Utilisateurs sont responsables de l'exactitude des informations qu'ils fournissent et 
                du contenu qu'ils publient. Tout contenu illicite, diffamatoire ou contraire aux bonnes 
                mœurs pourra être supprimé sans préavis et entraîner la suspension du compte.
              </p>
            </div>
          </section>

          {/* Article 8 - Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-yellow-400" />
              Article 8 - Propriété intellectuelle
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">8.1 Droits de Titelli</strong><br />
                La plateforme Titelli, son design, ses logos, ses marques et l'ensemble de son contenu 
                (textes, images, vidéos, logiciels) sont protégés par le droit d'auteur suisse (Loi fédérale 
                sur le droit d'auteur, LDA) et les conventions internationales applicables. Toute reproduction, 
                représentation ou utilisation non autorisée est strictement interdite.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">8.2 Contenu généré par IA</strong><br />
                Les contenus publicitaires (images, vidéos) générés via nos outils d'intelligence artificielle 
                sont la propriété du Prestataire qui les a commandés, sous réserve d'une licence non-exclusive 
                accordée à Titelli pour leur diffusion sur la plateforme.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">8.3 Contenu des Utilisateurs</strong><br />
                En publiant du contenu sur la plateforme, l'Utilisateur accorde à Titelli une licence 
                mondiale, non-exclusive, gratuite et transférable pour utiliser, reproduire et afficher 
                ce contenu dans le cadre de l'exploitation de la plateforme.
              </p>
            </div>
          </section>

          {/* Article 9 - Protection des données */}
          <section className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Lock className="w-8 h-8 text-yellow-400" />
              Article 9 - Protection des données personnelles
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">9.1 Responsable du traitement</strong><br />
                Titelli SA, dont le siège est à Lausanne, est responsable du traitement des données 
                personnelles collectées sur la plateforme, conformément à la Loi fédérale sur la protection 
                des données (LPD) révisée et au Règlement européen RGPD pour les utilisateurs européens.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">9.2 Données collectées</strong><br />
                Nous collectons les données nécessaires à la fourniture de nos services : données 
                d'identification, coordonnées, données de paiement (traitées par Stripe), données 
                de navigation et préférences utilisateur.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">9.3 Droits des utilisateurs</strong><br />
                Conformément à la LPD, vous disposez d'un droit d'accès, de rectification, de suppression 
                et de portabilité de vos données. Pour exercer ces droits, contactez-nous à : privacy@titelli.com
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">9.4 Conservation</strong><br />
                Les données sont conservées pendant la durée nécessaire aux finalités pour lesquelles 
                elles ont été collectées, et au minimum pendant les délais légaux de conservation 
                (10 ans pour les données comptables selon l'art. 958f CO).
              </p>
            </div>
          </section>

          {/* Article 10 - Interdictions */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Ban className="w-8 h-8 text-red-400" />
              Article 10 - Utilisations interdites
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                Il est strictement interdit d'utiliser la plateforme Titelli pour :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Publier du contenu illégal, diffamatoire, discriminatoire ou contraire aux bonnes mœurs</li>
                <li>Usurper l'identité d'un tiers ou créer de faux comptes</li>
                <li>Collecter des données personnelles d'autres utilisateurs sans autorisation</li>
                <li>Introduire des virus ou codes malveillants</li>
                <li>Contourner les mesures de sécurité de la plateforme</li>
                <li>Utiliser des robots, scrapers ou outils automatisés sans autorisation</li>
                <li>Proposer des services illégaux ou non conformes à la législation suisse</li>
                <li>Porter atteinte à la réputation de Titelli ou de ses utilisateurs</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Tout manquement pourra entraîner la suspension immédiate du compte et d'éventuelles 
                poursuites judiciaires.
              </p>
            </div>
          </section>

          {/* Article 11 - Résiliation */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm font-bold">11</span>
              Résiliation
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">11.1 Par l'Utilisateur</strong><br />
                L'Utilisateur peut résilier son compte à tout moment via les paramètres de son profil 
                ou en contactant le service client. La résiliation prend effet immédiatement, sous 
                réserve des engagements en cours.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">11.2 Par Titelli</strong><br />
                Titelli peut suspendre ou résilier un compte en cas de violation des présentes CGV, 
                de comportement frauduleux ou d'atteinte à la sécurité de la plateforme, sans préavis 
                ni indemnité.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">11.3 Conséquences</strong><br />
                La résiliation entraîne la suppression du compte et des données associées, sous réserve 
                des obligations légales de conservation. Les sommes dues restent exigibles.
              </p>
            </div>
          </section>

          {/* Article 12 - Droit applicable et juridiction */}
          <section className="bg-blue-900/20 rounded-2xl p-6 border border-blue-700/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Gavel className="w-8 h-8 text-blue-400" />
              Article 12 - Droit applicable et juridiction compétente
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">12.1 Droit applicable</strong><br />
                Les présentes CGV sont régies par le droit suisse, à l'exclusion de ses règles de 
                conflit de lois et de la Convention de Vienne sur les contrats de vente internationale 
                de marchandises.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">12.2 Médiation</strong><br />
                En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute 
                action judiciaire. L'Utilisateur peut s'adresser à l'organisme de médiation de la 
                Fédération romande des consommateurs (FRC).
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">12.3 Juridiction compétente</strong><br />
                À défaut d'accord amiable, tout litige relatif à l'interprétation ou à l'exécution des 
                présentes CGV sera soumis à la compétence exclusive des tribunaux ordinaires du canton 
                de Vaud, siège social de Titelli SA, conformément aux art. 10 et suivants du Code de 
                procédure civile suisse (CPC).
              </p>
            </div>
          </section>

          {/* Article 13 - Dispositions diverses */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm font-bold">13</span>
              Dispositions diverses
            </h2>
            <div className="pl-11 space-y-4">
              <p className="leading-relaxed">
                <strong className="text-white">13.1 Intégralité</strong><br />
                Les présentes CGV constituent l'intégralité de l'accord entre les parties et remplacent 
                tout accord antérieur, oral ou écrit, relatif à leur objet.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">13.2 Nullité partielle</strong><br />
                Si une disposition des présentes CGV était déclarée nulle ou inapplicable, les autres 
                dispositions resteraient en vigueur, conformément à l'art. 20 al. 2 CO.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">13.3 Renonciation</strong><br />
                Le fait pour Titelli de ne pas exercer un droit prévu aux présentes CGV ne constitue 
                pas une renonciation à ce droit.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">13.4 Langue</strong><br />
                Les présentes CGV sont rédigées en français. En cas de traduction, seule la version 
                française fait foi.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Contact et informations légales</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-yellow-400">Titelli SA</h3>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>Rue du Grand-Pont 12<br />1003 Lausanne, Suisse</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>contact@titelli.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span>+41 21 XXX XX XX</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-yellow-400">Informations d'entreprise</h3>
                <p className="text-sm">IDE (Numéro d'identification) : CHE-XXX.XXX.XXX</p>
                <p className="text-sm">Registre du commerce : Canton de Vaud</p>
                <p className="text-sm">Capital social : CHF 100'000.-</p>
                <p className="text-sm">TVA : CHE-XXX.XXX.XXX TVA</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-500">
                Protection des données : privacy@titelli.com<br />
                Réclamations : reclamations@titelli.com
              </p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-wrap gap-6 text-sm text-gray-500">
          <Link to="/mentions-legales" className="hover:text-yellow-400 transition-colors">Mentions Légales</Link>
          <Link to="/politique-confidentialite" className="hover:text-yellow-400 transition-colors">Politique de Confidentialité</Link>
          <Link to="/about" className="hover:text-yellow-400 transition-colors">À Propos</Link>
          <Link to="/partenaires" className="hover:text-yellow-400 transition-colors">Nos Partenaires</Link>
        </div>
        
        <p className="mt-8 text-xs text-gray-600 text-center">
          © 2026 Titelli SA - Tous droits réservés - Version CGV 2.0 - Mars 2026
        </p>
      </div>
    </div>
  );
};

export default CGVPage;
