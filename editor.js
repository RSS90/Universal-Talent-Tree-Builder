// ----------------------
// Editor.js (English) - Fixed Add Tree Dropdown
// ----------------------

// --- Toggle Editor Visibility ---
function toggleEditor() {
  const editor = document.getElementById('editor');
  editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
  if (editor.style.display === 'block') renderEditor();
}

// --- Helper to get class block by name ---
function getClassBlock(name) {
  return Array.from(document.querySelectorAll('.class-block')).find(cb => {
    const btn = cb.querySelector('.collapsible');
    return btn && btn.textContent.trim() === name;
  });
}

// --- Initialize Collapsibles Globally ---
function initCollapsibles() {
  document.querySelectorAll('.collapsible').forEach(btn => {
    if (btn._toggleListener) btn.removeEventListener('click', btn._toggleListener);
    btn._toggleListener = function() {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      if(content) content.style.display = content.style.display==='block'?'none':'block';
    };
    btn.addEventListener('click', btn._toggleListener);
  });
}

// --- Initialize Collapsibles for Specific Container ---
function initCollapsiblesFor(container) {
  container.querySelectorAll('.collapsible').forEach(btn => {
    if(btn._toggleListener) btn.removeEventListener('click', btn._toggleListener);
    btn._toggleListener = function() {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      if(content) content.style.display = content.style.display==='block'?'none':'block';
    };
    btn.addEventListener('click', btn._toggleListener);
  });
}

// --- Render Editor ---
function renderEditor() {
  const container = document.getElementById('classes-container');
  container.innerHTML = '';

  Object.entries(TALENT_DATA.classes).forEach(([clsName, clsData]) => {
    const div = document.createElement('div');
    div.className = 'class-block';

    div.innerHTML = `
      <button class="collapsible">${clsName}</button>
      <div class="content">
        <label>Class Points Cap:
          <input type="number" value="${clsData.pointsCap}">
        </label>
        <button class="delete-class">❌ Delete Class</button>
        <button class="add-tree">+ Add Tree</button>
        <div class="trees"></div>
      </div>
    `;
    container.appendChild(div);

    const contentDiv = div.querySelector('.content');
    const pointsInput = contentDiv.querySelector('input[type=number]');
    pointsInput.addEventListener('change', e => clsData.pointsCap = parseInt(e.target.value));

    // Live rename class
    const classButton = div.querySelector('.collapsible');
    const classNameInput = document.createElement('input');
    classNameInput.type = 'text';
    classNameInput.value = clsName;
    classNameInput.addEventListener('input', e => {
      const oldName = clsName;
      clsName = e.target.value;
      classButton.textContent = clsName;
      if(oldName !== clsName) {
        TALENT_DATA.classes[clsName] = TALENT_DATA.classes[oldName];
        delete TALENT_DATA.classes[oldName];
      }
    });
    contentDiv.prepend(classNameInput);

    contentDiv.querySelector('.delete-class').addEventListener('click', () => deleteClass(clsName));

    // Add Tree button - prevent dropdown from closing
    contentDiv.querySelector('.add-tree').addEventListener('click', e => {
      e.stopPropagation(); // prevent collapsible toggle
      addTree(clsName);
    });

    // Render Trees
    const treesDiv = contentDiv.querySelector('.trees');
    clsData.trees.forEach((tree, ti) => renderTree(clsName, tree, ti, treesDiv));
  });

  initCollapsibles();
}

// --- Render Tree ---
function renderTree(clsName, tree, ti, container) {
  const tdiv = document.createElement('div');
  tdiv.className = 'tree-block';

  tdiv.innerHTML = `
    <button class="collapsible">${tree.name} (${tree.id})</button>
    <div class="content">
      <label>Name: <input type="text" value="${tree.name}"></label>
      <label>ID: <input type="text" value="${tree.id}"></label>
      <label>Icon: <input type="text" value="${tree.ico}"></label>
      <label>Points Cap (Tree): <input type="number" value="${tree.pointsCap||0}"></label>
      <button class="delete-tree">❌ Delete Tree</button>
      <button class="add-talent">+ Add Talent</button>
      <div class="talents"></div>
    </div>
  `;
  container.appendChild(tdiv);

  const content = tdiv.querySelector('.content');
  const inputs = content.querySelectorAll('input');
  inputs[0].addEventListener('input', e => { 
    tree.name = e.target.value; 
    tdiv.querySelector('.collapsible').textContent = tree.name; 
  });
  inputs[1].addEventListener('change', e => tree.id = e.target.value);
  inputs[2].addEventListener('change', e => tree.ico = e.target.value);
  inputs[3].addEventListener('change', e => tree.pointsCap = parseInt(e.target.value));

  content.querySelector('.delete-tree').addEventListener('click', () => deleteTree(clsName, ti));

  // Add Talent button
  content.querySelector('.add-talent').addEventListener('click', e => {
    e.stopPropagation();
    addTalent(clsName, ti, content.querySelector('.talents'));
  });

  tree.talents.forEach((tal, idx) => renderTalent(clsName, ti, tal, idx, content.querySelector('.talents')));

  initCollapsiblesFor(tdiv);
}

