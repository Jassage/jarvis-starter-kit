export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Politique de Confidentialité</h1>
      <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : juillet 2026</p>

      <div className="space-y-8">
        {[
          {
            title: '1. Données collectées',
            content: `Lors de votre inscription et utilisation de LAKAY, nous collectons : vos informations d'identité (nom, prénom, email, téléphone), vos données de navigation (pages visitées, actions effectuées), et les contenus que vous publiez (annonces, messages, photos).`,
          },
          {
            title: '2. Utilisation des données',
            content: `Vos données sont utilisées pour : créer et gérer votre compte, faciliter la mise en relation entre utilisateurs, améliorer nos services, vous envoyer des notifications relatives à votre activité sur la plateforme, et respecter nos obligations légales.`,
          },
          {
            title: '3. Conservation des données',
            content: `Vos données personnelles sont conservées pendant la durée de votre compte et jusqu'à 3 ans après sa suppression, sauf obligation légale contraire.`,
          },
          {
            title: '4. Partage des données',
            content: `Nous ne vendons pas vos données personnelles. Certaines informations sont partagées avec d'autres utilisateurs dans le cadre normal du fonctionnement de la plateforme (ex: votre numéro de téléphone visible sur une annonce si vous le souhaitez). Nous pouvons faire appel à des prestataires techniques (hébergement, emails) soumis à des obligations de confidentialité.`,
          },
          {
            title: '5. Vos droits',
            content: `Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à privacy@lakay.ht. Nous répondrons à votre demande dans un délai de 30 jours.`,
          },
          {
            title: '6. Cookies',
            content: `LAKAY utilise des cookies techniques nécessaires au fonctionnement de la plateforme. Ces cookies ne stockent pas d'informations personnelles sensibles et ne sont pas utilisés à des fins publicitaires.`,
          },
          {
            title: '7. Sécurité',
            content: `Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, perte ou altération : chiffrement des mots de passe, HTTPS, accès restreint aux données personnelles.`,
          },
          {
            title: '8. Contact',
            content: `Pour toute question relative à vos données personnelles : privacy@lakay.ht`,
          },
        ].map(section => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
