const classNames = Object.keys(TALENT_DATA.classes || {});
const firstClass = classNames.length > 0 ? classNames[0] : null;

let state = {
  selectedClass: firstClass,
  totalCap: firstClass ? TALENT_DATA.classes[firstClass].pointsCap : 0,
  ranks: {},
  spentByTree: {}
};

const elTrees=document.getElementById('trees'), elTotal=document.getElementById('totalPoints'), elTooltip=document.getElementById('tooltip');
let elClass;

function getClassData(){
	return TALENT_DATA.classes[state.selectedClass];
}
	
function getTree(treeId){
	return getClassData().trees.find(t=>t.id===treeId)
}
	
function getTalent(talentId){
	return getClassData().trees.flatMap(t=>t.talents).find(x=>x.id===talentId)
}
	
function totalSpent(){
	return Object.values(state.spentByTree).reduce((a,b)=>a+b,0)
}
	
function tierUnlocked(treeId,row){
	if(row===0)return true;
	return (state.spentByTree[treeId]||0)>=row*TALENT_DATA.pointsPerTier
}
	
function meetsPrereq(talent){
	if(!talent.requires)return true;
	const cur=state.ranks[talent.requires.talentId]||0;return cur>=(talent.requires.rank||1)
}

function render() {
  elTrees.innerHTML = '';
  const cd = getClassData();

  cd.trees.forEach(tree => {
    const card = document.createElement('section');
    card.className = 'tree-card-'; // optional: + tree.id für CSS

    const head = document.createElement('div');

    const ico = document.createElement('img');
    ico.src = tree.ico;
    ico.className = 'specicon';
    card.appendChild(ico);

    head.innerHTML = `<div id=${tree.id} style="background: #00000070; padding:5px; margin-bottom: 20px;">${tree.name}: <span id="spent-${tree.id}">${state.spentByTree[tree.id]||0}</span></div>`;

    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${TALENT_DATA.grid.cols}, 36px)`;
    grid.style.gridTemplateRows = `repeat(${TALENT_DATA.grid.rows}, 36px)`;
    grid.style.justifyContent = 'center';
    grid.style.alignContent = 'center'; 
    grid.style.gap = '18px';

    // Erstelle leere Zellen
    for (let r = 0; r < TALENT_DATA.grid.rows; r++) {
      for (let c = 0; c < TALENT_DATA.grid.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        grid.appendChild(cell);
      }
    }

    // Platziere Talente
    tree.talents.forEach(talent => placeTalent(grid, tree, talent));

    card.appendChild(head);
    card.appendChild(grid);
    elTrees.appendChild(card);
  });

  elTotal.textContent = totalSpent();

  // Jetzt erst alle Talent-Sperren aktualisieren
  updateTalentStates();

}

function gridIndex(row,col){
  return row*TALENT_DATA.grid.cols+col
}

// Tooltip
function setupTooltip(wrap, talent){
  wrap.addEventListener('mouseenter', e => {
    const cur = state.ranks[talent.id] || 0;

    // Use ranksDesc from data.js
    const descArr = talent.ranksDesc || talent.description || [];
    let curDesc = '';
    let nextDesc = '';

    if (Array.isArray(descArr)) {
      if (cur > 0 && descArr[cur-1]) curDesc = descArr[cur-1];
      else if (descArr[0]) curDesc = descArr[0];
      if (cur >=1 && cur < talent.maxRank && descArr[cur]) nextDesc = descArr[cur];
    }

    let html = `<b style="color:#fff">${talent.name}</b><br/>${curDesc}<br/>`;
    if (nextDesc) html += `<br/><span style="color: #ffd100">Next Rank:</span><br/><span style="color: #fff;">${nextDesc}</span>`;

    elTooltip.innerHTML = html;
    elTooltip.style.display = 'block';
    elTooltip.style.position = 'fixed';
    elTooltip.style.left = (e.clientX + 12) + 'px';
    elTooltip.style.top = (e.clientY + 12) + 'px';
  });

  wrap.addEventListener('mousemove', e => {
    elTooltip.style.left = (e.clientX + 12) + 'px';
    elTooltip.style.top = (e.clientY + 12) + 'px';
  });

  wrap.addEventListener('mouseleave', e => {
    elTooltip.style.display = 'none';
    elTooltip.textContent='';
  });
}


function placeTalent(grid, tree, talent) {
  const idx = gridIndex(talent.row, talent.col);
  const cell = grid.children[idx];
  if (!cell) return; // Safety Check

  const wrap = document.createElement('div');
  wrap.className = 'talent';
  wrap.id = `talent-${talent.id}`;

  const img = document.createElement('img');
  img.src = talent.icon;
  img.alt = talent.name;
  wrap.appendChild(img);

  const rank = document.createElement('div');
  rank.className = 'rank';
  rank.id = `rank-${talent.id}`;
  rank.textContent = `${state.ranks[talent.id] || 0}/${talent.maxRank}`;
  wrap.appendChild(rank);

  const btn = document.createElement('button');
  btn.style.all = 'unset';
  btn.style.position = 'absolute';
  btn.style.inset = 0;
  btn.addEventListener('click', e => spendPoint(tree.id, talent.id));
  btn.addEventListener('contextmenu', e => { e.preventDefault(); refundPoint(tree.id, talent.id); });
  wrap.appendChild(btn);

  cell.appendChild(wrap);
  setupTooltip(wrap, talent);
}


function spendPoint(treeId,talentId){const talent=getTalent(talentId)
const cur=state.ranks[talentId]||0;
	if(totalSpent()>=state.totalCap){showToast('Maximum Points Reached');
		return
	}if(cur>=talent.maxRank)
		return;
	if(!tierUnlocked(treeId,talent.row)){showToast('Tier Locked – Invest More Points In Previous Tiers');
		return
	}if(!meetsPrereq(talent)){showToast('Requirements Not Met');
		return
	}state.ranks[talentId]=cur+1;state.spentByTree[treeId]=(state.spentByTree[treeId]||0)+1;render();
updateTalentStates();}

function canRefund(treeId, talentId){
  const cur = state.ranks[talentId] || 0; if(cur <= 0)
    return false;
  const dependents = getClassData().trees.flatMap(t=>t.talents).filter(t=>t.requires && t.requires.talentId === talentId);

  if(dependents.some(d => (state.ranks[d.id]||0) > 0))
    return false;

  const simulatedRanks = Object.assign({}, state.ranks);
  simulatedRanks[talentId] = Math.max(0, simulatedRanks[talentId] - 1);
  const tree = getTree(treeId);
  const rows = TALENT_DATA.grid.rows;
  const pointsInRowAfter = new Array(rows).fill(0);
  tree.talents.forEach(t => {
    const r = t.row; const rank = simulatedRanks[t.id] || 0; pointsInRowAfter[r] += rank;
  });
  for(let h=1; h<rows; h++){
    const pointsAbove = pointsInRowAfter.slice(h).reduce((a,b)=>a+b,0);
    if(pointsAbove > 0){
      const pointsBelow = pointsInRowAfter.slice(0,h).reduce((a,b)=>a+b,0);
      if(pointsBelow < h * TALENT_DATA.pointsPerTier) return false;
    }
  }
  return true;
}

function refundPoint(treeId,talentId){
  const cur=state.ranks[talentId]||0; if(cur<=0) return;
  if(!canRefund(treeId, talentId)){
    showToast('Cannot be removed — first remove points from higher-tier or dependent talents.');
	  updateTalentStates();
    return;
  }
  state.ranks[talentId]=cur-1; state.spentByTree[treeId]=Math.max(0,(state.spentByTree[treeId]||0)-1); render();}

function initClassSelect(){
  elClass=document.getElementById('classSelect');
  elClass.innerHTML='';Object.keys(TALENT_DATA.classes).forEach(cls=>{const o=document.createElement('option');o.value=cls;o.textContent=cls;elClass.appendChild(o)});
  elClass.value=state.selectedClass;
  elClass.addEventListener('change',()=>{state.selectedClass=elClass.value;state.totalCap=TALENT_DATA.classes[state.selectedClass].pointsCap;state.ranks={};state.spentByTree={};render();});
}

document.getElementById('resetAll').addEventListener('click',()=>{state.ranks={};state.spentByTree={};render();});

function showToast(msg){
  elTooltip.textContent = msg; elTooltip.style.display = 'block'; setTimeout(()=>{ elTooltip.style.display='none'; elTooltip.textContent=''; }, 1800);
}

window.addEventListener('load',()=>{initClassSelect();render();});

function totalPointsInTree(treeId, klass) {
  let total = 0;
  const tree = klass.trees.find(t => t.id === treeId);
  if (!tree) return total;

  tree.talents.forEach(talent => {
    total += state.ranks[talent.id] || 0;
  });

  return total;
}



function updateTalentStates() {
  Object.values(TALENT_DATA.classes).forEach(klass => {
    klass.trees.forEach(tree => {
      // Punkte pro Reihe berechnen
      const pointsPerRow = Array(TALENT_DATA.grid.rows).fill(0);
      tree.talents.forEach(t => {
        pointsPerRow[t.row] += state.ranks[t.id] || 0;
      });

      tree.talents.forEach(talent => {
        const wrap = document.querySelector(`#talent-${talent.id}`);
        if (!wrap) return;

        let isLocked = false;

        // Tier-Sperre: erste Reihe immer freigeschaltet
        if (talent.row > 0) {
          const pointsBelow = pointsPerRow.slice(0, talent.row).reduce((a, b) => a + b, 0);
          const required = talent.row * TALENT_DATA.pointsPerTier;
          if (pointsBelow < required) isLocked = true;
        }

        // Abhängigkeiten prüfen
        if (talent.requires) {
          const reqRank = state.ranks[talent.requires.talentId] || 0;
          if (reqRank < (talent.requires.rank || 1)) isLocked = true;
        }

        // CSS setzen
        if (isLocked) wrap.classList.add("locked");
        else wrap.classList.remove("locked");
      });
    });
  });
}





