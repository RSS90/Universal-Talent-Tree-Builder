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

    // --- Live rename class ---
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
    contentDiv.prepend("Class Name: ", classNameInput);

    contentDiv.querySelector('.delete-class').addEventListener('click', () => deleteClass(clsName, div));

    // --- Add Tree button ---
    contentDiv.querySelector('.add-tree').addEventListener('click', e => {
      e.stopPropagation();
      addTree(clsName);
    });

    // --- Render Trees ---
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
    tdiv.querySelector('.collapsible').textContent = `${tree.name} (${tree.id})`; 
  });
  inputs[1].addEventListener('change', e => tree.id = e.target.value);
  inputs[2].addEventListener('change', e => tree.ico = e.target.value);
  inputs[3].addEventListener('change', e => tree.pointsCap = parseInt(e.target.value));

  content.querySelector('.delete-tree').addEventListener('click', () => {
    const ti = Array.from(container.children).indexOf(tdiv);
    deleteTree(clsName, ti, tdiv);
  });

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
      <label>Talent Name: <input type="text" value="${tal.name}"></label>
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

  // --- Render Ranks ---
  const rankList = content.querySelector('.rank-list');
  tal.ranksDesc.forEach((rd) => {
    renderRank(clsName, ti, idx, rd, rankList, tal);
  });

  content.querySelector('.add-rank').addEventListener('click', e => {
    e.stopPropagation();
    addRankDesc(clsName, ti, idx, rankList);
  });

  content.querySelector('.delete-talent').addEventListener('click', () => {
    const idx = Array.from(container.children).indexOf(talDiv);
    deleteTalent(clsName, ti, idx, talDiv);
  });

  initCollapsiblesFor(talDiv);
}

// --- Render Rank ---
function renderRank(clsName, ti, idx, rd, container, tal) {
  const rdDiv = document.createElement('div');
  const input = document.createElement('input');
  const label = document.createElement('label');
  input.type = 'text';
  input.value = rd;
  label.innerText = 'Rank Description:';
  input.addEventListener('change', e => {
    const ri = Array.from(container.children).indexOf(rdDiv);
    tal.ranksDesc[ri] = e.target.value;
  });

  const delBtn = document.createElement('button');
  delBtn.textContent = '❌';
  delBtn.addEventListener('click', () => {
    const ri = Array.from(container.children).indexOf(rdDiv);
    deleteRank(clsName, ti, idx, ri, rdDiv, container);
  });

  rdDiv.appendChild(label);
  rdDiv.appendChild(input);
  rdDiv.appendChild(delBtn);
  container.appendChild(rdDiv);
}

// --- CRUD / Add / Delete functions ---
function addClass() {
  let newName = 'NewClass';
  let counter = 1;
  while(TALENT_DATA.classes[newName]) newName = 'NewClass' + counter++;
  TALENT_DATA.classes[newName] = { pointsCap: 51, trees: [] };
  renderEditor();
  initClassSelect();
}

function deleteClass(clsName, classDiv) {
  if (!confirm("Delete Class?")) return;
  delete TALENT_DATA.classes[clsName];
  classDiv.remove();
  initClassSelect();
}

function addTree(clsName) {
  const tree = { id:'new-tree', name:'New Tree', ico:'', pointsCap:0, talents:[] };
  const clsData = TALENT_DATA.classes[clsName];
  clsData.trees.push(tree);
  const classBlock = getClassBlock(clsName);
  if(classBlock) renderTree(clsName, tree, clsData.trees.length-1, classBlock.querySelector('.trees'));
}

function deleteTree(clsName, ti, treeDiv) {
  if (!confirm("Delete Talent Tree?")) return;
  TALENT_DATA.classes[clsName].trees.splice(ti,1);
  treeDiv.remove();
}

function addTalent(clsName, ti, container) {
  const tal = { id:'new-talent', name:'New Talent', icon:'', row:0, col:0, maxRank:1, ranksDesc:['New Description'] };
  const tree = TALENT_DATA.classes[clsName].trees[ti];
  tree.talents.push(tal);
  renderTalent(clsName, ti, tal, tree.talents.length-1, container);
}

function deleteTalent(clsName, ti, idx, talentDiv) { 
  if (!confirm("Delete Talent?")) return;
  TALENT_DATA.classes[clsName].trees[ti].talents.splice(idx,1);
  talentDiv.remove();
}

function addRankDesc(clsName, ti, idx, container) {
  const tal = TALENT_DATA.classes[clsName].trees[ti].talents[idx];
  tal.ranksDesc.push('New Rank Description');
  renderRank(clsName, ti, idx, 'New Rank Description', container, tal);
}

function deleteRank(clsName, ti, idx, ri, rdDiv, container) { 
  TALENT_DATA.classes[clsName].trees[ti].talents[idx].ranksDesc.splice(ri,1); 
  rdDiv.remove();
}

// --- Save JS ---
function saveToDataJS() {
  const jsCode = "var TALENT_DATA = " + JSON.stringify(TALENT_DATA,null,2) + ";";
  const blob = new Blob([jsCode], {type:'application/javascript'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "data.js";
  a.click();
}
// --- Save JSON ---
function saveToJSON() {
  const json = JSON.stringify(TALENT_DATA, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "talent_data.json";
  a.click();
}


// --- Import JSON ---
function importDataJSON(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const jsonData = JSON.parse(e.target.result);

      if (jsonData.classes && jsonData.grid) {
        TALENT_DATA = jsonData;
        renderEditor();
        alert("JSON loaded successfully!");
		initClassSelect();
      } else {
        alert("Invalid JSON format!");
      }
    } catch (err) {
      alert("Error loading JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", e => {
  if (e.target.files.length > 0) {
    importDataJSON(e.target.files[0]);
  }
});

