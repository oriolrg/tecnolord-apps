'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { assertTarget, parseArgs, apply, verify, readSqlFiles, guardConnection } = require('./prod-01');
const { compareManifests } = require('./manifest');
const { project } = require('../../backend/services/publicViewService');

const ROOT = path.resolve(__dirname, '../..');
const TARGET = 'meteo_prod_dryrun_20260930_211605';

function fakeClient({ mutation, lockAcquired = true, commitFailure = false, sharedLock, pauseBeforeLegacy } = {}) {
  const state = { migrated: false, committed: false, rolledBack: false, queries: [], lockAttempts: 0, lockHeld: false };
  let paused = false;
  const home = { id: 1, codi: 'home', nom: 'Casa', proveidor: 'ecowitt', activa: true,
    latitud: null, longitud: null, altitud_m: null };
  const client = {
    async query(sql, values = []) {
      state.queries.push(sql);
      if (sql === 'SELECT current_database() AS database') return { rows: [{database: TARGET}], rowCount: 1 };
      if (sql.startsWith('BEGIN') || sql.startsWith('SET LOCAL')) return {rows:[],rowCount:0};
      if (sql === 'SELECT pg_try_advisory_xact_lock($1,$2) AS acquired') {
        assert.deepEqual(values, [71010, 101]);
        state.lockAttempts += 1;
        const acquired = lockAcquired && !sharedLock?.held;
        state.lockHeld = acquired;
        if (acquired && sharedLock) sharedLock.held = true;
        return {rows:[{acquired}],rowCount:1};
      }
      if (sql === 'COMMIT') {
        if (commitFailure) throw new Error('synthetic commit failure');
        state.committed=true;
        if (sharedLock && state.lockHeld) sharedLock.held=false;
        state.lockHeld=false;
        return {rows:[],rowCount:0};
      }
      if (sql === 'ROLLBACK') {
        state.rolledBack=true;
        if (sharedLock && state.lockHeld) sharedLock.held=false;
        state.lockHeld=false;
        return {rows:[],rowCount:0};
      }
      if (sql === 'SELECT to_regclass($1) AS object') {
        if (pauseBeforeLegacy && !paused) { paused=true; await pauseBeforeLegacy(); }
        const isRc = ['auth.credentials','auth.sessions','auth.account_tokens','auth.user_preferences',
          'meteo.station_locations','meteo.station_connectors','meteo.connector_secrets',
          'meteo.source_bindings','meteo.current_snapshots','meteo.estimation_points',
          'meteo.public_view_config','meteo.import_batches','meteo.import_rows',
          'meteo.manual_overrides','meteo.audit_events','meteo.map_catalog_state',
          'meteo.station_history_policies','meteo.history_capture_runs'].includes(values[0]);
        return { rows:[{ object: isRc && !state.migrated ? null : values[0] }], rowCount:1 };
      }
      if (sql.includes('FROM pg_available_extensions')) return {rows:[{installed_version:null,default_version:'3.4.3'}],rowCount:1};
      if (sql.includes('WHERE id=1') && sql.includes('FROM meteo.estacions') && !sql.includes('CROSS JOIN')) {
        return {rows:[home],rowCount:1};
      }
      if (sql.includes('AS invalid') && sql.includes('meteo.forecast_run')) return {rows:[{invalid:false}],rowCount:1};
      if (sql.includes('FROM information_schema.columns') && sql.includes('WHERE (table_schema')) return {rows:[],rowCount:0};
      if (sql.includes("c.relkind IN ('r','p')")) return {rows:[{schema_name:'meteo',table_name:'mesures'}],rowCount:1};
      if (sql.includes("c.relkind='S'")) return {rows:[{schema_name:'meteo',sequence_name:'mesures_id_seq',
        owned_schema:'meteo',owned_table:'mesures',owned_column:'id'}],rowCount:1};
      if (sql.includes('SELECT column_name,data_type FROM information_schema.columns')) return {rows:[
        {column_name:'id',data_type:'bigint'},{column_name:'instant',data_type:'timestamp with time zone'}],rowCount:2};
      if (sql.includes('AS row_count')) return {rows:[{row_count: state.migrated && mutation === 'count' ? '6':'5',
        max_id:'9',sum_id:state.migrated && mutation === 'sum' ? '31':'30',min_instant:state.migrated && mutation === 'range' ? '2026-01-02 00:00:00+00':'2026-01-01 00:00:00+00',
        max_instant:'2026-01-03 00:00:00+00'}],rowCount:1};
      if (sql.includes('SELECT last_value::text,is_called FROM')) return {rows:[{
        last_value: state.migrated && mutation === 'sequence' ? '10001':'10000', is_called:true}],rowCount:1};
      if (sql.includes('FROM meteo.estacions_hidro h')) return {rows:[{id:1,codi:'riu',nom:'Riu',tipus:'riu',activa:true,
        readings:'2',first_reading:'2026-01-01 00:00:00+00',last_reading:'2026-01-02 00:00:00+00'}],rowCount:1};
      if (sql.includes('FROM meteo.estacions WHERE id=1 AND codi=')) return {rows:[home],rowCount:1};
      if (sql.includes('FROM meteo.estacions e CROSS JOIN meteo.public_view_config c')) return {
        rows:[{...home,management_kind:'LEGACY',lifecycle:'ACTIVE',visibility:'PUBLIC',owner_id:null,public_station_id:1}],rowCount:1};
      if (sql.includes('AS locations') && sql.includes('AS account_tokens')) return {rows:[{
        locations:'0',connectors:'0',secrets:'0',bindings:'0',snapshots:'0',policies:'0',
        history_runs:'0',estimates:'0',credentials:'0',sessions:'0',account_tokens:'0'}],rowCount:1};
      if (sql.includes('AS station_fk') && sql.includes('AS lookup_index')) return {rows:[{
        station_fk:true,hours_check:true,lookup_index:true}],rowCount:1};
      if (sql.includes('AS public_view') && sql.includes('AS map_state')) return {rows:[{
        public_view:'1',map_state:'1'}],rowCount:1};
      if (sql.includes("FROM pg_extension WHERE extname='postgis'")) return {rows:[{schema:'public'}],rowCount:1};
      if (sql.includes("UPDATE meteo.estacions SET visibility='PUBLIC'")) state.migrated=true;
      if (sql.startsWith('-- UE-T') || sql.startsWith('-- PROD-01')) return {rows:[],rowCount:0};
      throw new Error(`Unexpected SQL in test: ${sql.slice(0,100)}`);
    },
  };
  return {client,state};
}

