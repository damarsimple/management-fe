import { gql, useQuery } from "@apollo/client";
import { Container, Box, Typography, Avatar } from "@mui/material";
import DashboardLayout, { useTabs } from "components/DashboardLayout";
import { useModalStore } from "components/ModalUI";
import usePagination from "hooks/pagination";
import useSort from "hooks/sort";
import React from "react";
import { Favorite, Participation } from "type";
import DataView from "components/DataView";

export default function Participations() {
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
        participations: Participation[];
        count: number;
    }>(gql`
    query Medias($take: Int, $skip: Int, $table: Countable, $sortBy:ParticipationFields, $sortOrder: SortOrder) {
        participations(skip: $skip, take: $take, sortBy: $sortBy, sortOrder: $sortOrder) {
            id
            user{
                id
                name
                avatar
            }

            event{
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
            table: "Participation",
            sortBy,
            sortOrder
        }

    })


    return (
        <DashboardLayout headerName='Kunjungan' tabs={['List Kunjungan']}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <DataView<Participation>
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
                            label: "Acara",
                            key: "event",
                            render(item) {
                                return <Box display="flex" gap={2} alignItems="center">
                                    <Avatar src={item?.event.thumbnail?.url ?? ""} alt={item.id} />
                                    <Typography variant="body1">{item.event.name}</Typography>
                                </Box>
                            },
                        },
                        {
                            label: "Dibuat Pada",
                            key: "createdAt",
                        },
                    ]}
                    data={data?.participations || []}
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
