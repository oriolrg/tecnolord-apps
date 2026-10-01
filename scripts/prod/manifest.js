'use strict';

const assert = require('node:assert/strict');

const PROTECTED_SCHEMAS = ['auth', 'biblioteca', 'hidro', 'legacy', 'meteo'];
const TEMPORAL_TYPES = new Set(['date', 'timestamp without time zone', 'timestamp with time zone']);
const NUMERIC_TYPES = new Set(['smallint', 'integer', 'bigint', 'numeric', 'real', 'double precision']);

function ident(value) {
  if (typeof value !== 'string' || !value || value.includes('\0')) throw new Error('Invalid catalog identifier');
  return `"${value.replaceAll('"', '""')}"`;
}

function qualified(schema, name) { return `${ident(schema)}.${ident(name)}`; }

function compareManifests(pre, post) {
  assert.equal(post.target, pre.target, 'PRE/POST target changed');
  for (const key of ['tables', 'sequences', 'hydro', 'home']) {
    assert.deepStrictEqual(post[key], pre[key], `PRE/POST ${key} diverged`);
  }
  return true;
}

async function discoverTables(client) {
  const result = await client.query(`
    SELECT n.nspname AS schema_name,c.relname AS table_name
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relkind IN ('r','p')
      AND (n.nspname = ANY($1::text[]) OR (n.nspname='public' AND c.relname='measurement'))
    ORDER BY n.nspname,c.relname`, [PROTECTED_SCHEMAS]);
  return result.rows;
}

async function discoverSequences(client) {
  const result = await client.query(`
    SELECT n.nspname AS schema_name,c.relname AS sequence_name,
      rn.nspname AS owned_schema,rc.relname AS owned_table,a.attname AS owned_column
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    LEFT JOIN pg_depend d ON d.classid='pg_class'::regclass AND d.objid=c.oid
      AND d.refclassid='pg_class'::regclass AND d.deptype IN ('a','i')
    LEFT JOIN pg_class rc ON rc.oid=d.refobjid
    LEFT JOIN pg_namespace rn ON rn.oid=rc.relnamespace
    LEFT JOIN pg_attribute a ON a.attrelid=rc.oid AND a.attnum=d.refobjsubid
    WHERE c.relkind='S'
      AND (n.nspname = ANY($1::text[]) OR n.nspname='public')
    ORDER BY n.nspname,c.relname`, [PROTECTED_SCHEMAS]);
  return result.rows;
}

async function discoverColumns(client, schema, table) {
  const result = await client.query(`
    SELECT column_name,data_type FROM information_schema.columns
    WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`, [schema, table]);
  return result.rows;
}

async function collectManifest(client, target, specs) {
  const tableSpecs = specs?.tables || await discoverTables(client);
  const sequenceSpecs = specs?.sequences || await discoverSequences(client);
  const tables = [];
  for (const table of tableSpecs) {
    const columns = table.columns || await discoverColumns(client, table.schema_name, table.table_name);
    const timeColumns = columns.filter((column) => TEMPORAL_TYPES.has(column.data_type)).map((column) => column.column_name);
    const hasNumericId = columns.some((column) => column.column_name === 'id' && NUMERIC_TYPES.has(column.data_type));
    const select = ['count(*)::text AS row_count'];
    if (hasNumericId) select.push('max("id")::text AS max_id');
    for (const column of columns.filter((item) => NUMERIC_TYPES.has(item.data_type))) {
      select.push(`sum(${ident(column.column_name)}::numeric)::text AS ${ident(`sum_${column.column_name}`)}`);
    }
    for (const column of timeColumns) {
      select.push(`min(${ident(column)})::text AS ${ident(`min_${column}`)}`);
      select.push(`max(${ident(column)})::text AS ${ident(`max_${column}`)}`);
    }
    const result = await client.query(`SELECT ${select.join(',')} FROM ${qualified(table.schema_name,table.table_name)}`);
    tables.push({ schema_name: table.schema_name, table_name: table.table_name, columns, stats: result.rows[0] });
  }
  const currentSequences = await discoverSequences(client);
  const currentByName = new Map(currentSequences.map((seq) => [`${seq.schema_name}.${seq.sequence_name}`, seq]));
  const sequences = [];
  for (const seq of sequenceSpecs) {
    const current = currentByName.get(`${seq.schema_name}.${seq.sequence_name}`);
    if (!current) throw new Error(`Legacy sequence disappeared: ${seq.schema_name}.${seq.sequence_name}`);
    const result = await client.query(`SELECT last_value::text,is_called FROM ${qualified(seq.schema_name,seq.sequence_name)}`);
    sequences.push({ ...current, last_value: result.rows[0].last_value, is_called: result.rows[0].is_called });
  }
  const home = (await client.query(`
    SELECT id,codi,nom,proveidor,activa,latitud,longitud,altitud_m
    FROM meteo.estacions WHERE id=1 AND codi='home'`)).rows;
  const hydro = (await client.query(`
    SELECT h.id,h.codi,h.nom,h.tipus,h.activa,count(l.id)::text AS readings,
      min(l.instant)::text AS first_reading,max(l.instant)::text AS last_reading
    FROM meteo.estacions_hidro h LEFT JOIN meteo.lectures_hidro l ON l.estacio_id=h.id
    GROUP BY h.id,h.codi,h.nom,h.tipus,h.activa ORDER BY h.id`)).rows;
  return { version: 1, target, collected_at: new Date().toISOString(),
    tables, sequences, home, hydro };
}

function specsFromManifest(manifest) {
  return { tables: manifest.tables.map(({schema_name,table_name,columns}) => ({schema_name,table_name,columns})),
    sequences: manifest.sequences.map(({schema_name,sequence_name,owned_schema,owned_table,owned_column}) =>
      ({schema_name,sequence_name,owned_schema,owned_table,owned_column})) };
}

module.exports = { collectManifest, compareManifests, discoverTables, discoverSequences,
  ident, qualified, specsFromManifest };