test('target allowlist rejects wrong and partial-beta targets; production requires three explicit guards', () => {
  assert.equal(assertTarget(TARGET),TARGET);
  for (const value of [undefined,'','meteo_restore_test','meteo_beta','postgres','template0','template1','other']) {
    assert.throws(() => assertTarget(value));
  }
  assert.throws(() => assertTarget('meteo'));
  for (const forbidden of ['meteo_restore_test','meteo_beta','postgres','template0','template1']) {
    assert.throws(() => assertTarget(forbidden,{production:true,environment:{
      ALLOW_PRODUCTION:'PROD-01-APPLY-meteo',PRODUCTION_CONFIRM_TARGET:'meteo'}}));
  }
  assert.throws(() => assertTarget('meteo',{production:true,environment:{ALLOW_PRODUCTION:'PROD-01-APPLY-meteo'}}));
  assert.equal(assertTarget('meteo',{production:true,environment:{ALLOW_PRODUCTION:'PROD-01-APPLY-meteo',
    PRODUCTION_CONFIRM_TARGET:'meteo'}}),'meteo');
  assert.throws(() => parseArgs(['--apply','--out-dir','/tmp/prod01'],{}));
});

test('current_database guard rejects a connection to a different database', async () => {
  await assert.rejects(guardConnection({query:async () => ({rows:[{database:'meteo_beta'}]})},TARGET),
    /target guard failed/);
});

