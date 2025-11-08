export default function Page({title,children}:{title:string;children:any}){
  return (<div className="min-h-screen bg-[color:var(--sf-black)]">
    <header className="gold-gradient text-[color:var(--sf-black)] px-6 py-4 font-semibold rounded-b-2xl">{title}</header>
    <main className="p-6 grid gap-6 md:grid-cols-2">{children}</main>
  </div>);
}
