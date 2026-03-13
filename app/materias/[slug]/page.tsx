export default function MateriaDetailPage({ params }: { params: { slug: string } }) { return <div><h1 className="text-2xl font-bold">Matéria: {params.slug}</h1></div>; }
