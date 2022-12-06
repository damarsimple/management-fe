
import React from 'react'

export default function usePagination() {

    const [page, setPage] = React.useState(0)
    const [limit, setLimit] = React.useState(10)

    const handlePageChange = (value: number) => {
        setPage(value)
    }

    const handleLimitChange = (value: number) => {
        setLimit(value)
    }

    return {
        page,
        limit,
        handlePageChange,
        handleLimitChange
    }

}
