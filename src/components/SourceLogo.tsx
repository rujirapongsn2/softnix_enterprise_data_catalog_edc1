// Official product logos for source types. Files live in public/logos (see docs/logo-credits.md).
import type { ReactNode } from 'react'

const BASE = '/logos/'

// Ordered: first keyword found in the source id/kind wins.
const LOGOS: [RegExp, string, string][] = [
  [/iceberg/i, 'iceberg.svg', 'Apache Iceberg'],
  [/hive/i, 'hive.svg', 'Apache Hive'],
  [/trino/i, 'trino.svg', 'Trino'],
  [/openlineage/i, 'openlineage.svg', 'OpenLineage'],
  [/postgres/i, 'postgresql.svg', 'PostgreSQL'],
  [/mysql/i, 'mysql.svg', 'MySQL'],
  [/mariadb/i, 'mariadb.svg', 'MariaDB'],
  [/oracle/i, 'oracle.svg', 'Oracle'],
  [/sql ?server|mssql/i, 'sqlserver.svg', 'Microsoft SQL Server'],
  [/snowflake/i, 'snowflake.svg', 'Snowflake'],
  [/bigquery/i, 'bigquery.svg', 'Google BigQuery'],
  [/databricks/i, 'databricks.svg', 'Databricks'],
  [/\bs3\b/i, 's3.svg', 'Amazon S3'],
  [/minio/i, 'minio.svg', 'MinIO'],
  [/power ?bi/i, 'powerbi.svg', 'Power BI'],
  [/tableau/i, 'tableau.svg', 'Tableau'],
  [/openapi|rest api|^api$/i, 'openapi.svg', 'OpenAPI'],
]

export function sourceLogo(key: string): { src: string; alt: string } | undefined {
  const hit = LOGOS.find(([re]) => re.test(key))
  return hit && { src: BASE + hit[1], alt: hit[2] }
}

/** Logo in a white rounded tile; falls back to `fallback` (e.g. a lucide icon or letter badge) when no logo is known. */
export function SourceLogo({ kind, size = 32, fallback, bare }: { kind: string; size?: number; fallback?: ReactNode; bare?: boolean }) {
  const logo = sourceLogo(kind)
  if (!logo) return <>{fallback}</>
  if (bare) return <img className="src-logo-bare" src={logo.src} alt={logo.alt} title={logo.alt} width={size} height={size} />
  return (
    <span className="src-logo" style={{ width: size, height: size }} title={logo.alt}>
      <img src={logo.src} alt={logo.alt} width={Math.round(size * 0.7)} height={Math.round(size * 0.7)} loading="lazy" />
    </span>
  )
}
