export default function EventoDetailPage({ params }: { params: { slug: string } }) { return <div><h1 className="text-2xl font-bold">Evento: {params.slug}</h1></div>; }
