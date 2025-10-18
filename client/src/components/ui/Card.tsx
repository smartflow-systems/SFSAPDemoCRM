export default function Card({title,className='',children}:{title?:string;className?:string;children:any}) {
  return (<div className={`glass-card p-5 text-[color:var(--sf-white)] ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
    {children}
  </div>);
}
