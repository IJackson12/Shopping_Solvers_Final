const $ = id => document.getElementById(id);
const NUMERIC = ['Administrative','Administrative_Duration','Informational','Informational_Duration','ProductRelated','ProductRelated_Duration','BounceRates','ExitRates','SpecialDay'];
const CATEGORICAL = ['Month','OperatingSystems','Browser','Region','TrafficType','VisitorType','Weekend'];
const ALL_FEATURES = [...NUMERIC,'PageValues',...CATEGORICAL];
const EARLY_FEATURES = [...NUMERIC,...CATEGORICAL];
const MAX_DEPTH = 4;
const MIN_LEAF = 45;
const SEED = 42;
const pct = n => (100*n).toFixed(2)+'%';
function seededShuffle(items, seed) {
  const a = items.slice(); let state = seed >>> 0;
  for (let i=a.length-1;i>0;i--) {
    state = (1664525*state + 1013904223) >>> 0;
    const j = state % (i+1); [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function stratifiedSplit(rows) {
  const no = rows.filter(r=>r.label===0), yes = rows.filter(r=>r.label===1);
  const noTest = seededShuffle(no,SEED).slice(0,Math.round(no.length*.2));
  const yesTest = seededShuffle(yes,SEED+1).slice(0,Math.round(yes.length*.2));
  const testSet = new Set([...noTest,...yesTest]);
  return {train:rows.filter(r=>!testSet.has(r)),test:rows.filter(r=>testSet.has(r))};
}
function cleanNumber(v) { const n=Number(v); return Number.isFinite(n)?n:0; }
function featureNames(rows, features) {
  const names=[];
  features.forEach(f=>{
    if (CATEGORICAL.includes(f)) {
      const vals=[...new Set(rows.map(r=>String(r[f]??'Unknown')))].sort();
      vals.forEach(v=>names.push({name:f+' = '+v,field:f,value:v,type:'category'}));
    } else names.push({name:f,field:f,type:'numeric'});
  });
  return names;
}
function vectorize(row, specs) {
  return specs.map(s=>s.type==='category'?(String(row[s.field]??'Unknown')===s.value?1:0):cleanNumber(row[s.field]));
}
function weightedGini(pos,neg,totalPos,totalNeg) {
  if (!pos&&!neg) return 0;
  const wp = totalPos ? pos/totalPos : 0;
  const wn = totalNeg ? neg/totalNeg : 0;
  const sum=wp+wn;
  if (!sum) return 0;
  const p=wp/sum,n=wn/sum;
  return 1-p*p-n*n;
}
function trainTree(X,y,specs) {
  const totalPos=y.reduce((a,b)=>a+b,0), totalNeg=y.length-totalPos;
  const importance=new Array(specs.length).fill(0);
  function build(indices,depth) {
    let pos=0; indices.forEach(i=>pos+=y[i]); const neg=indices.length-pos;
    const weightedPos=pos/Math.max(1,totalPos), weightedNeg=neg/Math.max(1,totalNeg);
    const prob=weightedPos/(weightedPos+weightedNeg||1);
    const node={count:indices.length,pos,neg,prob,prediction:prob>=.5?1:0,depth};
    if(depth>=MAX_DEPTH||indices.length<MIN_LEAF*2||pos===0||neg===0) return node;
    const parent=weightedGini(pos,neg,totalPos,totalNeg);
    let best=null;
    for(let f=0;f<specs.length;f++){
      const sorted=indices.map(i=>({v:X[i][f],y:y[i],i})).sort((a,b)=>a.v-b.v);
      let leftPos=0,leftNeg=0;
      for(let k=0;k<sorted.length-1;k++){
        if(sorted[k].y) leftPos++; else leftNeg++;
        const leftN=k+1,rightN=sorted.length-leftN;
        if(leftN<MIN_LEAF||rightN<MIN_LEAF||sorted[k].v===sorted[k+1].v) continue;
        const rightPos=pos-leftPos,rightNeg=neg-leftNeg;
        const child=(leftN/indices.length)*weightedGini(leftPos,leftNeg,totalPos,totalNeg)+(rightN/indices.length)*weightedGini(rightPos,rightNeg,totalPos,totalNeg);
        const gain=parent-child;
        if(!best||gain>best.gain) best={feature:f,threshold:(sorted[k].v+sorted[k+1].v)/2,gain};
      }
    }
    if(!best||best.gain<0.00015) return node;
    const left=[],right=[];
    indices.forEach(i=>(X[i][best.feature]<=best.threshold?left:right).push(i));
    if(left.length<MIN_LEAF||right.length<MIN_LEAF) return node;
    node.feature=best.feature;node.threshold=best.threshold;node.gain=best.gain;
    importance[best.feature]+=best.gain*indices.length/y.length;
    node.left=build(left,depth+1);node.right=build(right,depth+1);
    return node;
  }
  const root=build(y.map((_,i)=>i),0);
  const sum=importance.reduce((a,b)=>a+b,0);
  return {root,importance:importance.map(v=>sum?v/sum:0),specs};
}
function predictOne(tree,x) {
  let n=tree.root;
  while(n.feature!==undefined) n=x[n.feature]<=n.threshold?n.left:n.right;
  return {label:n.prediction,probability:n.prob,count:n.count};
}
function evaluate(tree,X,y) {
  let tp=0,tn=0,fp=0,fn=0;
  X.forEach((x,i)=>{const p=predictOne(tree,x).label;if(p===1&&y[i]===1)tp++;else if(p===0&&y[i]===0)tn++;else if(p===1)fp++;else fn++;});
  const div=(a,b)=>b?a/b:0, accuracy=(tp+tn)/(tp+tn+fp+fn);
  const precision=div(tp,tp+fp),recall=div(tp,tp+fn),specificity=div(tn,tn+fp),f1=div(2*precision*recall,precision+recall);
  return {tp,tn,fp,fn,accuracy,precision,recall,specificity,f1};
}
function matrixHtml(m) {
  return '<table class="confusion"><thead><tr><th>Actual / Predicted</th><th>No purchase</th><th>Purchase</th></tr></thead><tbody><tr><th>No purchase</th><td>'+m.tn.toLocaleString()+'</td><td>'+m.fp.toLocaleString()+'</td></tr><tr><th>Purchase</th><td>'+m.fn.toLocaleString()+'</td><td>'+m.tp.toLocaleString()+'</td></tr></tbody></table>';
}
function metricBars(m) {
  return [['Precision',m.precision],['Recall',m.recall],['F1-score',m.f1],['Specificity',m.specificity]].map(([n,v])=>'<div class="model-bar-row"><span>'+n+'</span><div class="model-track"><div class="model-fill blue" style="width:'+(v*100)+'%"></div></div><strong>'+pct(v)+'</strong></div>').join('');
}
function importanceBars(tree) {
  return tree.importance.map((v,i)=>({name:tree.specs[i].name,value:v})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value).slice(0,10).map(x=>'<div class="model-bar-row"><span>'+x.name+'</span><div class="model-track"><div class="model-fill" style="width:'+(x.value*100)+'%"></div></div><strong>'+pct(x.value)+'</strong></div>').join('')||'<p class="model-small">No splits were selected by this tree.</p>';
}
function ruleText(specs, node) {
  if(node.feature===undefined) return 'Predict '+(node.prediction?'Purchase':'No purchase')+' · '+node.count.toLocaleString()+' training sessions · estimated purchase probability '+pct(node.prob);
  return specs[node.feature].name+' ≤ '+node.threshold.toFixed(4)+'? · '+node.count.toLocaleString()+' sessions';
}
function treeHtml(specs,node,prefix='') {
  const leaf=node.feature===undefined;
  let html='<div class="tree-node '+(leaf?'leaf':'')+'" style="margin-left:'+(node.depth*13)+'px">'+ruleText(specs,node)+'</div>';
  if(!leaf) html+=treeHtml(specs,node.left)+treeHtml(specs,node.right);
  return html;
}
function showModel(prefix,tree,metrics) {
  $(prefix+'Accuracy').textContent=pct(metrics.accuracy);
  $(prefix+'F1').textContent=pct(metrics.f1);
  $(prefix+'Matrix').innerHTML=matrixHtml(metrics);
  $(prefix+'Metrics').innerHTML=metricBars(metrics);
  $(prefix+'Importance').innerHTML=importanceBars(tree);
  $(prefix+'Tree').innerHTML=treeHtml(tree.specs,tree.root);
}
async function init() {
  try {
    const response=await fetch('online_shoppers_intention.csv');
    if(!response.ok) throw new Error('CSV request failed ('+response.status+')');
    const csv=await response.text();
    const parsed=Papa.parse(csv,{header:true,skipEmptyLines:true,dynamicTyping:false});
    const rows=parsed.data.filter(r=>r.Revenue!==undefined&&r.Revenue!=='');
    if(!rows.length) throw new Error('No session rows were found in the CSV.');
    rows.forEach(r=>r.label=String(r.Revenue).trim().toUpperCase()==='TRUE'?1:0);
    const split=stratifiedSplit(rows);
    const train=split.train,test=split.test;
    const yTrain=train.map(r=>r.label),yTest=test.map(r=>r.label);
    const fullSpecs=featureNames(train,ALL_FEATURES),earlySpecs=featureNames(train,EARLY_FEATURES);
    const fullX=train.map(r=>vectorize(r,fullSpecs)),fullTest=test.map(r=>vectorize(r,fullSpecs));
    const earlyX=train.map(r=>vectorize(r,earlySpecs)),earlyTest=test.map(r=>vectorize(r,earlySpecs));
    const fullTree=trainTree(fullX,yTrain,fullSpecs),earlyTree=trainTree(earlyX,yTrain,earlySpecs);
    const fullMetrics=evaluate(fullTree,fullTest,yTest),earlyMetrics=evaluate(earlyTree,earlyTest,yTest);
    const buys=yTest.reduce((a,b)=>a+b,0),baseline=Math.max(buys,yTest.length-buys)/yTest.length;
    $('trainCount').textContent=train.length.toLocaleString();$('testCount').textContent=test.length.toLocaleString();
    $('testPurchaseRate').textContent=pct(buys/yTest.length);$('baselineAccuracy').textContent=pct(baseline);
    showModel('full',fullTree,fullMetrics);showModel('early',earlyTree,earlyMetrics);
    $('modelStatus').textContent='Experiment complete. Loaded '+rows.length.toLocaleString()+' sessions; trained on '+train.length.toLocaleString()+' and evaluated on '+test.length.toLocaleString()+' held-out sessions. Fixed random seed: '+SEED+'.';
  } catch(e) {
    $('modelStatus').textContent='The model could not load. '+e.message+' Check that online_shoppers_intention.csv is in the repository root and the page is published.';
    console.error(e);
  }
}
init();