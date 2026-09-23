import { Group, Pagination, Text } from '@mantine/core'
import type { ListMeta } from '@/shared/api'
import classes from './ListPagination.module.css'

/* Rows per page for every admin list. Small enough that a page is scannable
   without scrolling far, and it divides evenly into the card grids. */
export const PAGE_SIZE = 12

interface ListPaginationProps {
  /** Absent until the first page has loaded. */
  meta: ListMeta | undefined
  page: number
  onPageChange: (page: number) => void
}

/**
 * Page controls plus a plain statement of what is on screen.
 *
 * Renders nothing when everything fits on one page: a single disabled "1"
 * is noise, and the count is already the number of rows above it.
 */
export function ListPagination({ meta, page, onPageChange }: ListPaginationProps) {
  if (!meta || meta.total_pages <= 1) return null

  const first = (page - 1) * meta.limit + 1
  const last = Math.min(page * meta.limit, meta.total)

  return (
    <Group justify="space-between" align="center" className={classes.root}>
      <Text fz={12} c="var(--vfl-gray-muted)" className="vfl-numeric">
        {first}&ndash;{last} of {meta.total}
      </Text>

      <Pagination
        value={page}
        onChange={onPageChange}
        total={meta.total_pages}
        radius={0}
        withEdges
        /* One neighbour each side keeps the control the same width whether
           there are three pages or thirty. */
        siblings={1}
        classNames={{ control: classes.control }}
      />
    </Group>
  )
}
