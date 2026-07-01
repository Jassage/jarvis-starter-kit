export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
      <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : juillet 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        {[
          {
            title: '1. Objet',
            content: `LAKAY est une plateforme en ligne de mise en relation entre propriétaires, agences immobilières et particuliers cherchant à louer ou acheter un bien immobilier en Haïti. Les présentes CGU régissent l'utilisation de la plateforme accessible à l'adresse lakay.ht.`,
          },
          {
            title: '2. Inscription et compte',
            content: `L'accès à certaines fonctionnalités de la plateforme nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. LAKAY se réserve le droit de suspendre ou supprimer tout compte en cas d'utilisation frauduleuse.`,
          },
          {
            title: '3. Publication d\'annonces',
            content: `Les annonces publiées doivent correspondre à des biens réels disponibles. Toute annonce frauduleuse, mensongère ou contraire aux bonnes mœurs sera supprimée. L'annonceur est seul responsable du contenu de ses annonces. LAKAY se réserve le droit de modérer et refuser toute annonce.`,
          },
          {
            title: '4. Responsabilité',
            content: `LAKAY agit en qualité d'intermédiaire et ne peut être tenu responsable des transactions entre utilisateurs. La plateforme ne garantit pas l'exactitude des informations publiées par les utilisateurs. LAKAY décline toute responsabilité en cas de litige entre les parties.`,
          },
          {
            title: '5. Protection des données',
            content: `Les données personnelles collectées sont utilisées pour le fonctionnement de la plateforme et ne sont pas cédées à des tiers sans consentement. Conformément à notre politique de confidentialité, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.`,
          },
          {
            title: '6. Propriété intellectuelle',
            content: `L'ensemble du contenu de la plateforme LAKAY (logos, textes, design, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.`,
          },
          {
            title: '7. Modification des CGU',
            content: `LAKAY se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par email ou notification sur la plateforme.`,
          },
          {
            title: '8. Contact',
            content: `Pour toute question relative aux présentes CGU, contactez-nous à : legal@lakay.ht`,
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
