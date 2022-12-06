
import { useState } from 'react'

export default function useSort() {

    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<string | null>(null);

    const handleSortChange = (value: string) => {
        setSortBy(value)
    }

    const handleSortOrderChange = (value: 'asc' | 'desc') => {
        setSortOrder(value)
    }

    return {
        sortBy,
        sortOrder,
        handleSortChange,
        handleSortOrderChange
    }

}
