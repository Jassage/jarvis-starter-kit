export interface LegalBloc {
  titre: string;
  texte: string;
}

export default function LegalContent({ blocs }: { blocs: LegalBloc[] }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {blocs.map((bloc) => (
          <div key={bloc.titre}>
            <h2 className="text-lg font-black text-gray-900 mb-3">{bloc.titre}</h2>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{bloc.texte}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