// --- Render Talent ---
function renderTalent(clsName, ti, tal, idx, container) {
  const talDiv = document.createElement('div');
  talDiv.className = 'talent-block';

  talDiv.innerHTML = `
    <button class="collapsible">${tal.name}</button>
    <div class="content">
      <label>Name: <input type="text" value="${tal.name}"></label>
      <label>ID: <input type="text" value="${tal.id}"></label>
      <label>Icon: <input type="text" value="${tal.icon}"></label>
      <label>Row: <input type="number" value="${tal.row}"></label>
      <label>Col: <input type="number" value="${tal.col}"></label>
      <label>Max Rank: <input type="number" value="${tal.maxRank}"></label>
      <div class="rank-list"></div>
      <button class="add-rank">+ Add Rank</button>
      <button class="delete-talent">❌ Delete Talent</button>
    </div>
  `;
  container.appendChild(talDiv);

  const content = talDiv.querySelector('.content');
  const inputs = content.querySelectorAll('input');
  inputs[0].addEventListener('input', e => { 
    tal.name = e.target.value;
    talDiv.querySelector('.collapsible').textContent = tal.name;
  });
  inputs[1].addEventListener('change', e => tal.id = e.target.value);
  inputs[2].addEventListener('change', e => tal.icon = e.target.value);
  inputs[3].addEventListener('change', e => tal.row = parseInt(e.target.value));
  inputs[4].addEventListener('change', e => tal.col = parseInt(e.target.value));
  inputs[5].addEventListener('change', e => tal.maxRank = parseInt(e.target.value));

  // Ranks
  const rankList = content.querySelector('.rank-list');
  tal.ranksDesc.forEach((rd, i) => {
    const rdDiv = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = rd;
    input.addEventListener('change', e => tal.ranksDesc[i] = e.target.value);
    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.addEventListener('click', () => deleteRank(clsName, ti, idx, i));
    rdDiv.appendChild(input);
    rdDiv.appendChild(delBtn);
    rankList.appendChild(rdDiv);
  });

  content.querySelector('.add-rank').addEventListener('click', e => {
    e.stopPropagation();
    addRankDesc(clsName, ti, idx, rankList);
  });
  content.querySelector('.delete-talent').addEventListener('click', () => deleteTalent(clsName, ti, idx));
  initCollapsiblesFor(talDiv);
}

// --- CRUD / Add / Delete functions ---
function addClass() {
  let newName = 'NewClass';
  let counter = 1;
  while(TALENT_DATA.classes[newName]) newName = 'NewClass' + counter++;
  TALENT_DATA.classes[newName] = { pointsCap: 51, trees: [] };
  renderEditor();
}
function deleteClass(clsName) { delete TALENT_DATA.classes[clsName]; renderEditor(); }
function addTree(clsName) {
  const tree = { id:'new-tree', name:'New Tree', ico:'', pointsCap:0, talents:[] };
  const clsData = TALENT_DATA.classes[clsName];
  clsData.trees.push(tree);
  const classBlock = getClassBlock(clsName);
  if(classBlock) renderTree(clsName, tree, clsData.trees.length-1, classBlock.querySelector('.trees'));
}
function deleteTree(clsName, ti) { TALENT_DATA.classes[clsName].trees.splice(ti,1); renderEditor(); }
function addTalent(clsName, ti, container) {
  const tal = { id:'new-talent', name:'New Talent', icon:'', row:0, col:0, maxRank:1, ranksDesc:['New Description'] };
  const tree = TALENT_DATA.classes[clsName].trees[ti];
  tree.talents.push(tal);
  renderTalent(clsName, ti, tal, tree.talents.length-1, container);
}
function deleteTalent(clsName, ti, idx) { TALENT_DATA.classes[clsName].trees[ti].talents.splice(idx,1); renderEditor(); }
function addRankDesc(clsName, ti, idx, container) {
  const tal = TALENT_DATA.classes[clsName].trees[ti].talents[idx];
  tal.ranksDesc.push('New Rank Description');
  const rdDiv = document.createElement('div');
  const input = document.createElement('input');
  input.type='text';
  input.value='New Rank Description';
  input.addEventListener('change', e => tal.ranksDesc[tal.ranksDesc.length-1] = e.target.value);
  const delBtn = document.createElement('button');
  delBtn.textContent='❌';
  delBtn.addEventListener('click', () => deleteRank(clsName, ti, idx, tal.ranksDesc.length-1));
  rdDiv.appendChild(input);
  rdDiv.appendChild(delBtn);
  container.appendChild(rdDiv);
}
function deleteRank(clsName, ti, idx, ri) { TALENT_DATA.classes[clsName].trees[ti].talents[idx].ranksDesc.splice(ri,1); renderEditor(); }

// --- Save / Import ---
function saveToDataJS() {
  const jsCode = "var TALENT_DATA = " + JSON.stringify(TALENT_DATA,null,2) + ";";
  const blob = new Blob([jsCode], {type:'application/javascript'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "data.js";
  a.click();
}
function importData(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = e => { TALENT_DATA = JSON.parse(e.target.result); renderEditor(); };
  reader.readAsText(file);
}
