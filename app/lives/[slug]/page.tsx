export default function LiveDetailPage({ params }: { params: { slug: string } }) { return <div><h1 className="text-2xl font-bold">Live: {params.slug}</h1></div>; }
