export default function AvatarStack({ urls=[] }: { urls?: string[] }) {
  return (
    <div className="flex -space-x-2">
      {urls.slice(0,5).map((u,i)=>(
        <img key={i} src={u} alt={`User avatar ${i + 1}`} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" loading="lazy" aria-hidden="true"/>
      ))}
      {urls.length>5 && <div className="h-8 w-8 rounded-full bg-muted text-xs grid place-items-center ring-2 ring-white">+{urls.length-5}</div>}
    </div>
  );
}
