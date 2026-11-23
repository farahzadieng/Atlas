import Dexie, { type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'
import type {} from 'dexie-cloud-addon'
<<<<<<< HEAD
import { cloudUrl } from './atlasConfig'
=======
import { cloudReady, cloudUrl } from './atlasConfig'
>>>>>>> 95254a9 (first deploy)
export type ProjectStatus = 'active' | 'rest' | 'suspended' | 'completed'
export type ProjectType = string
export type CardType = 'task' | 'log' | 'note' | 'checklist' | 'decision'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type InboxKind = 'idea' | 'task' | 'note'
export interface Project { id:string; title:string; description:string; type:ProjectType; status:ProjectStatus; archivedAt?:number; createdAt:number; updatedAt:number }
export interface ChecklistItem { id:string; text:string; done:boolean }
export interface ProjectCategory { id:string; title:string; createdAt:number }
export interface Card { id:string; projectId:string; type:CardType; title:string; markdownBody:string; checklistItems?:ChecklistItem[]; progress?:number; eventDate?:string; dueAt?:string; taskStatus?:TaskStatus; priority?:Priority; isMainTask:boolean; isPinned:boolean; createdAt:number; updatedAt:number; completedAt?:number }
export interface Prompt { id:string; title:string; description:string; body:string; tags:string[]; isFavorite:boolean; projectId?:string; createdAt:number; updatedAt:number }
export interface InboxItem { id:string; content:string; kind:InboxKind; projectId?:string; createdAt:number; updatedAt:number }
export interface Activity { id:string; projectId:string; cardId?:string; kind:string; message:string; createdAt:number }
<<<<<<< HEAD
export const db = new Dexie('atlas-local-v1', { addons: [dexieCloud] }) as Dexie & { projects:EntityTable<Project,'id'>; cards:EntityTable<Card,'id'>; prompts:EntityTable<Prompt,'id'>; inbox:EntityTable<InboxItem,'id'>; activity:EntityTable<Activity,'id'>; projectTypes:EntityTable<ProjectCategory,'id'> }
=======
export const db = new Dexie('atlas-local-v1', cloudReady ? { addons: [dexieCloud] } : {}) as Dexie & { projects:EntityTable<Project,'id'>; cards:EntityTable<Card,'id'>; prompts:EntityTable<Prompt,'id'>; inbox:EntityTable<InboxItem,'id'>; activity:EntityTable<Activity,'id'>; projectTypes:EntityTable<ProjectCategory,'id'> }
>>>>>>> 95254a9 (first deploy)
// Upgrade the v0.1 database in place; pre-existing records remain intact.
db.version(1).stores({projects:'id, title, type, status, updatedAt',inbox:'id, kind, projectId, createdAt'})
db.version(2).stores({projects:'id, title, type, status, archivedAt, updatedAt',cards:'id, projectId, type, eventDate, dueAt, updatedAt, isMainTask',prompts:'id, title, isFavorite, updatedAt, *tags',inbox:'id, kind, projectId, createdAt',activity:'id, projectId, createdAt'}).upgrade(async tx => {
  await tx.table('projects').toCollection().modify((p: {status:string; archivedAt?:number; updatedAt:number}) => {
    if (p.status === 'paused') p.status='rest'
    if (p.status === 'archived') {p.status='rest';p.archivedAt=p.updatedAt}
  })
})
db.version(3).stores({projects:'id, title, type, status, archivedAt, updatedAt',cards:'id, projectId, type, eventDate, dueAt, updatedAt, isMainTask',prompts:'id, title, isFavorite, updatedAt, *tags',inbox:'id, kind, projectId, createdAt',activity:'id, projectId, createdAt',projectTypes:'id, title'}).upgrade(async tx=>{
  const defaults=[['website','وب‌سایت'],['app','اپلیکیشن'],['business','خرید و فروش'],['personal','شخصی'],['other','سایر']]
  await tx.table('projectTypes').bulkPut(defaults.map(([id,title])=>({id,title,createdAt:Date.now()})))
  await tx.table('cards').toCollection().modify((card:Card)=>{
    if(card.type==='checklist'&&!card.checklistItems){
      const lines=card.markdownBody.split('\n');const items:ChecklistItem[]=[];const others:string[]=[]
      for(const line of lines){const m=line.match(/^\s*[-*+]\s+\[([ xX])\]\s*(.*)$/);if(m)items.push({id:crypto.randomUUID(),text:m[2],done:m[1].toLowerCase()==='x'});else others.push(line)}
      card.checklistItems=items;card.markdownBody=others.join('\n').trim()
    }
  })
})
<<<<<<< HEAD
// Explicit authentication via AuthGate prevents duplicate automatic and manual OTP prompts.
// App data is only mounted after the matching user is logged in; do not query it before then.
// Dexie Cloud still enforces private realm permissions remotely.
db.cloud.configure({databaseUrl:cloudUrl, requireAuth:false})
=======
// Authentication requires Dexie Cloud. A public build never starts without a valid configuration.
if (cloudReady) db.cloud.configure({databaseUrl:cloudUrl, requireAuth:true})
>>>>>>> 95254a9 (first deploy)
export const uid=()=>crypto.randomUUID()
export const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
export function saveDownload(blob:Blob,filename:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export async function exportBackup(){const [projects,cards,prompts,inbox,activity,projectTypes]=await Promise.all([db.projects.toArray(),db.cards.toArray(),db.prompts.toArray(),db.inbox.toArray(),db.activity.toArray(),db.projectTypes.toArray()]);saveDownload(new Blob([JSON.stringify({format:'atlas-backup',version:3,exportedAt:new Date().toISOString(),projects,cards,prompts,inbox,activity,projectTypes},null,2)],{type:'application/json'}),`atlas-backup-${today()}.json`)}
export async function importBackup(file:File){if(file.size>20*1024*1024)throw Error('حجم فایل بیشتر از ۲۰ مگابایت است.');const raw:unknown=JSON.parse(await file.text());if(!raw||typeof raw!=='object')throw Error('فایل نامعتبر است.');const v=raw as Record<string,unknown>;if(v.format!=='atlas-backup'||![1,2,3].includes(Number(v.version)))throw Error('فرمت بکاپ معتبر نیست.');const tables=['projects','inbox',...(Number(v.version)>=2?['cards','prompts','activity']:[]),...(Number(v.version)>=3?['projectTypes']:[])] as const;for(const key of tables){if(!Array.isArray(v[key])||(v[key] as unknown[]).length>100000)throw Error(`اطلاعات ${key} نامعتبر است.`);for(const record of v[key] as unknown[]){if(!record||typeof record!=='object'||typeof (record as {id?:unknown}).id!=='string')throw Error(`شناسه نامعتبر در ${key}`)}}
 const projects=(v.projects as Array<Omit<Project, 'status'> & {status: ProjectStatus | 'paused' | 'archived'}>).map(p=>({
  ...p,
  status: p.status === 'paused' || p.status === 'archived' ? 'rest' as const : p.status,
  archivedAt: p.status === 'archived' ? (p.updatedAt || Date.now()) : p.archivedAt
})) satisfies Project[]
 const inbox=v.inbox as InboxItem[];const cards=(v.cards??[]) as Card[];const prompts=(v.prompts??[]) as Prompt[];const activity=(v.activity??[]) as Activity[];const projectTypes=(v.projectTypes??[]) as ProjectCategory[]
 if(projects.some(p=>!p.title||!['active','rest','suspended','completed'].includes(p.status))||cards.some(c=>!c.projectId||!c.type||typeof c.markdownBody!=='string')||prompts.some(p=>!p.title||!Array.isArray(p.tags)))throw Error('اطلاعات اصلی فایل ناقص است.')
 await db.transaction('rw',[db.projects,db.cards,db.prompts,db.inbox,db.activity,db.projectTypes],async()=>{await db.projectTypes.bulkPut(projectTypes);await db.projects.bulkPut(projects);await db.inbox.bulkPut(inbox);await db.cards.bulkPut(cards);await db.prompts.bulkPut(prompts);await db.activity.bulkPut(activity)})
 return {projects:projects.length,cards:cards.length,prompts:prompts.length,inbox:inbox.length}
}
export async function logActivity(projectId:string,kind:string,message:string,cardId?:string){await db.activity.add({id:uid(),projectId,kind,message,cardId,createdAt:Date.now()})}
export function icsForCard(card:Card,project:string){if(!card.dueAt)throw Error('ابتدا موعد کارت را تعیین کن.');const esc=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const date=card.dueAt.replace(/-/g,'');const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const event=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Atlas//Personal Knowledge Manager//FA','BEGIN:VEVENT',`UID:${card.id}@atlas.local`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${date}`,`DTEND;VALUE=DATE:${nextDate(card.dueAt)}`,`SUMMARY:${esc(card.title)}`,`DESCRIPTION:${esc(project+'\n'+card.markdownBody)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');saveDownload(new Blob([event],{type:'text/calendar;charset=utf-8'}),`atlas-${card.id}.ics`)}
function nextDate(day:string){const [y,m,d]=day.split('-').map(Number);return new Date(Date.UTC(y,m-1,d+1)).toISOString().slice(0,10).replace(/-/g,'')}
