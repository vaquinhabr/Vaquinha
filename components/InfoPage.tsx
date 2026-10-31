"use client";
import Link from "next/link";
import Header from "@/components/Header";

type Section = { title: string; body: string };
export default function InfoPage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return <div className="page-shell"><Header /><main className="container" style={{maxWidth:900,paddingTop:48,paddingBottom:80}}>
    <Link href="/" style={{color:"var(--green-800)",fontWeight:700,textDecoration:"none"}}>← Voltar ao início</Link>
    <div className="eyebrow" style={{marginTop:28}}>Vaquinha · Informação e transparência</div>
    <h1 style={{fontSize:"clamp(2rem,5vw,3.2rem)",lineHeight:1.1,margin:"12px 0 18px"}}>{title}</h1>
    <p style={{fontSize:18,lineHeight:1.8,color:"var(--muted)",maxWidth:760}}>{intro}</p>
    <div style={{display:"grid",gap:18,marginTop:32}}>{sections.map((s,i)=><section key={s.title} className="card" style={{padding:"clamp(20px,4vw,30px)"}}><h2 style={{fontSize:21,margin:"0 0 10px"}}>{i+1}. {s.title}</h2><p style={{margin:0,lineHeight:1.85,color:"var(--muted)",whiteSpace:"pre-line"}}>{s.body}</p></section>)}</div>
    <p style={{marginTop:30,color:"var(--muted)",fontSize:13,lineHeight:1.7}}>Esta página apresenta informações gerais da plataforma. Antes do lançamento de funcionalidades financeiras, os termos e processos deverão ser revisados conforme a operação real e a legislação aplicável.</p>
  </main></div>;
}
