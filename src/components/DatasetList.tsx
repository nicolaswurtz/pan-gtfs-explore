import type { ProcessedDataset } from '../types'
import { DatasetCard } from './DatasetCard'
import { exportToCsv } from '../utils/transform'

const PAGE_SIZE = 50

interface Props {
  datasets: ProcessedDataset[]
  page: number
  onPageChange: (p: number) => void
}

export function DatasetList({ datasets, page, onPageChange }: Props) {
  const total = datasets.length
  const pageCount = Math.ceil(total / PAGE_SIZE)
  const slice = datasets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="dataset-list">
      <div className="dataset-list__toolbar">
        <span className="dataset-list__info">
          {total === 0 ? 'Aucun résultat' : `${total} transporteur${total > 1 ? 's' : ''}`}
          {pageCount > 1 && ` — page ${page}/${pageCount}`}
        </span>
        {total > 0 && (
          <button className="btn btn--outline" onClick={() => exportToCsv(datasets)} type="button">
            ⬇ Export CSV
          </button>
        )}
      </div>

      <div className="dataset-list__items">
        {slice.map((d) => (
          <DatasetCard
            key={d.id}
            title={d.title}
            publisher_name={d.publisher_name}
            page_url={d.page_url}
            gtfs_resources={d.gtfs_resources}
            gtfs_rt_resources={d.gtfs_rt_resources}
          />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="pagination">
          <button
            className="btn btn--outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            ← Précédent
          </button>
          <span className="pagination__info">
            {page} / {pageCount}
          </span>
          <button
            className="btn btn--outline"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  )
}
