import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PatientPaginationProps {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  onPageChange: (page: number) => void
}

export default function PatientPagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  hasNext,
  hasPrevious,
  onPageChange,
}: PatientPaginationProps) {
  // Calculate which page numbers to show (max 5)
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is 5 or less
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show current page and 2 pages on each side
      let start = Math.max(0, currentPage - 2)
      let end = Math.min(totalPages - 1, currentPage + 2)

      // Adjust if we're near the beginning or end
      if (currentPage < 2) {
        end = Math.min(totalPages - 1, 4)
      } else if (currentPage > totalPages - 3) {
        start = Math.max(0, totalPages - 5)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements)

  if (totalPages === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalElements}</span> patients
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-[2.5rem]"
            >
              {page + 1}
            </Button>
          ))}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
