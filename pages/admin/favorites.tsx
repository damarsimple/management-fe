import { gql, useQuery } from "@apollo/client";
import { Container, Box, Typography, Avatar } from "@mui/material";
import DashboardLayout, { useTabs } from "components/DashboardLayout";
import { useModalStore } from "components/ModalUI";
import usePagination from "hooks/pagination";
import useSort from "hooks/sort";
import React from "react";
import { Favorite } from "type";
import DataView from "components/DataView";

export default function Favorites() {
    const { value, setValue } = useTabs();
    const {
        openWithChildren,
        close
    } = useModalStore();

    const {
        page,
        limit,
        handleLimitChange,
        handlePageChange,
    } = usePagination();
    const {
        sortBy,
        sortOrder,
        handleSortChange,
        handleSortOrderChange
    } = useSort();



    const {
        data,
        refetch
    } = useQuery<{
        favorites: Favorite[];
        count: number;
    }>(gql`
    query Medias($take: Int, $skip: Int, $table: Countable, $sortBy:FavoriteFields, $sortOrder: SortOrder) {
        favorites(skip: $skip, take: $take, sortBy: $sortBy, sortOrder: $sortOrder) {
            id
            user{
                id
                name
                avatar
            }

            place{
                id
                name
                thumbnail{
                    url
                }
            }
            
            updatedAt
            createdAt
       
        }
        count(table: $table)
      }`, {

        variables: {
            take: limit,
            skip: page * limit,
            table: "Favorite",
            sortBy,
            sortOrder
        }

    })


    return (
        <DashboardLayout headerName='Favorite' tabs={['List Favorite']}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <DataView<Favorite>
                    handleOrderChange={handleSortOrderChange}
                    handleSortChange={handleSortChange}
                    cardRenderMap={{
                        title: 'user.name',
                        subtitle: 'place.name',
                        image: 'place.thumbnail.url',
                    }}
                    definition={[
                        {
                            label: "ID",
                            key: "id",
                        },
                        {
                            label: "Pengguna",
                            key: "user",
                            render(item) {
                                return <Box display="flex" gap={2} alignItems="center">
                                    <Avatar src={item?.user.avatar ?? ""} alt={item.id} />
                                    <Typography variant="body1">{item.user.name}</Typography>
                                </Box>
                            },
                        },
                        {
                            label: "Tempat",
                            key: "place",
                            render(item) {
                                return <Box display="flex" gap={2} alignItems="center">
                                    <Avatar src={item?.place.thumbnail?.url ?? ""} alt={item.id} />
                                    <Typography variant="body1">{item.place.name}</Typography>
                                </Box>
                            },
                        },
                        {
                            label: "Dibuat Pada",
                            key: "createdAt",
                        },
                    ]}
                    data={data?.favorites || []}
                    total={data?.count || 0}
                    onPageChange={(page) => {
                        handlePageChange(page);
                    }}
                    onRowsPerPageChange={(rowsPerPage) => {
                        handleLimitChange(rowsPerPage);
                    }}
                    page={page}
                    rowsPerPage={limit}

                />
            </Container>
        </DashboardLayout>
    )
}
