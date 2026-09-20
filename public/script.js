const $ = (id) => document.getElementById(id);
const today = new Date().toISOString().slice(0, 10);
const state = {
  students: JSON.parse(localStorage.getItem("attendly_students")) || [
    {id:1,name:"Arun Kumar",roll:"IT202601",className:"IT - III Year"},
    {id:2,name:"Divya Sri",roll:"IT202602",className:"IT - III Year"},
    {id:3,name:"Karthik Raj",roll:"IT202603",className:"IT - III Year"},
    {id:4,name:"Meena Devi",roll:"IT202604",className:"IT - III Year"},
    {id:5,name:"Naveen S",roll:"IT202605",className:"IT - III Year"},
    {id:6,name:"Priya M",roll:"IT202606",className:"IT - III Year"},
    {id:7,name:"Rahul V",roll:"IT202607",className:"IT - III Year"},
    {id:8,name:"Sanjay P",roll:"IT202608",className:"IT - III Year"}
  ],
  records: JSON.parse(localStorage.getItem("attendly_records")) || {},
  currentDate: today
};

function save() {
  localStorage.setItem("attendly_students", JSON.stringify(state.students));
  localStorage.setItem("attendly_records", JSON.stringify(state.records));
}
function dateKey(date=state.currentDate){return date}
function getRecord(studentId,date=state.currentDate){return state.records[date]?.[studentId] || "Present"}
function setRecord(studentId,status,date=state.currentDate){
  if(!state.records[date]) state.records[date]={};
  state.records[date][studentId]=status; save();
}
function attendanceStats(studentId){
  let present=0,absent=0,late=0;
  Object.values(state.records).forEach(day=>{
    const status=day[studentId];
    if(status==="Present")present++;
    if(status==="Absent")absent++;
    if(status==="Late")late++;
  });
  const total=present+absent+late;
  return {present,absent,late,total,rate:total?Math.round((present+late*.5)/total*100):100};
}
function todayStats(){
  let present=0,absent=0,late=0;
  state.students.forEach(s=>{
    const status=getRecord(s.id);
    if(status==="Present")present++; if(status==="Absent")absent++; if(status==="Late")late++;
  });
  return {present,absent,late,total:state.students.length};
}
function initials(name){return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function statusBadge(rate){return `<span class="status ${rate>=75?"good":"bad"}">${rate>=75?"Healthy":"Needs support"}</span>`}
function studentCell(s){return `<div class="student-cell"><div class="student-avatar">${initials(s.name)}</div><div><strong>${s.name}</strong><small>${s.roll}</small></div></div>`}
function classOptions(){
  const classes=[...new Set(state.students.map(s=>s.className))];
  $("classFilter").innerHTML='<option value="all">All classes</option>'+classes.map(c=>`<option>${c}</option>`).join("");
}
function renderDashboard(){
  const t=todayStats();
  $("totalStudents").textContent=state.students.length;
  $("presentToday").textContent=t.present;
  $("absentToday").textContent=t.absent;
  $("presentHint").textContent=`${Math.round(t.present/t.total*100||0)}% of students`;
  const rates=state.students.map(s=>attendanceStats(s.id).rate);
  $("averageRate").textContent=`${Math.round(rates.reduce((a,b)=>a+b,0)/(rates.length||1))}%`;
  $("donutValue").textContent=`${Math.round(t.present/t.total*100||0)}%`;
  $("legendPresent").textContent=t.present;$("legendAbsent").textContent=t.absent;$("legendLate").textContent=t.late;
  const presentDeg=t.present/t.total*360||0;
  $("donut").style.background=`conic-gradient(#6c63ff 0deg ${presentDeg}deg,#ff9b61 ${presentDeg}deg ${presentDeg+t.absent/t.total*360}deg,#55b8f2 ${presentDeg+t.absent/t.total*360}deg 360deg)`;
  const chart=$("trendChart"); const days=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10);const rec=state.records[key]||{};let p=0,total=0;state.students.forEach(s=>{if(rec[s.id]){total++;if(rec[s.id]==="Present")p++;}});days.push({label:d.toLocaleDateString("en",{weekday:"short"}),value:total?Math.round(p/total*100):0});}
  chart.innerHTML=days.map(d=>`<div class="bar-wrap"><div class="bar" style="height:${Math.max(d.value,5)}%"></div><small>${d.label}</small></div>`).join("");
  const low=state.students.filter(s=>attendanceStats(s.id).rate<75);
  $("attentionTable").innerHTML=low.length?low.map(s=>`<tr><td>${studentCell(s)}</td><td>${s.className}</td><td><strong>${attendanceStats(s.id).rate}%</strong></td><td>${statusBadge(attendanceStats(s.id).rate)}</td></tr>`).join(""):`<tr><td colspan="4">All students are currently above the attention threshold 🎉</td></tr>`;
}
function renderStudents(){
  const q=$("studentSearch").value.toLowerCase(), cls=$("classFilter").value;
  const list=state.students.filter(s=>(s.name+" "+s.roll).toLowerCase().includes(q)&&(cls==="all"||s.className===cls));
  $("studentsTable").innerHTML=list.map(s=>{const a=attendanceStats(s.id);return `<tr><td>${studentCell(s)}</td><td>${s.roll}</td><td>${s.className}</td><td><strong>${a.rate}%</strong></td><td><button class="text-button delete-student" data-id="${s.id}">Remove</button></td></tr>`}).join("");
  document.querySelectorAll(".delete-student").forEach(btn=>btn.onclick=()=>{state.students=state.students.filter(s=>s.id!=btn.dataset.id);save();refresh();toast("Student removed");});
}
function renderAttendance(){
  const q=$("attendanceSearch").value.toLowerCase();
  const list=state.students.filter(s=>(s.name+" "+s.roll).toLowerCase().includes(q));
  const counts={Present:0,Absent:0,Late:0};
  list.forEach(s=>counts[getRecord(s.id)]++);
  $("attendanceSummary").innerHTML=Object.entries(counts).map(([k,v])=>`<div class="summary-pill">${k}: <b>${v}</b></div>`).join("");
  $("attendanceTable").innerHTML=list.map(s=>`<tr><td>${studentCell(s)}</td><td>${s.className}</td><td><select class="select-status attendance-select" data-id="${s.id}"><option ${getRecord(s.id)==="Present"?"selected":""}>Present</option><option ${getRecord(s.id)==="Absent"?"selected":""}>Absent</option><option ${getRecord(s.id)==="Late"?"selected":""}>Late</option></select></td></tr>`).join("");
  document.querySelectorAll(".attendance-select").forEach(sel=>sel.onchange=()=>{setRecord(sel.dataset.id,sel.value);renderAttendance();renderDashboard();});
}
function renderReports(){
  const rows=state.students.map(s=>({s,a:attendanceStats(s.id)}));
  $("highCount").textContent=rows.filter(x=>x.a.rate>=75).length;
  $("lowCount").textContent=rows.filter(x=>x.a.rate<75).length;
  $("reportTable").innerHTML=rows.map(x=>`<tr><td>${studentCell(x.s)}</td><td>${x.a.present}</td><td>${x.a.absent}</td><td>${x.a.late}</td><td><strong>${x.a.rate}%</strong></td></tr>`).join("");
}
function refresh(){classOptions();renderDashboard();renderStudents();renderAttendance();renderReports();}
function showView(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
  $(view+"View").classList.add("active-view");
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const titles={dashboard:"Good morning, Admin 👋",students:"Manage your student community",attendance:"Make every day count",reports:"Your attendance insights"};
  $("pageTitle").textContent=titles[view];$("sidebar").classList.remove("open");
}
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>showView(b.dataset.view));
document.querySelectorAll("[data-view-target]").forEach(b=>b.onclick=()=>showView(b.dataset.viewTarget));
$("quickMarkBtn").onclick=()=>showView("attendance");
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("attendly_theme",document.body.classList.contains("dark")?"dark":"light");$("themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾"};
if(localStorage.getItem("attendly_theme")==="dark"){$("themeBtn").click()}
$("studentSearch").oninput=renderStudents;$("classFilter").onchange=renderStudents;$("attendanceSearch").oninput=renderAttendance;
$("attendanceDate").value=today;$("attendanceDate").onchange=e=>{state.currentDate=e.target.value;renderAttendance()};
$("saveAttendanceBtn").onclick=()=>{save();toast(`Attendance saved for ${state.currentDate}`);renderDashboard()};
$("addStudentBtn").onclick=()=>$("modalBackdrop").classList.add("show");
$("closeModal").onclick=()=>$("modalBackdrop").classList.remove("show");
$("modalBackdrop").onclick=e=>{if(e.target===$("modalBackdrop"))$("modalBackdrop").classList.remove("show")};
$("studentForm").onsubmit=e=>{e.preventDefault();const student={id:Date.now(),name:$("newName").value.trim(),roll:$("newRoll").value.trim(),className:$("newClass").value};state.students.push(student);save();$("studentForm").reset();$("modalBackdrop").classList.remove("show");refresh();toast("Student added successfully")};
$("exportBtn").onclick=()=>{
  const rows=[["Name","Roll Number","Class","Present","Absent","Late","Attendance Rate"]];
  state.students.forEach(s=>{const a=attendanceStats(s.id);rows.push([s.name,s.roll,s.className,a.present,a.absent,a.late,a.rate+"%"])});
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="attendance-report.csv";a.click();URL.revokeObjectURL(url);toast("CSV report exported");
};
refresh();