test('PRE is captured dynamically and POST compares the exact same table/sequence specs', async (t) => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'prod01-pass-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  const {client,state}=fakeClient();
  const result=await apply(client,{target:TARGET,outDir:dir});
  assert.equal(result.status,'PASS');
  assert.equal(state.committed,true);
  assert.equal(state.lockAttempts,1);
  const begin=state.queries.indexOf('BEGIN ISOLATION LEVEL REPEATABLE READ');
  assert.equal(state.queries[begin+1],'SELECT pg_try_advisory_xact_lock($1,$2) AS acquired');
  assert.equal(fs.existsSync(path.join(dir,'POST.pending.json')),false);
  const pre=JSON.parse(fs.readFileSync(path.join(dir,'PRE.json'),'utf8'));
  const post=JSON.parse(fs.readFileSync(path.join(dir,'POST.json'),'utf8'));
  assert.equal(pre.target,TARGET);
  assert.equal(pre.tables[0].stats.row_count,'5');
  assert.equal(pre.sequences[0].last_value,'10000');
  assert.equal(compareManifests(pre,post),true);
  assert.equal(state.queries.filter((sql) => sql.includes('SELECT last_value::text,is_called FROM')).length,2);
  assert.equal(state.queries.filter((sql) => sql==='SELECT current_database() AS database').length >= 8,true);
  const verified=await verify(client,{target:TARGET,prePath:path.join(dir,'PRE.json'),outDir:path.join(dir,'verify')});
  assert.equal(verified.verification,'PRE_POST_IDENTICAL');
});

test('VERIFY rejects a PRE artifact for a different target before read-only transaction', async (t) => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'prod01-pre-target-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  const prePath=path.join(dir,'PRE.json');
  fs.writeFileSync(prePath,JSON.stringify({version:1,target:'meteo_beta',tables:[],sequences:[],home:[],hydro:[]}));
  const {client,state}=fakeClient();
  state.migrated=true;
  await assert.rejects(verify(client,{target:TARGET,prePath,outDir:path.join(dir,'verify')}),/target\/version mismatch/);
  assert.equal(state.queries.some((sql) => sql.startsWith('BEGIN')),false);
});

for (const mutation of ['count','range','sum','sequence']) {
  test(`PRE/POST ${mutation} divergence fails and rolls back`, async (t) => {
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),`prod01-${mutation}-`));
    t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
    const {client,state}=fakeClient({mutation});
    await assert.rejects(apply(client,{target:TARGET,outDir:dir}),/PRE\/POST/);
    assert.equal(state.rolledBack,true);
    assert.equal(state.committed,false);
    assert.equal(fs.existsSync(path.join(dir,'PRE.json')),true);
    assert.equal(fs.existsSync(path.join(dir,'POST.json')),false);
    assert.equal(fs.existsSync(path.join(dir,'POST.pending.json')),false);
  });
}

test('unavailable transactional lock rolls back before PRE or migration', async (t) => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'prod01-lock-denied-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  const {client,state}=fakeClient({lockAcquired:false});
  await assert.rejects(apply(client,{target:TARGET,outDir:dir}),/advisory transaction lock unavailable/);
  assert.equal(state.rolledBack,true);
  assert.equal(state.committed,false);
  assert.equal(state.migrated,false);
  assert.equal(fs.existsSync(path.join(dir,'PRE.json')),false);
  assert.equal(fs.existsSync(path.join(dir,'POST.json')),false);
  assert.deepEqual(state.queries.slice(-2),[
    'SELECT pg_try_advisory_xact_lock($1,$2) AS acquired','ROLLBACK']);
});

