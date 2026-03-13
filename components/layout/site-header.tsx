import Link from "next/link";

const nav = [
  ["Vídeos", "/videos"],
  ["Lives", "/lives"],
  ["Matérias", "/materias"],
  ["Eventos", "/eventos"],
  ["Ofertas", "/ofertas"],
  ["Buscar", "/buscar"]
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="container-pad flex h-16 items-center justify-between">
        <Link className="font-semibold" href="/">
          NoAlvo Platform
        </Link>
        <nav className="flex gap-4 text-sm text-slate-300">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
