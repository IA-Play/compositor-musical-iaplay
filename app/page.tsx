import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const sections = ["Vídeos recentes", "Lives", "Matérias", "Eventos", "Ofertas/Ações Sociais"];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-teal-950 to-slate-900 p-8">
        <h1 className="text-4xl font-bold">Portal Oficial NoAlvo</h1>
        <p className="mt-3 max-w-2xl text-slate-200">Conteúdo centralizado com vídeos, lives, matérias, eventos, ofertas e automações de comunicação.</p>
        <div className="mt-5 flex gap-3">
          <Button asChild><Link href="/inscrever-se">Inscrever-se</Link></Button>
          <Button variant="outline" asChild><Link href="/eventos">Ver eventos</Link></Button>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((title) => (
          <Card key={title} className="p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-slate-300">Bloco alimentado por sincronização automática e curadoria administrativa.</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