test('only one concurrent APPLY can pass the transaction lock', async (t) => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'prod01-concurrent-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  const sharedLock={held:false};
  let signalEntered;
  let releaseFirst;
  const entered=new Promise((resolve) => { signalEntered=resolve; });
  const held=new Promise((resolve) => { releaseFirst=resolve; });
  const first=fakeClient({sharedLock,pauseBeforeLegacy:async () => { signalEntered(); await held; }});
  const firstApply=apply(first.client,{target:TARGET,outDir:path.join(dir,'first')});
  await entered;
  assert.equal(sharedLock.held,true);
  const second=fakeClient({sharedLock});
  try {
    await assert.rejects(apply(second.client,{target:TARGET,outDir:path.join(dir,'second')}),
      /advisory transaction lock unavailable/);
    assert.equal(second.state.rolledBack,true);
    assert.equal(second.state.migrated,false);
    assert.equal(fs.existsSync(path.join(dir,'second/PRE.json')),false);
  } finally {
    releaseFirst();
  }
  assert.equal((await firstApply).status,'PASS');
  assert.equal(first.state.committed,true);
  assert.equal(sharedLock.held,false);
});

test('failed COMMIT leaves pending evidence and never publishes POST.json', async (t) => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'prod01-commit-fail-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  const {client,state}=fakeClient({commitFailure:true});
  await assert.rejects(apply(client,{target:TARGET,outDir:dir}),/synthetic commit failure/);
  assert.equal(state.committed,false);
  assert.equal(state.rolledBack,true);
  assert.equal(fs.existsSync(path.join(dir,'PRE.json')),true);
  assert.equal(fs.existsSync(path.join(dir,'POST.pending.json')),true);
  assert.equal(fs.existsSync(path.join(dir,'POST.json')),false);
});

test('re-execution after a committed RC schema aborts before a new PRE', async (t) => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'prod01-reexec-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  const {client,state}=fakeClient();
  await apply(client,{target:TARGET,outDir:dir});
  await assert.rejects(apply(client,{target:TARGET,outDir:path.join(dir,'again')}),/already exists/);
  assert.equal(fs.existsSync(path.join(dir,'again/PRE.json')),false);
  assert.equal(state.rolledBack,true);
});

test('SQL is pinned, additive, free of fixed production snapshots and optional station inference', async () => {
  const files=await readSqlFiles();
  assert.deepEqual(files.map((item) => path.basename(item.relative)),[
    '0003-ue-identity-catalog.sql','0004-ue-station-metadata.sql','0005-ue-map-publication.sql',
    '0007-ue-station-history-policies.sql','forecast-compatibility.sql','home-public.sql']);
  for (const item of files) {
    assert.doesNotMatch(item.content,/^\s*(?:DELETE|TRUNCATE|DROP)\b/gmi,item.relative);
    assert.doesNotMatch(item.content,/count\(\*\)\s*=\s*[0-9]{2,}/i,item.relative);
    assert.doesNotMatch(item.content,/['"]20[0-9]{2}-[0-9]{2}-[0-9]{2}T/i,item.relative);
  }
  const homeSql=files.at(-1).content;
  assert.match(homeSql,/id=1 AND codi='home' AND nom='Casa' AND proveidor='ecowitt'/);
  assert.doesNotMatch(homeSql,/station_locations|station_connectors|source_bindings|connector_secrets/);
  assert.match(files.at(-2).content,/forecast_run_station_fk/);
  assert.match(files.at(-2).content,/forecast_run_hours_check/);
  assert.match(files.at(-2).content,/idx_forecast_run_lookup/);
});

test('LEGACY public home is eligible without location or owner credentials', () => {
  const result=project({public_id:'11111111-1111-4111-8111-111111111111',nom:'Casa',
    lifecycle:'ACTIVE',visibility:'PUBLIC',management_kind:'LEGACY',revision:0,
    account_status:null,actiu:null,internal_only:false,card_ids:['temperature']});
  assert.equal(result.station.name,'Casa');
  assert.deepEqual(result.card_ids,['temperature']);
});
